import pool from '../config/db.js';

/**
 * Inserts a Pets record (and any linked pet_photos rows) derived from
 * an approved Community_Posts entry.
 *
 * @param {object} post - A Community_Posts row fetched from the DB.
 * @returns {Promise<number>} The new pet_id.
 */
export async function insertPetFromCommunityPost(post) {
  const [result] = await pool.query(
    `INSERT INTO Pets (name, species_id, breed, sex, age, color, description, location_held)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.pet_name,
      post.species_id,
      post.breed || null,
      post.sex,
      post.age ? parseInt(post.age) : null,
      post.color || null,
      post.description || null,
      post.location,
    ]
  );

  const newPetId = result.insertId;

  if (Array.isArray(post.photos) && post.photos.length > 0) {
    for (const filePath of post.photos) {
      await pool.query(
        `INSERT INTO pet_photos (pet_id, file_path) VALUES (?, ?)`,
        [newPetId, filePath]
      );
    }
  }

  return newPetId;
}
