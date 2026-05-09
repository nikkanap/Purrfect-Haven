import pool from '../config/db.js';
import { toRelativePath } from '../middleware/upload.js';

// =====================================================
// POST /api/pets/:pet_id/photos
// admin only — i-upload ang photos para sa existing pet.
// =====================================================
export async function uploadPetPhotos(req, res) {
  const petId = req.params.pet_id;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ error: 'No photos uploaded.' });
  }

  try {
    // i-verify na may existing pet
    const [petRows] = await pool.query(
      'SELECT pet_id FROM Pets WHERE pet_id = ?',
      [petId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }

    // i-save ang lahat ng photos
    const savedPaths = [];
    for (const file of files) {
      const relativePath = toRelativePath(file.path);
      await pool.query(
        `INSERT INTO pet_photos (pet_id, file_path) VALUES (?, ?)`,
        [petId, relativePath]
      );
      savedPaths.push(relativePath);
    }

    return res.status(201).json({
      message: 'Photos uploaded successfully.',
      photos: savedPaths,
    });

  } catch (err) {
    console.error('Upload pet photos error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// DELETE /api/pets/photos/:photo_id
// admin only — i-delete ang photo.
// =====================================================
export async function deletePetPhoto(req, res) {
  const photoId = req.params.photo_id;

  try {
    const [result] = await pool.query(
      'DELETE FROM pet_photos WHERE pet_pic_id = ?',
      [photoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    return res.status(200).json({ message: 'Photo deleted.' });

  } catch (err) {
    console.error('Delete pet photo error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}
