import pool from '../config/db.js';
import { toRelativePath } from '../middleware/upload.js';

// =====================================================
// GET /api/pets
// public — kunin lahat ng available pets, may optional filters.
// =====================================================
export async function getPets(req, res) {
  try {
    const { species, breed, age, location } = req.query;

    let query = `
      SELECT
        p.pet_id, p.name, s.species_name, p.breed, p.is_adopted,
        MIN(ph.file_path) AS primary_photo
      FROM Pets p
      JOIN Species s ON p.species_id = s.species_id
      LEFT JOIN pet_photos ph ON p.pet_id = ph.pet_id
      WHERE p.is_adopted = 0
    `;

    const params = [];

    if (species) {
      if (species.toLowerCase() === 'other') {
        query += ` AND LOWER(s.species_name) NOT IN ('dog', 'cat', 'bird')`;
      } else {
        query += ` AND LOWER(s.species_name) = LOWER(?)`;
        params.push(species);
      }
    }
    if (breed) {
      query += ` AND LOWER(p.breed) LIKE LOWER(?)`;
      params.push(`%${breed}%`);
    }
    if (age) {
      const parsedAge = parseInt(age);
      if (!isNaN(parsedAge)) {
        query += ` AND p.age = ?`;
        params.push(parsedAge);
      }
    }
    if (location) {
      query += ` AND LOWER(p.location_held) LIKE LOWER(?)`;
      params.push(`%${location}%`);
    }

    query += ` GROUP BY p.pet_id ORDER BY p.date_posted DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ count: rows.length, pets: rows });

  } catch (err) {
    console.error('Get pets error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/pets/adopted
// public — kunin lahat ng adopted pets.
// =====================================================
export async function getAdoptedPets(req, res) {
  try {
    const { species, location } = req.query;

    let query = `
      SELECT
        p.pet_id, p.name, s.species_name, p.breed, p.sex, p.age, p.color,
        p.location_rescued, p.location_held, p.date_posted, p.is_adopted,
        MIN(ph.file_path) AS primary_photo
      FROM Pets p
      JOIN Species s ON p.species_id = s.species_id
      LEFT JOIN pet_photos ph ON p.pet_id = ph.pet_id
      WHERE p.is_adopted = 1
    `;

    const params = [];

    if (species) {
      if (species.toLowerCase() === 'other') {
        query += ` AND LOWER(s.species_name) NOT IN ('dog', 'cat', 'bird')`;
      } else {
        query += ` AND LOWER(s.species_name) = LOWER(?)`;
        params.push(species);
      }
    }
    if (location) {
      query += ` AND LOWER(p.location_held) LIKE LOWER(?)`;
      params.push(`%${location}%`);
    }

    query += ` GROUP BY p.pet_id ORDER BY p.date_posted DESC`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json({ count: rows.length, pets: rows });

  } catch (err) {
    console.error('Get adopted pets error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/pets/:id
// public — kunin specific pet, kasama ang lahat ng photos.
// =====================================================
export async function getPetById(req, res) {
  const { id } = req.params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'Invalid pet ID.' });
  }

  try {
    const [petRows] = await pool.query(
      `SELECT
        p.pet_id, p.name, s.species_id, s.species_name,
        p.breed, p.sex, p.age, p.color, p.description,
        p.location_rescued, p.date_rescued, p.location_held,
        p.date_posted, p.is_adopted
       FROM Pets p
       JOIN Species s ON p.species_id = s.species_id
       WHERE p.pet_id = ?`,
      [parsedId]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }

    const [photoRows] = await pool.query(
      `SELECT pet_pic_id, file_path
       FROM pet_photos
       WHERE pet_id = ?
       ORDER BY pet_pic_id ASC`,
      [parsedId]
    );

    const pet = { ...petRows[0], photos: photoRows };
    return res.status(200).json({ pet });

  } catch (err) {
    console.error('Get pet by ID error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/species
// public — kunin lahat ng species para sa dropdown.
// =====================================================
export async function getSpecies(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT species_id, species_name FROM Species ORDER BY species_name ASC'
    );
    return res.status(200).json({ species: rows });
  } catch (err) {
    console.error('Get species error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// POST /api/pets
// admin only — gumawa ng bagong pet, may optional photos sa same request.
// uses multipart/form-data kapag may photos.
// =====================================================
export async function createPet(req, res) {
  const {
    name, species_id, breed, sex, age, color, description,
    location_rescued, date_rescued, location_held,
  } = req.body;
  const files = req.files || [];

  // basic validation — required fields per schema
  if (!name || !species_id || !sex || !location_held) {
    return res.status(400).json({
      error: 'Name, species, sex, and location_held are required.',
    });
  }

  try {
    // i-verify na valid yung species_id
    const [speciesRows] = await pool.query(
      'SELECT species_id FROM Species WHERE species_id = ?',
      [species_id]
    );

    if (speciesRows.length === 0) {
      return res.status(400).json({ error: 'Invalid species selected.' });
    }

    // i-insert ang pet record
    const [result] = await pool.query(
      `INSERT INTO Pets (
        name, species_id, breed, sex, age, color, description,
        location_rescued, date_rescued, location_held
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        species_id,
        breed || null,
        sex,
        age ? parseInt(age) : null,
        color || null,
        description || null,
        location_rescued || null,
        date_rescued || null,
        location_held,
      ]
    );

    const newPetId = result.insertId;

    // i-save lahat ng photos
    for (const file of files) {
      const relativePath = toRelativePath(file.path);
      await pool.query(
        `INSERT INTO pet_photos (pet_id, file_path) VALUES (?, ?)`,
        [newPetId, relativePath]
      );
    }

    return res.status(201).json({
      message: 'Pet created successfully.',
      pet_id: newPetId,
      photos_uploaded: files.length,
    });

  } catch (err) {
    console.error('Create pet error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// PUT /api/pets/:id
// admin only — i-update ang details ng existing pet.
// hindi nito hina-handle ang photos — gamitin ang separate photo endpoints.
// =====================================================
export async function updatePet(req, res) {
  const petId = req.params.id;
  const {
    name, species_id, breed, sex, age, color, description,
    location_rescued, date_rescued, location_held, is_adopted,
  } = req.body;

  if (!name || !species_id || !sex || !location_held) {
    return res.status(400).json({
      error: 'Name, species, sex, and location_held are required.',
    });
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

    // i-verify na valid yung species_id
    const [speciesRows] = await pool.query(
      'SELECT species_id FROM Species WHERE species_id = ?',
      [species_id]
    );

    if (speciesRows.length === 0) {
      return res.status(400).json({ error: 'Invalid species selected.' });
    }

    // i-update
    await pool.query(
      `UPDATE Pets SET
        name = ?, species_id = ?, breed = ?, sex = ?, age = ?,
        color = ?, description = ?, location_rescued = ?,
        date_rescued = ?, location_held = ?, is_adopted = ?
       WHERE pet_id = ?`,
      [
        name,
        species_id,
        breed || null,
        sex,
        age ? parseInt(age) : null,
        color || null,
        description || null,
        location_rescued || null,
        date_rescued || null,
        location_held,
        is_adopted ? 1 : 0,
        petId,
      ]
    );

    return res.status(200).json({ message: 'Pet updated successfully.' });

  } catch (err) {
    console.error('Update pet error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// DELETE /api/pets/:id
// admin only — i-delete ang pet record.
// CASCADE delete ng pet_photos ay nasa schema na.
// =====================================================
export async function deletePet(req, res) {
  const petId = req.params.id;

  try {
    // i-check kung may active na adoption application sa pet
    const [adoptionRows] = await pool.query(
      `SELECT adoption_id FROM Adoptions
       WHERE pet_id = ?
       AND status IN ('pending', 'appointment_scheduled', 'under_review', 'approved')`,
      [petId]
    );

    if (adoptionRows.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete pet — there are active adoption applications. Reject or complete them first.',
      });
    }

    const [result] = await pool.query(
      'DELETE FROM Pets WHERE pet_id = ?',
      [petId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }

    return res.status(200).json({ message: 'Pet deleted successfully.' });

  } catch (err) {
    console.error('Delete pet error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}