export interface VoiceOption {
  index: number;
  name: string;
  lang: string;
  isDefault: boolean;
}

export function loadBrowserVoices(callback: (voices: VoiceOption[]) => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callback([]);
    return () => {};
  }

  const update = () => {
    const rawVoices = window.speechSynthesis.getVoices();
    const options: VoiceOption[] = rawVoices.map((v, i) => ({
      index: i,
      name: v.name,
      lang: v.lang,
      isDefault: v.default
    }));
    callback(options);
  };

  update();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
  }

  // Backup check in case voices load after initial mount
  const timer = setTimeout(update, 500);

  return () => {
    clearTimeout(timer);
    if (window.speechSynthesis.onvoiceschanged === update) {
      window.speechSynthesis.onvoiceschanged = null;
    }
  };
}
