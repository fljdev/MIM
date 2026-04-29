const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

console.log('Books router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Configure Cloudinary (use existing env var)
cloudinary.config({
  url: process.env.CLOUDINARY_URL
});

// Multer memory storage (files as buffers)
const upload = multer({ storage: multer.memoryStorage() });

// Authentication middleware (same as other routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Books router is working' });
});

// GET /api/books - Get all books for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT * FROM books
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// POST /api/books - Create a new book
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    title,
    author,
    year_published,
    edition,
    is_signed,
    condition,
    estimated_value_eur,
    purchase_price_eur,
    purchase_date,
    notes
  } = req.body;

  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO books (
        user_id, title, author, year_published, edition, is_signed,
        condition, estimated_value_eur, purchase_price_eur, purchase_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      userId,
      title,
      author,
      year_published,
      edition,
      is_signed || false,
      condition,
      estimated_value_eur,
      purchase_price_eur,
      purchase_date,
      notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT /api/books/:id - Update a book
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const bookId = req.params.id;
  const {
    title,
    author,
    year_published,
    edition,
    is_signed,
    condition,
    estimated_value_eur,
    purchase_price_eur,
    purchase_date,
    notes
  } = req.body;

  try {
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
      paramCount++;
    }

    if (author !== undefined) {
      updateFields.push(`author = $${paramCount}`);
      updateValues.push(author);
      paramCount++;
    }

    if (year_published !== undefined) {
      updateFields.push(`year_published = $${paramCount}`);
      updateValues.push(year_published);
      paramCount++;
    }

    if (edition !== undefined) {
      updateFields.push(`edition = $${paramCount}`);
      updateValues.push(edition);
      paramCount++;
    }

    if (is_signed !== undefined) {
      updateFields.push(`is_signed = $${paramCount}`);
      updateValues.push(is_signed);
      paramCount++;
    }

    if (condition !== undefined) {
      updateFields.push(`condition = $${paramCount}`);
      updateValues.push(condition);
      paramCount++;
    }

    if (estimated_value_eur !== undefined) {
      updateFields.push(`estimated_value_eur = $${paramCount}`);
      updateValues.push(estimated_value_eur);
      paramCount++;
    }

    if (purchase_price_eur !== undefined) {
      updateFields.push(`purchase_price_eur = $${paramCount}`);
      updateValues.push(purchase_price_eur);
      paramCount++;
    }

    if (purchase_date !== undefined) {
      updateFields.push(`purchase_date = $${paramCount}`);
      updateValues.push(purchase_date);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add bookId and userId as the last parameters
    updateValues.push(bookId);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE books 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /api/books/:id - Delete a book
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const bookId = req.params.id;

  try {
    // Check if book exists and belongs to user
    const bookCheck = await pool.query(
      'SELECT id FROM books WHERE id = $1 AND user_id = $2',
      [bookId, userId]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or unauthorized' });
    }

    // Delete the book
    await pool.query(
      'DELETE FROM books WHERE id = $1 AND user_id = $2',
      [bookId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// POST /api/books/:id/images - Upload images to Cloudinary
router.post('/:id/images', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const bookId = req.params.id;
  const userId = req.user.userId;

  upload.array('images', 3)(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'Upload error: ' + err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      // Verify book belongs to user
      const bookCheck = await pool.query(
        'SELECT images FROM books WHERE id = $1 AND user_id = $2',
        [bookId, userId]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found or unauthorized' });
      }

      const currentImages = bookCheck.rows[0].images || [];

      // Check that total images won't exceed 3
      if (currentImages.length + req.files.length > 3) {
        return res.status(400).json({
          error: `Cannot upload ${req.files.length} images. You can have at most 3 images total, and currently have ${currentImages.length}.`
        });
      }

      // Upload each file to Cloudinary
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'mim-books',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const newImageUrls = await Promise.all(uploadPromises);

      // Append new URLs to the existing images array
      const updatedImages = [...currentImages, ...newImageUrls];

      // Update the book row
      const updateResult = await pool.query(
        'UPDATE books SET images = $1 WHERE id = $2 AND user_id = $3 RETURNING images',
        [updatedImages, bookId, userId]
      );

      console.log(`Uploaded ${newImageUrls.length} image(s) for book ${bookId}`);
      res.json({ images: updateResult.rows[0].images });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  });
});

// DELETE /api/books/:id/images - Remove an image by URL
router.delete('/:id/images', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const bookId = req.params.id;
  const userId = req.user.userId;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    // Verify book belongs to user
    const bookCheck = await pool.query(
      'SELECT images FROM books WHERE id = $1 AND user_id = $2',
      [bookId, userId]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or unauthorized' });
    }

    const currentImages = bookCheck.rows[0].images || [];

    // Check if the URL exists in the array
    if (!currentImages.includes(url)) {
      return res.status(404).json({ error: 'Image URL not found in book' });
    }

    // Remove the URL from the array
    const updatedImages = currentImages.filter((imgUrl) => imgUrl !== url);

    // Best-effort destroy on Cloudinary
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        const publicIdParts = urlParts.slice(uploadIndex + 2);
        const publicId = publicIdParts.join('/').replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryError) {
      console.warn('Cloudinary destroy warning (non-fatal):', cloudinaryError.message);
    }

    // Update the book row
    const updateResult = await pool.query(
      'UPDATE books SET images = $1 WHERE id = $2 AND user_id = $3 RETURNING images',
      [updatedImages, bookId, userId]
    );

    console.log(`Removed image from book ${bookId}`);
    res.json({ images: updateResult.rows[0].images });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

module.exports = router;
