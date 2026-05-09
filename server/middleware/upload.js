import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// kunin yung absolute path ng /server folder
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// path papuntang /server/uploads — i-create kung wala pa
const uploadsRoot = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

// allowed mime types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// 5MB max per file
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// helper — gumawa ng multer instance para sa specific subfolder.
// gagamitin: makeUploader('welfare-checks') para mapunta sa /uploads/welfare-checks/
export function makeUploader(subfolder, maxFiles) {
  const targetDir = path.join(uploadsRoot, subfolder);

  // i-create yung subfolder kung wala pa
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // disk storage — saan ise-save at anong filename
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, targetDir);
    },
    filename: function (req, file, cb) {
      // unique filename — timestamp + random + original ext
      // halimbawa: 1735000000000-487293.jpg
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${ext}`);
    },
  });

  // file type filter
  const fileFilter = function (req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP images are allowed.'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: maxFiles,
    },
  });
}

// helper — i-convert ang absolute file path papuntang relative URL path
// na mai-serve ng express static middleware.
// halimbawa:
//   absolute: /home/user/.../server/uploads/welfare-checks/123-456.jpg
//   relative: uploads/welfare-checks/123-456.jpg
export function toRelativePath(absolutePath) {
  const fullPath = path.resolve(absolutePath);
  const serverRoot = path.resolve(path.join(__dirname, '..'));
  return path.relative(serverRoot, fullPath).replace(/\\/g, '/');
}

// helper — error handler para sa multer errors.
// gamitin sa controllers kapag may file uploads:
//
//   try {
//     // ... your logic
//   } catch (err) {
//     return handleUploadError(err, res);
//   }
export function handleUploadError(err, res) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 5MB per file.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  // ibang errors
  console.error('Upload error:', err);
  return res.status(500).json({ error: err.message || 'Upload failed.' });
}
