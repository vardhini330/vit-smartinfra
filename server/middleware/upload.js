import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
const complaintsDir = path.join(uploadsDir, 'complaints');

[uploadsDir, complaintsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, complaintsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype?.includes('audio') ? '.webm' : '.jpg');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

export const uploadComplaintFiles = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)|^audio\//;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and audio allowed'));
  },
}).fields([
  { name: 'photos', maxCount: 5 },
  { name: 'voiceNote', maxCount: 1 },
]);
