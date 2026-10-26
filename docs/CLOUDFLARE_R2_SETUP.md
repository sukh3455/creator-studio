# Cloudflare R2 Media Storage Setup Guide

Cloudflare R2 provides S3-compatible, zero-egress fee object storage for user-uploaded videos, logos, audio tracks, and rendered MP4 outputs.

---

## 1. Create a Cloudflare Account & Enable R2

1. Visit [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and log in or create an account.
2. In the left navigation menu, select **R2 Object Storage**.
3. If not already active, enable R2 on your account (Cloudflare offers 10 GB/month free storage with zero egress charges).

---

## 2. Create an R2 Bucket

1. In the R2 Overview page, click **Create bucket**.
2. Bucket name: `creator-studio-media` (or your preferred name).
3. Location: Choose **Automatic** or select your closest geographic region.
4. Click **Create Bucket**.

---

## 3. Generate S3-Compatible API Credentials

1. On the R2 Overview page, click **Manage R2 API Tokens** on the right side.
2. Click **Create API Token**.
3. Permissions: Select **Object Read & Write**.
4. Specify bucket: Apply to `creator-studio-media` (or all buckets).
5. TTL: Set to **Forever** or your preferred duration.
6. Click **Create API Token**.
7. Copy the generated credentials:
   - **Account ID** (found in your Cloudflare dashboard URL or on the R2 overview page).
   - **Access Key ID**.
   - **Secret Access Key**.

---

## 4. Configure in Creator Studio

In Creator Studio **Settings Modal > Cloudflare R2** or in `.env.local`:
```env
VITE_R2_ACCOUNT_ID=<your-cloudflare-account-id>
VITE_R2_ACCESS_KEY_ID=<your-access-key-id>
VITE_R2_SECRET_ACCESS_KEY=<your-secret-access-key>
VITE_R2_BUCKET_NAME=creator-studio-media
VITE_R2_PUBLIC_DOMAIN=https://<your-custom-domain-or-r2-url>
```
