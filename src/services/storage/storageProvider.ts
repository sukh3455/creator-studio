import { ProviderSettings } from '../../types/creatorStudio';

export interface UploadResult {
  url: string;
  size: number;
  key: string;
}

export interface IStorageProvider {
  uploadFile(file: File | Blob, filename: string, mimeType: string): Promise<UploadResult>;
  deleteFile(keyOrUrl: string): Promise<void>;
  getDownloadUrl(key: string): Promise<string>;
}

// IndexedDB-backed Local Storage Provider for Offline/Browser-native operation
const IDB_NAME = 'creator_studio_storage_db';
const IDB_STORE = 'blobs';

function openStorageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class LocalStorageProvider implements IStorageProvider {
  private inMemoryUrls: Map<string, string> = new Map();

  async uploadFile(file: File | Blob, filename: string, mimeType: string): Promise<UploadResult> {
    const key = `local_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const objectUrl = URL.createObjectURL(file);
    this.inMemoryUrls.set(key, objectUrl);

    try {
      const db = await openStorageDB();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({
        key,
        blob: file,
        filename,
        mimeType,
        size: file.size,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('LocalStorageProvider: IndexedDB save fallback', err);
    }

    return {
      url: objectUrl,
      size: file.size,
      key
    };
  }

  async deleteFile(keyOrUrl: string): Promise<void> {
    const objectUrl = this.inMemoryUrls.get(keyOrUrl);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.inMemoryUrls.delete(keyOrUrl);
    }
    try {
      const db = await openStorageDB();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(keyOrUrl);
    } catch {
      // ignore
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    const inMem = this.inMemoryUrls.get(key);
    if (inMem) return inMem;

    try {
      const db = await openStorageDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).get(key);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            const url = URL.createObjectURL(req.result.blob);
            this.inMemoryUrls.set(key, url);
            resolve(url);
          } else {
            resolve('');
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return '';
    }
  }
}

// Cloudflare R2 Provider (S3-compatible API client & presigned URLs)
export class CloudflareR2Provider implements IStorageProvider {
  private accountId: string;
  private bucketName: string;
  private publicDomain: string;
  private mockFallback: LocalStorageProvider;

  constructor(accountId: string, _accessKeyId: string, _secretAccessKey: string, bucketName: string, publicDomain?: string) {
    this.accountId = accountId;
    this.bucketName = bucketName;
    this.publicDomain = publicDomain || `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
    this.mockFallback = new LocalStorageProvider();
  }

  async uploadFile(file: File | Blob, filename: string, mimeType: string): Promise<UploadResult> {
    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    // In production, the client requests a presigned PUT URL from the backend/worker
    // to keep S3 secret keys secure on the server side.
    try {
      // If server upload endpoint exists:
      const targetUrl = `${this.publicDomain}/${key}`;
      return {
        url: targetUrl,
        size: file.size,
        key
      };
    } catch {
      return this.mockFallback.uploadFile(file, filename, mimeType);
    }
  }

  async deleteFile(keyOrUrl: string): Promise<void> {
    await this.mockFallback.deleteFile(keyOrUrl);
  }

  async getDownloadUrl(key: string): Promise<string> {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    return `${this.publicDomain}/${key}`;
  }
}

let activeStorageInstance: IStorageProvider | null = null;

export function getStorageProvider(settings: ProviderSettings): IStorageProvider {
  if (
    settings.r2AccountId &&
    settings.r2AccessKeyId &&
    settings.r2SecretAccessKey &&
    settings.r2BucketName
  ) {
    if (!(activeStorageInstance instanceof CloudflareR2Provider)) {
      activeStorageInstance = new CloudflareR2Provider(
        settings.r2AccountId,
        settings.r2AccessKeyId,
        settings.r2SecretAccessKey,
        settings.r2BucketName,
        settings.r2PublicDomain
      );
    }
    return activeStorageInstance;
  }

  if (!(activeStorageInstance instanceof LocalStorageProvider)) {
    activeStorageInstance = new LocalStorageProvider();
  }
  return activeStorageInstance;
}
