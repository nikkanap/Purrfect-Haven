import pool from '../config/db.js';
import { toRelativePath } from '../middleware/upload.js';

// =====================================================
// POST /api/adoptions/:adoption_id/welfare-checks
// admin only — humihiling ng welfare check sa adopter.
// =====================================================
export async function requestWelfareCheck(req, res) {
  const adminId = req.session.userId;
  const adoptionId = req.params.adoption_id;

  try {
    const [adoptionRows] = await pool.query(
      `SELECT status FROM Adoptions WHERE adoption_id = ?`,
      [adoptionId]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    if (adoptionRows[0].status !== 'completed') {
      return res.status(400).json({
        error: 'Welfare checks can only be requested for completed adoptions.',
      });
    }

    const [existingRows] = await pool.query(
      `SELECT check_id FROM Welfare_Checks
       WHERE adoption_id = ? AND status = 'pending'`,
      [adoptionId]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        error: 'There is already a pending welfare check for this adoption.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Welfare_Checks (adoption_id, admin_id, status, requested_at)
       VALUES (?, ?, 'pending', NOW())`,
      [adoptionId, adminId]
    );

    return res.status(201).json({
      message: 'Welfare check requested successfully.',
      check_id: result.insertId,
    });

  } catch (err) {
    console.error('Request welfare check error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// PUT /api/welfare-checks/:check_id/respond
// adopter only — sumasagot sa welfare check, may optional photos.
//
// IMPORTANT: ginagawang multipart/form-data ang request kapag may photos,
// kaya yung text fields ay nasa req.body, yung files ay nasa req.files.
// =====================================================
export async function respondToWelfareCheck(req, res) {
  const userId = req.session.userId;
  const checkId = req.params.check_id;
  const { condition_status, notes } = req.body;
  const files = req.files || [];

  const validConditions = ['excellent', 'good', 'concerning', 'critical'];

  if (!condition_status || !validConditions.includes(condition_status)) {
    return res.status(400).json({
      error: 'Condition status must be one of: ' + validConditions.join(', '),
    });
  }

  if (!notes || notes.trim() === '') {
    return res.status(400).json({ error: 'Notes are required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT wc.check_id, wc.status, a.user_id AS adopter_user_id
       FROM Welfare_Checks wc
       JOIN Adoptions a ON wc.adoption_id = a.adoption_id
       WHERE wc.check_id = ?`,
      [checkId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Welfare check not found.' });
    }

    const check = rows[0];

    if (check.adopter_user_id !== userId) {
      return res.status(403).json({
        error: 'You can only respond to welfare checks for your own adoptions.',
      });
    }

    if (check.status !== 'pending') {
      return res.status(400).json({
        error: 'This welfare check has already been completed.',
      });
    }

    // i-update yung welfare check
    await pool.query(
      `UPDATE Welfare_Checks
       SET condition_status = ?, notes = ?, status = 'completed', responded_at = NOW()
       WHERE check_id = ?`,
      [condition_status, notes.trim(), checkId]
    );

    // i-save lahat ng photos sa welfare_check_photos table
    for (const file of files) {
      const relativePath = toRelativePath(file.path);
      await pool.query(
        `INSERT INTO welfare_check_photos (check_id, file_path) VALUES (?, ?)`,
        [checkId, relativePath]
      );
    }

    return res.status(200).json({
      message: 'Welfare check submitted successfully.',
      photos_uploaded: files.length,
    });

  } catch (err) {
    console.error('Respond to welfare check error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/adoptions/:adoption_id/welfare-checks
// =====================================================
export async function listWelfareChecks(req, res) {
  const userId = req.session.userId;
  const adoptionId = req.params.adoption_id;

  try {
    const [adoptionRows] = await pool.query(
      `SELECT user_id FROM Adoptions WHERE adoption_id = ?`,
      [adoptionId]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    const [userRows] = await pool.query(
      `SELECT is_admin FROM Users WHERE user_id = ?`,
      [userId]
    );

    const isAdmin = userRows[0]?.is_admin === 1;
    const isAdopter = adoptionRows[0].user_id === userId;

    if (!isAdmin && !isAdopter) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    // kunin yung checks
    const [checks] = await pool.query(
      `SELECT
        wc.check_id, wc.adoption_id, wc.status,
        wc.condition_status, wc.notes,
        wc.requested_at, wc.responded_at,
        u.first_name AS admin_first_name,
        u.last_name  AS admin_last_name
      FROM Welfare_Checks wc
      JOIN Users u ON wc.admin_id = u.user_id
      WHERE wc.adoption_id = ?
      ORDER BY wc.requested_at DESC`,
      [adoptionId]
    );

    // kunin yung photos para sa lahat ng checks
    if (checks.length > 0) {
      const checkIds = checks.map((c) => c.check_id);
      const [photoRows] = await pool.query(
        `SELECT check_id, file_path FROM welfare_check_photos
         WHERE check_id IN (?)`,
        [checkIds]
      );

      // i-group ang photos by check_id
      const photosByCheck = {};
      for (const p of photoRows) {
        if (!photosByCheck[p.check_id]) photosByCheck[p.check_id] = [];
        photosByCheck[p.check_id].push(p.file_path);
      }

      // i-attach yung photos sa bawat check
      checks.forEach((c) => {
        c.photos = photosByCheck[c.check_id] || [];
      });
    }

    return res.status(200).json({
      count: checks.length,
      checks: checks.map((c) => ({
        check_id:         c.check_id,
        adoption_id:      c.adoption_id,
        status:           c.status,
        condition_status: c.condition_status,
        notes:            c.notes,
        requested_at:     c.requested_at,
        responded_at:     c.responded_at,
        admin_name:       `${c.admin_first_name} ${c.admin_last_name}`,
        photos:           c.photos || [],
      })),
    });

  } catch (err) {
    console.error('List welfare checks error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/welfare-checks
// admin only — all welfare checks across all adoptions.
// =====================================================
export async function getAllWelfareChecks(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        wc.check_id, wc.adoption_id, wc.status,
        wc.condition_status, wc.notes,
        wc.requested_at, wc.responded_at,
        p.pet_id, p.name AS pet_name,
        u.user_id AS adopter_id,
        u.first_name AS adopter_first,
        u.last_name  AS adopter_last,
        u.email      AS adopter_email
      FROM Welfare_Checks wc
      JOIN Adoptions a ON wc.adoption_id = a.adoption_id
      JOIN Pets p      ON a.pet_id       = p.pet_id
      JOIN Users u     ON a.user_id      = u.user_id
      ORDER BY wc.requested_at DESC`
    );

    const completedIds = rows.filter((r) => r.status === 'completed').map((r) => r.check_id);
    const photosByCheck = {};
    if (completedIds.length > 0) {
      const [photoRows] = await pool.query(
        `SELECT check_id, file_path FROM welfare_check_photos WHERE check_id IN (?)`,
        [completedIds]
      );
      for (const p of photoRows) {
        if (!photosByCheck[p.check_id]) photosByCheck[p.check_id] = [];
        photosByCheck[p.check_id].push(p.file_path);
      }
    }

    const checks = rows.map((r) => ({
      check_id:         r.check_id,
      adoption_id:      r.adoption_id,
      status:           r.status,
      condition_status: r.condition_status,
      notes:            r.notes,
      requested_at:     r.requested_at,
      responded_at:     r.responded_at,
      pet:     { pet_id: r.pet_id, name: r.pet_name },
      adopter: {
        user_id:   r.adopter_id,
        full_name: `${r.adopter_first} ${r.adopter_last}`,
        email:     r.adopter_email,
      },
      photos: photosByCheck[r.check_id] || [],
    }));

    return res.status(200).json({ count: checks.length, checks });
  } catch (err) {
    console.error('Get all welfare checks error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/welfare-checks/pending
// =====================================================
export async function getMyPendingChecks(req, res) {
  const userId = req.session.userId;

  try {
    const [rows] = await pool.query(
      `SELECT
        wc.check_id, wc.adoption_id, wc.requested_at,
        a.pet_id,
        p.name AS pet_name
      FROM Welfare_Checks wc
      JOIN Adoptions a ON wc.adoption_id = a.adoption_id
      JOIN Pets p      ON a.pet_id       = p.pet_id
      WHERE a.user_id = ? AND wc.status = 'pending'
      ORDER BY wc.requested_at DESC`,
      [userId]
    );

    return res.status(200).json({
      count: rows.length,
      pending_checks: rows,
    });

  } catch (err) {
    console.error('Get pending welfare checks error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}