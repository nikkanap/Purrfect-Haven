import pool from '../config/db.js';
import { insertPetFromCommunityPost } from '../services/communityService.js';

export async function createCommunityPost(req, res) {
  const {
    petName, age, weight, gender, type, breed, color,
    personality, organization, location, health, about,
  } = req.body;

  const userId = req.session.userId || null;

  if (!petName || !type || !gender || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Please log in first.' });
  }

  try {
    const [speciesRows] = await pool.query(
      'SELECT species_id FROM Species WHERE LOWER(species_name) = LOWER(?) LIMIT 1',
      [type]
    );

    if (speciesRows.length === 0) {
      return res.status(400).json({ error: `Unknown species type: ${type}` });
    }

    const speciesId = speciesRows[0].species_id;

    // FIX: Removed the 'fullDescription' string builder. 
    // We now pass raw values to specific columns and only the 'about' text to 'description'.
    const [result] = await pool.query(
      `INSERT INTO Community_Posts 
      (user_id, pet_name, species_id, breed, sex, age, color, personality, organization, health, location, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        petName, 
        speciesId, 
        breed || null, 
        gender, 
        age || null, 
        color || null, 
        personality || null, 
        organization || null, 
        health || null, 
        location,
        about || null  
      ]
    );

    res.status(201).json({ success: true, message: 'Submitted', postId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
}

export async function getCommunityPosts(req, res) {
  try {
    const [posts] = await pool.query(
      `SELECT 
        cp.*, 
        s.species_name, 
        u.first_name, u.last_name, u.email, u.cell_num, u.city as user_address
       FROM Community_Posts cp
       JOIN Species s ON cp.species_id = s.species_id
       LEFT JOIN Users u ON cp.user_id = u.user_id
       ORDER BY cp.date_posted DESC`
    );

    const formattedPosts = posts.map(post => ({
      ...post,
      date_posted: new Date(post.date_posted).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }),
      poster: {
        full_name: `${post.first_name} ${post.last_name}`,
        email: post.email,
        cell_num: post.cell_num,
        address: post.user_address
      },
      photos: post.photos ? JSON.parse(post.photos) : []
    }));

    res.json({ count: formattedPosts.length, posts: formattedPosts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
}

export async function getCommunityPostById(req, res) {
  const { id } = req.params;
  try {
    const [posts] = await pool.query(
      `SELECT 
          cp.*, 
          s.species_name, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.cell_num, 
          u.city AS user_address
      FROM Community_Posts cp
      JOIN Species s ON cp.species_id = s.species_id
      LEFT JOIN Users u ON cp.user_id = u.user_id
      WHERE cp.post_id = ?
      ORDER BY cp.date_posted DESC;`, 
      [id]);
    if (posts.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(posts[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
}

// =====================================================
// GET /api/community/me
// logged-in user — kunin lahat ng sariling community posts.
// =====================================================
export async function getMyCommunityPosts(req, res) {
  const userId = req.session.userId;

  try {
    const [posts] = await pool.query(
      `SELECT
        cp.post_id, cp.pet_name, cp.status, cp.admin_note,
        cp.date_posted, cp.date_reviewed,
        s.species_name
       FROM Community_Posts cp
       JOIN Species s ON cp.species_id = s.species_id
       WHERE cp.user_id = ?
       ORDER BY cp.date_posted DESC`,
      [userId]
    );

    res.json({ count: posts.length, posts });
  } catch (err) {
    console.error('Get my community posts error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// PUT /api/community/:id/status
// admin only — approve or reject a community post.
// =====================================================
export async function updateCommunityPostStatus(req, res) {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  const validStatuses = ['approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT post_id, status, pet_name, species_id, breed, sex, age, color, description, location
       FROM Community_Posts WHERE post_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Community post not found.' });
    }

    if (rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'This post has already been reviewed.' });
    }

    await pool.query(
      `UPDATE Community_Posts
       SET status = ?, admin_note = ?, date_reviewed = NOW()
       WHERE post_id = ?`,
      [status, admin_note || null, id]
    );

    let newPetId = null;
    if (status === 'approved') {
      const [photoRows] = await pool.query(
        `SELECT file_path FROM community_post_photos WHERE post_id = ? ORDER BY photo_id ASC`,
        [id]
      );
      const post = {
        ...rows[0],
        photos: photoRows.map(r => r.file_path),
      };
      newPetId = await insertPetFromCommunityPost(post);

      await pool.query(
        `UPDATE Community_Posts SET created_pet_id = ? WHERE post_id = ?`,
        [newPetId, id]
      );
    }

    return res.status(200).json({
      message: `Post ${status} successfully.`,
      post_id: parseInt(id),
      new_status: status,
      ...(newPetId && { pet_id: newPetId }),
    });

  } catch (err) {
    console.error('Update community post status error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}