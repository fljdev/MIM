const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

console.log('HoldingImages router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Configure Cloudinary (use existing env var)
cloudinary.config({
  url: process.env.CLOUDINARY_URL
});

// Multer memory storage (files as buffers)
const upload = multer({ storage: multer.memoryStorage() });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
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

// POST /api/holdings/:id/images - Upload up to 3 images
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const holdingId = req.params.id;
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
      // Verify holding belongs to user
      const holdingCheck = await pool.query(
        'SELECT images FROM holdings WHERE id = $1 AND user_id = $2',
        [holdingId, userId]
      );

      if (holdingCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Holding not found or unauthorized' });
      }

      const currentImages = holdingCheck.rows[0].images || [];

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
              folder: 'mim-holdings',
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

      // Update the holding row
      const updateResult = await pool.query(
        'UPDATE holdings SET images = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING images',
        [updatedImages, holdingId, userId]
      );

      console.log(`Uploaded ${newImageUrls.length} image(s) for holding ${holdingId}`);
      res.json({ images: updateResult.rows[0].images });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  });
});

// DELETE /api/holdings/:id/images - Remove an image by URL
router.delete('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const holdingId = req.params.id;
  const userId = req.user.userId;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    // Verify holding belongs to user
    const holdingCheck = await pool.query(
      'SELECT images FROM holdings WHERE id = $1 AND user_id = $2',
      [holdingId, userId]
    );

    if (holdingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found or unauthorized' });
    }

    const currentImages = holdingCheck.rows[0].images || [];

    // Check if the URL exists in the array
    if (!currentImages.includes(url)) {
      return res.status(404).json({ error: 'Image URL not found in holding' });
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

    // Update the holding row
    const updateResult = await pool.query(
      'UPDATE holdings SET images = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING images',
      [updatedImages, holdingId, userId]
    );

    console.log(`Removed image from holding ${holdingId}`);
    res.json({ images: updateResult.rows[0].images });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

module.exports = router;
