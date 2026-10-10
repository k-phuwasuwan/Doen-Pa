export interface ImageFile {
  name: string;
  type: string;
  size: number;
}
export interface ImportedImage {
  name: string;
  dataUrl: string;
}
export interface ImageImportError {
  filename: string;
  message: string;
}
export interface ImagePolicy {
  maxBytes: number;
  sizeMessage: string;
}
export const RECORD_PHOTO_LIMIT = 5;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPTED_TYPES = new Set(IMAGE_ACCEPT.split(","));
export const RECORD_IMAGE_POLICY: ImagePolicy = {
  maxBytes: 5 * 1024 * 1024,
  sizeMessage: "ไฟล์ต้องไม่เกิน 5 MB",
};
export const PROFILE_IMAGE_POLICY: ImagePolicy = {
  maxBytes: 1024 * 1024,
  sizeMessage: "รูปภาพต้องมีขนาดไม่เกิน 1 MB เพื่อเก็บไว้ในเบราว์เซอร์",
};
const EMPTY_PENDING: string[] = [];

/** Owns validation, pending state and latest-selection wins at each image slot. */
export function createImageImporter<F extends ImageFile>(read: (file: F) => Promise<string>) {
  const jobs = new Map<string, symbol>();
  const listeners = new Set<() => void>();
  let pending = EMPTY_PENDING;
  function publish() {
    pending = [...jobs.keys()];
    for (const listener of listeners) listener();
  }
  return {
    getSnapshot: () => pending,
    getServerSnapshot: () => EMPTY_PENDING,
    isPending: () => jobs.size > 0,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    cancelAll() {
      jobs.clear();
      publish();
    },
    async importImages(slot: string, files: readonly F[], policy: ImagePolicy,
      commit: (result: { images: ImportedImage[]; errors: ImageImportError[] }) => void) {
      const job = Symbol(slot);
      jobs.set(slot, job);
      publish();
      try {
        const results = await Promise.all(files.map(async (file): Promise<ImportedImage | ImageImportError> => {
          if (!ACCEPTED_TYPES.has(file.type)) return { filename: file.name, message: "รองรับเฉพาะ JPG, PNG, WebP" };
          if (file.size > policy.maxBytes) return { filename: file.name, message: policy.sizeMessage };
          try {
            return { name: file.name, dataUrl: await read(file) };
          } catch {
            return { filename: file.name, message: "อ่านไฟล์ไม่ได้ กรุณาลองใหม่" };
          }
        }));
        if (jobs.get(slot) !== job) return;
        const images: ImportedImage[] = [];
        const errors: ImageImportError[] = [];
        for (const result of results) {
          if ("dataUrl" in result) images.push(result);
          else errors.push(result);
        }
        commit({ images, errors });
      } finally {
        if (jobs.get(slot) === job) {
          jobs.delete(slot);
          publish();
        }
      }
    },
  };
}

export function readBrowserImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image data"));
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.onabort = () => reject(new Error("Image read aborted"));
    reader.readAsDataURL(file);
  });
}
export type ImageImporter = ReturnType<typeof createImageImporter<File>>;
