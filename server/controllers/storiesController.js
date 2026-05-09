import pool from '../config/db.js';
import { toRelativePath } from '../middleware/upload.js';

// helper — kunin lahat ng photos para sa lista ng story IDs
async function fetchPhotosForStories(storyIds) {
  if (storyIds.length === 0) return {};
  const [rows] = await pool.query(
    `SELECT story_id, file_path FROM story_photos WHERE story_id IN (?)`,
    [storyIds]
  );
  const grouped = {};
  for (const p of rows) {
    if (!grouped[p.story_id]) grouped[p.story_id] = [];
    grouped[p.story_id].push(p.file_path);
  }
  return grouped;
}

// helper — i-save ang multiple photos for a story
async function savePhotosForStory(storyId, files) {
  for (const file of files) {
    const relativePath = toRelativePath(file.path);
    await pool.query(
      `INSERT INTO story_photos (story_id, file_path) VALUES (?, ?)`,
      [storyId, relativePath]
    );
  }
}

// =====================================================
// GET /api/stories/featured
// public — pinakabagong published story para sa homepage.
// =====================================================
export async function getFeaturedStory(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        st.story_id, st.title, st.content, st.published_at,
        u.first_name, u.last_name,
        p.pet_id, p.name AS pet_name,
        MIN(ph.file_path) AS pet_photo
      FROM Stories st
      JOIN Users u    ON st.user_id = u.user_id
      JOIN Pets p     ON st.pet_id  = p.pet_id
      LEFT JOIN pet_photos ph ON p.pet_id = ph.pet_id
      WHERE st.status = 'published'
      GROUP BY st.story_id
      ORDER BY st.published_at DESC
      LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(200).json({ story: null });
    }

    const r = rows[0];

    // kunin yung story photos — gagamitin ang first photo as cover
    // kung may laman, mag-fallback sa pet_photo kung wala.
    const [storyPhotos] = await pool.query(
      `SELECT file_path FROM story_photos WHERE story_id = ? ORDER BY photo_id ASC LIMIT 1`,
      [r.story_id]
    );

    const coverPhoto = storyPhotos.length > 0 ? storyPhotos[0].file_path : r.pet_photo;

    return res.status(200).json({
      story: {
        story_id:     r.story_id,
        title:        r.title,
        content:      r.content,
        published_at: r.published_at,
        adopter_name: `${r.first_name} ${r.last_name}`,
        cover_photo:  coverPhoto,  // bagong field — story photo or fallback pet_photo
        pet: {
          pet_id: r.pet_id,
          name:   r.pet_name,
          photo:  r.pet_photo,
        },
      },
    });

  } catch (err) {
    console.error('Get featured story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// GET /api/stories
// admin only — kunin lahat ng stories sa lahat ng status.
// =====================================================
export async function getAllStories(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        st.story_id, st.title, st.content, st.status, st.admin_note,
        st.submitted_at, st.published_at,
        st.requested_by_admin_id,
        u.first_name, u.last_name,
        p.pet_id, p.name AS pet_name
      FROM Stories st
      JOIN Users u ON st.user_id = u.user_id
      JOIN Pets p  ON st.pet_id  = p.pet_id
      ORDER BY st.submitted_at DESC`
    );

    // i-attach ang photos
    const photosByStory = await fetchPhotosForStories(rows.map((r) => r.story_id));

    return res.status(200).json({
      count: rows.length,
      stories: rows.map((r) => ({
        story_id:     r.story_id,
        title:        r.title,
        content:      r.content,
        status:       r.status,
        admin_note:   r.admin_note,
        submitted_at: r.submitted_at,
        published_at: r.published_at,
        was_requested: !!r.requested_by_admin_id,
        adopter_name: `${r.first_name} ${r.last_name}`,
        pet: { pet_id: r.pet_id, name: r.pet_name },
        photos: photosByStory[r.story_id] || [],
      })),
    });

  } catch (err) {
    console.error('Get all stories error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// GET /api/stories/me
// =====================================================
export async function getMyStories(req, res) {
  const userId = req.session.userId;

  try {
    const [rows] = await pool.query(
      `SELECT
        st.story_id, st.title, st.content, st.status, st.admin_note,
        st.submitted_at, st.published_at,
        st.requested_by_admin_id, st.adoption_id,
        p.pet_id, p.name AS pet_name
      FROM Stories st
      JOIN Pets p ON st.pet_id = p.pet_id
      WHERE st.user_id = ?
      ORDER BY st.submitted_at DESC`,
      [userId]
    );

    const photosByStory = await fetchPhotosForStories(rows.map((r) => r.story_id));

    return res.status(200).json({
      count: rows.length,
      stories: rows.map((r) => ({
        story_id:     r.story_id,
        title:        r.title,
        content:      r.content,
        status:       r.status,
        admin_note:   r.admin_note,
        submitted_at: r.submitted_at,
        published_at: r.published_at,
        was_requested: !!r.requested_by_admin_id,
        adoption_id:  r.adoption_id,
        pet: { pet_id: r.pet_id, name: r.pet_name },
        photos: photosByStory[r.story_id] || [],
      })),
    });

  } catch (err) {
    console.error('Get my stories error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// POST /api/stories/request
// admin only — humihiling sa adopter na magsulat ng story.
// =====================================================
export async function requestStory(req, res) {
  const adminId = req.session.userId;
  const { adoption_id } = req.body;

  if (!adoption_id) {
    return res.status(400).json({ error: 'adoption_id is required.' });
  }

  try {
    const [adoptionRows] = await pool.query(
      `SELECT user_id, pet_id, status FROM Adoptions WHERE adoption_id = ?`,
      [adoption_id]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    const adoption = adoptionRows[0];

    if (adoption.status !== 'completed') {
      return res.status(400).json({
        error: 'Stories can only be requested for completed adoptions.',
      });
    }

    const [existingRows] = await pool.query(
      `SELECT story_id FROM Stories
       WHERE adoption_id = ? AND status = 'pending'`,
      [adoption_id]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        error: 'A story request is already pending for this adoption.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Stories
        (user_id, pet_id, adoption_id, requested_by_admin_id, status, submitted_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [adoption.user_id, adoption.pet_id, adoption_id, adminId]
    );

    return res.status(201).json({
      message: 'Story request sent to adopter.',
      story_id: result.insertId,
    });

  } catch (err) {
    console.error('Request story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// PUT /api/stories/:id/submit
// adopter — sumasagot sa story request, may optional photos.
// =====================================================
export async function submitStory(req, res) {
  const userId = req.session.userId;
  const storyId = req.params.id;
  const { title, content } = req.body;
  const files = req.files || [];

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT user_id, status FROM Stories WHERE story_id = ?`,
      [storyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Story not found.' });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only submit your own stories.' });
    }

    if (rows[0].status !== 'pending') {
      return res.status(400).json({
        error: 'This story has already been submitted.',
      });
    }

    await pool.query(
      `UPDATE Stories
       SET title = ?, content = ?, status = 'submitted', submitted_at = NOW()
       WHERE story_id = ?`,
      [title.trim(), content.trim(), storyId]
    );

    await savePhotosForStory(storyId, files);

    return res.status(200).json({
      message: 'Story submitted for admin review.',
      photos_uploaded: files.length,
    });

  } catch (err) {
    console.error('Submit story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// POST /api/stories/initiate
// adopter — nag-iinitiate ng sariling story, may optional photos.
// =====================================================
export async function initiateOwnStory(req, res) {
  const userId = req.session.userId;
  const { adoption_id, title, content } = req.body;
  const files = req.files || [];

  if (!adoption_id || !title || !content) {
    return res.status(400).json({
      error: 'adoption_id, title, and content are required.',
    });
  }

  try {
    const [adoptionRows] = await pool.query(
      `SELECT user_id, pet_id, status FROM Adoptions WHERE adoption_id = ?`,
      [adoption_id]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    const adoption = adoptionRows[0];

    if (adoption.user_id !== userId) {
      return res.status(403).json({
        error: 'You can only share stories for your own adoptions.',
      });
    }

    if (adoption.status !== 'completed') {
      return res.status(400).json({
        error: 'Stories can only be shared for completed adoptions.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Stories
        (user_id, pet_id, adoption_id, title, content, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', NOW())`,
      [userId, adoption.pet_id, adoption_id, title.trim(), content.trim()]
    );

    await savePhotosForStory(result.insertId, files);

    return res.status(201).json({
      message: 'Story submitted for admin review.',
      story_id: result.insertId,
      photos_uploaded: files.length,
    });

  } catch (err) {
    console.error('Initiate own story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// POST /api/stories/admin-create
// admin only — admin-authored, may optional photos, auto-published.
// =====================================================
export async function adminCreateStory(req, res) {
  const adminId = req.session.userId;
  const { pet_id, adoption_id, title, content } = req.body;
  const files = req.files || [];

  if (!pet_id || !title || !content) {
    return res.status(400).json({
      error: 'pet_id, title, and content are required.',
    });
  }

  try {
    const [petRows] = await pool.query(
      'SELECT pet_id FROM Pets WHERE pet_id = ?',
      [pet_id]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }

    let attributedUserId = adminId;
    if (adoption_id) {
      const [adoptionRows] = await pool.query(
        'SELECT user_id FROM Adoptions WHERE adoption_id = ?',
        [adoption_id]
      );
      if (adoptionRows.length > 0) {
        attributedUserId = adoptionRows[0].user_id;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO Stories
        (user_id, pet_id, adoption_id, title, content,
         status, submitted_at, published_at)
       VALUES (?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
      [attributedUserId, pet_id, adoption_id || null, title, content]
    );

    await savePhotosForStory(result.insertId, files);

    return res.status(201).json({
      message: 'Story created and published.',
      story_id: result.insertId,
      photos_uploaded: files.length,
    });

  } catch (err) {
    console.error('Admin create story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// PUT /api/stories/:id/review
// admin only — i-publish o i-reject ang submitted story.
// =====================================================
export async function reviewStory(req, res) {
  const storyId = req.params.id;
  const { action, admin_note } = req.body;

  if (!action || !['publish', 'reject'].includes(action)) {
    return res.status(400).json({
      error: "action must be 'publish' or 'reject'.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT story_id, status FROM Stories WHERE story_id = ?`,
      [storyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Story not found.' });
    }

    if (rows[0].status !== 'submitted' && rows[0].status !== 'published') {
      return res.status(400).json({
        error: 'Only submitted or published stories can be reviewed.',
      });
    }

    if (action === 'publish') {
      await pool.query(
        `UPDATE Stories
         SET status = 'published', published_at = NOW(), admin_note = ?
         WHERE story_id = ?`,
        [admin_note || null, storyId]
      );
      return res.status(200).json({ message: 'Story published.' });
    } else {
      await pool.query(
        `UPDATE Stories
         SET status = 'rejected', admin_note = ?
         WHERE story_id = ?`,
        [admin_note || null, storyId]
      );
      return res.status(200).json({ message: 'Story rejected.' });
    }

  } catch (err) {
    console.error('Review story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// PUT /api/stories/:id/unpublish
// =====================================================
export async function unpublishStory(req, res) {
  const storyId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT status FROM Stories WHERE story_id = ?`,
      [storyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Story not found.' });
    }

    if (rows[0].status !== 'published') {
      return res.status(400).json({
        error: 'Only published stories can be unpublished.',
      });
    }

    await pool.query(
      `UPDATE Stories SET status = 'submitted' WHERE story_id = ?`,
      [storyId]
    );

    return res.status(200).json({ message: 'Story unpublished.' });

  } catch (err) {
    console.error('Unpublish story error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}