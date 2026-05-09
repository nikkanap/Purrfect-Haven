import pool from '../config/db.js';

// =====================================================
// POST /api/adoptions/:adoption_id/updates
// Phase 4b — adoptive parent shares update about pet welfare.
// kailangan completed yung adoption at sila yung adopter.
// =====================================================
export async function createUpdate(req, res) {
  const userId = req.session.userId;
  const adoptionId = req.params.adoption_id;
  const { update_text } = req.body;

  if (!update_text || update_text.trim() === '') {
    return res.status(400).json({ error: 'Update text is required.' });
  }

  try {
    // i-check kung valid yung adoption — at sila yung adopter
    const [adoptionRows] = await pool.query(
      `SELECT user_id, status FROM Adoptions WHERE adoption_id = ?`,
      [adoptionId]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    const adoption = adoptionRows[0];

    // sila lang yung pwedeng mag-share ng update sa kanilang adoption
    if (adoption.user_id !== userId) {
      return res.status(403).json({
        error: 'You can only share updates for your own adoptions.',
      });
    }

    // pwede lang mag-share ng update kapag completed na yung adoption
    if (adoption.status !== 'completed') {
      return res.status(400).json({
        error: 'Updates can only be shared for completed adoptions.',
      });
    }

    // i-insert na yung update
    const [result] = await pool.query(
      `INSERT INTO Post_Adoption_Updates (adoption_id, update_text)
       VALUES (?, ?)`,
      [adoptionId, update_text.trim()]
    );

    return res.status(201).json({
      message: 'Update shared successfully.',
      update_id: result.insertId,
    });

  } catch (err) {
    console.error('Create update error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/adoptions/:adoption_id/updates
// kunin lahat ng updates para sa adoption.
// pwedeng tingnan ng adopter (their own) at admin (lahat).
// =====================================================
export async function listUpdates(req, res) {
  const userId = req.session.userId;
  const adoptionId = req.params.adoption_id;

  try {
    // i-check kung may access yung user (adopter or admin)
    const [adoptionRows] = await pool.query(
      `SELECT user_id FROM Adoptions WHERE adoption_id = ?`,
      [adoptionId]
    );

    if (adoptionRows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found.' });
    }

    // tingnan kung admin ang user
    const [userRows] = await pool.query(
      `SELECT is_admin FROM Users WHERE user_id = ?`,
      [userId]
    );

    const isAdmin = userRows[0]?.is_admin === 1;
    const isAdopter = adoptionRows[0].user_id === userId;

    // hindi admin at hindi rin adopter — bawal
    if (!isAdmin && !isAdopter) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    // kunin yung updates
    const [updates] = await pool.query(
      `SELECT update_id, adoption_id, update_text, date_posted
       FROM Post_Adoption_Updates
       WHERE adoption_id = ?
       ORDER BY date_posted DESC`,
      [adoptionId]
    );

    return res.status(200).json({
      count: updates.length,
      updates,
    });

  } catch (err) {
    console.error('List updates error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}