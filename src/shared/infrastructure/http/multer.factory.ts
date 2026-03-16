import path from "path";
import multer from "multer";

const ACCEPTED_MIME_TYPES = /^image\/(jpeg|png|gif|webp)$/;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const createMulterUpload = (uploadsDir: string) =>
  multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (ACCEPTED_MIME_TYPES.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, PNG, GIF, and WebP images are accepted."));
      }
    },
  });
