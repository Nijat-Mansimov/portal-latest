const express = require('express');
const multer = require('multer');
const path = require('path');
const { poolPromise, sql } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'), false);
    }
    cb(null, true);
  }
});

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('services GET hit (no auth required)', { auth: req.headers.authorization });
  const { q } = req.query;
  try {
    const pool = await poolPromise;
    let query = 'SELECT * FROM Services WHERE IsDeleted = 0';
    if (q) {
      query += ' AND (Title LIKE @q OR Description LIKE @q)';
    }
    const request = pool.request();

    if (q) {
      request.input('q', sql.NVarChar(255), `%${q}%`);
    }

    const result = await request.query(query + ' ORDER BY CreatedAt DESC');
    return res.json(result.recordset);
  } catch (err) {
    console.error('get services error', err);
    return res.status(500).json({ error: 'Failed to load services' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Services WHERE Id = @id AND IsDeleted = 0');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('service detail error', err);
    return res.status(500).json({ error: 'Failed to load service details' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, url, redirectUrl, tutorialUrl } = req.body;
  const targetUrl = url || redirectUrl;

  if (!title || !targetUrl) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('url', sql.NVarChar(1024), targetUrl)
      .input('tutorialUrl', sql.NVarChar(1024), tutorialUrl || '')
      .query(
        'INSERT INTO Services (Title, Description, RedirectUrl, TutorialUrl, IsDeleted, CreatedAt, UpdatedAt) OUTPUT INSERTED.* VALUES (@title, @description, @url, @tutorialUrl, 0, GETUTCDATE(), GETUTCDATE())'
      );

    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('create service error', err);
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, url, redirectUrl, tutorialUrl } = req.body;
  const targetUrl = url || redirectUrl;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description || '')
      .input('url', sql.NVarChar(1024), targetUrl)
      .input('tutorialUrl', sql.NVarChar(1024), tutorialUrl || '')
      .query(
        'UPDATE Services SET Title = @title, Description = @description, RedirectUrl = @url, TutorialUrl = @tutorialUrl, UpdatedAt = GETUTCDATE() WHERE Id = @id AND IsDeleted = 0; SELECT * FROM Services WHERE Id = @id'
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('update service error', err);
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

router.post('/upload-tutorial', requireAuth, requireAdmin, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const videoUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url: videoUrl });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('UPDATE Services SET IsDeleted = 1, UpdatedAt = GETUTCDATE() WHERE Id = @id');

    return res.status(204).send();
  } catch (err) {
    console.error('delete service error', err);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
