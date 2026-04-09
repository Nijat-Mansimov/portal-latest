const express = require('express');
const multer = require('multer');
const { poolPromise, sql } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query('SELECT * FROM News WHERE IsDeleted = 0 ORDER BY PublishDate DESC, CreatedAt DESC');
    return res.json(result.recordset);
  } catch (err) {
    console.error('get news error', err);
    return res.status(500).json({ error: 'Failed to load news' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM News WHERE Id = @id AND IsDeleted = 0');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('news detail error', err);
    return res.status(500).json({ error: 'Failed to load news detail' });
  }
});

router.get('/:id/check-read', requireAuth, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userResult = await pool
      .request()
      .input('username', sql.NVarChar(255), req.user.username)
      .query('SELECT TOP 1 Id FROM Users WHERE Username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.recordset[0].Id;

    const readResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('newsId', sql.Int, req.params.id)
      .query('SELECT 1 FROM NewsRead WHERE UserId = @userId AND NewsId = @newsId');

    const hasRead = readResult.recordset.length > 0;
    return res.json({ hasRead });
  } catch (err) {
    console.error('check news read error', err);
    return res.status(500).json({ error: 'Failed to check read status' });
  }
});

router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const pool = await poolPromise;

    const userResult = await pool
      .request()
      .input('username', sql.NVarChar(255), req.user.username)
      .query('SELECT TOP 1 Id FROM Users WHERE Username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.recordset[0].Id;

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('newsId', sql.Int, req.params.id)
      .query(
        'IF NOT EXISTS (SELECT 1 FROM NewsRead WHERE UserId = @userId AND NewsId = @newsId)\n' +
        'INSERT INTO NewsRead (UserId, NewsId, ReadAt) VALUES (@userId, @newsId, GETUTCDATE())'
      );

    return res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('mark news read error', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.get('/:id/readers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('newsId', sql.Int, req.params.id)
      .query(
        'SELECT ur.Id as UserId, ur.Username, ur.DisplayName, nr.ReadAt FROM NewsRead nr JOIN Users ur ON nr.UserId = ur.Id WHERE nr.NewsId = @newsId ORDER BY nr.ReadAt DESC'
      );
    return res.json(result.recordset);
  } catch (err) {
    console.error('news readers error', err);
    return res.status(500).json({ error: 'Failed to load readers' });
  }
});

router.post('/', requireAuth, requireAdmin, upload.single('coverImage'), async (req, res) => {
  const { title, content, publishDate } = req.body;
  if (!title || !content || !publishDate) {
    return res.status(400).json({ error: 'Title, content and publishDate are required' });
  }

  const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.coverImageUrl || '';

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('title', sql.NVarChar(255), title)
      .input('content', sql.NVarChar(sql.MAX), content)
      .input('coverImageUrl', sql.NVarChar(1024), coverImageUrl)
      .input('publishDate', sql.DateTime, new Date(publishDate))
      .query(
        'INSERT INTO News (Title, CoverImageUrl, Content, PublishDate, IsDeleted, CreatedAt, UpdatedAt) OUTPUT INSERTED.* VALUES (@title, @coverImageUrl, @content, @publishDate, 0, GETUTCDATE(), GETUTCDATE())'
      );

    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('create news error', err);
    return res.status(500).json({ error: 'Failed to create news' });
  }
});

router.put('/:id', requireAuth, requireAdmin, upload.single('coverImage'), async (req, res) => {
  const { title, content, publishDate } = req.body;
  const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.coverImageUrl || null;

  if (!title || !content || !publishDate) {
    return res.status(400).json({ error: 'Title, content and publishDate are required' });
  }

  try {
    const pool = await poolPromise;
    const updateQuery = `
      UPDATE News
      SET Title = @title,
          Content = @content,
          PublishDate = @publishDate,
          UpdatedAt = GETUTCDATE()${coverImageUrl ? ', CoverImageUrl = @coverImageUrl' : ''}
      WHERE Id = @id AND IsDeleted = 0;
      SELECT * FROM News WHERE Id = @id;
    `;

    const request = pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar(255), title)
      .input('content', sql.NVarChar(sql.MAX), content)
      .input('publishDate', sql.DateTime, new Date(publishDate));

    if (coverImageUrl) {
      request.input('coverImageUrl', sql.NVarChar(1024), coverImageUrl);
    }

    const result = await request.query(updateQuery);
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('update news error', err);
    return res.status(500).json({ error: 'Failed to update news' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('UPDATE News SET IsDeleted = 1, UpdatedAt = GETUTCDATE() WHERE Id = @id');

    return res.status(204).send();
  } catch (err) {
    console.error('delete news error', err);
    return res.status(500).json({ error: 'Failed to delete news' });
  }
});

module.exports = router;
