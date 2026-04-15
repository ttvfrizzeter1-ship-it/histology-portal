const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9а-яА-ЯїЇіІєЄ._-]/g, '_').slice(0, 40);
    cb(null, Date.now() + '-' + safe + ext);
  }
});

const ALLOWED = [
  'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4','video/webm','video/ogg',
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Тип файлу не підтримується: ${file.mimetype}`), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Файл занадто великий (макс. 50MB)' });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Файл не отримано' });

    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype });
  });
});

module.exports = router;
