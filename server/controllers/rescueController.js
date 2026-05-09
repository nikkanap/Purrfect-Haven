import pool from '../config/db.js';

export async function submitRescueReport(req, res) {
  const {
    fullName,
    contactNumber,
    animalType,
    estNum,
    location,
    dateSpotted,
    timeSpotted,
    description,
    privacyConsent,
  } = req.body;

  const userId = req.session.userId || null;

  if (!fullName || !contactNumber || !location || !description) {
    return res.status(400).json({
      error: 'Missing required fields: fullName, contactNumber, location, description',
    });
  }

  if (!privacyConsent) {
    return res.status(400).json({
      error: 'Privacy consent is required to submit a rescue request.',
    });
  }

  if (!userId) {
    return res.status(401).json({
      error: 'Please log in to submit a rescue request.',
    });
  }

  try {
    const structuredDescription = `
**Reporter:** ${fullName}
**Contact:** ${contactNumber}
**Animal Type:** ${animalType || 'Not specified'}
**Estimated Count:** ${estNum || 1}
**Date Spotted:** ${dateSpotted || 'Not specified'}
**Time Spotted:** ${timeSpotted || 'Not specified'}

**Condition & Description:**
${description}
    `.trim();

    const [result] = await pool.query(
      `INSERT INTO Rescue_Reports (user_id, location, description)
       VALUES (?, ?, ?)`,
      [userId, location, structuredDescription]
    );

    res.status(201).json({
      success: true,
      message: 'Rescue request submitted successfully.',
      reportId: result.insertId,
    });
  } catch (err) {
    console.error('Error submitting rescue request:', err);
    res.status(500).json({ error: 'Failed to submit rescue request.' });
  }
}

// =====================================================
// GET /api/rescue
// admin — lahat ng reports.
// GET /api/rescue/me
// user — sariling reports lang, with reporter_name.
// =====================================================
export async function getRescueReports(req, res) {
  const userId = req.session.userId;
  const filterByUser = req.query.mine === 'true' && userId;

  try {
    const query = filterByUser
      ? `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS reporter_name
         FROM Rescue_Reports r
         LEFT JOIN Users u ON r.user_id = u.user_id
         WHERE r.user_id = ?
         ORDER BY r.date_reported DESC`
      : `SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS reporter_name
         FROM Rescue_Reports r
         LEFT JOIN Users u ON r.user_id = u.user_id
         ORDER BY r.date_reported DESC`;

    const params = filterByUser ? [userId] : [];
    const [reports] = await pool.query(query, params);

    res.json({ count: reports.length, reports });
  } catch (err) {
    console.error('Error fetching rescue requests:', err);
    res.status(500).json({ error: 'Failed to fetch rescue requests.' });
  }
}

export async function getRescueReportById(req, res) {
  const { id } = req.params;
  try {
    const [reports] = await pool.query(
      'SELECT * FROM Rescue_Reports WHERE report_id = ?',
      [id]
    );
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found.' });
    }
    res.json(reports[0]);
  } catch (err) {
    console.error('Error fetching rescue request:', err);
    res.status(500).json({ error: 'Failed to fetch rescue request.' });
  }
}

// =====================================================
// PUT /api/rescue/:id/status
// admin only — update rescue request status.
//
// status flow:
//   pending    → in_progress (dispatching a team)
//   pending    → closed      (rejecting the report)
//   in_progress → resolved   (rescue successful)
//   in_progress → closed     (could not complete)
// =====================================================
export async function updateRescueReportStatus(req, res) {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  const validStatuses = ['in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: "Status must be one of: in_progress, resolved, closed.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT report_id, status FROM Rescue_Reports WHERE report_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found.' });
    }

    const current = rows[0];

    if (!isValidRescueTransition(current.status, status)) {
      return res.status(400).json({
        error: `Cannot change status from "${current.status}" to "${status}".`,
      });
    }

    const fields = ['status = ?', 'admin_note = ?'];
    const values = [status, admin_note || null];

    if (status === 'resolved' || status === 'closed') {
      fields.push('date_resolved = NOW()');
    }

    values.push(id);

    await pool.query(
      `UPDATE Rescue_Reports SET ${fields.join(', ')} WHERE report_id = ?`,
      values
    );

    return res.status(200).json({
      message: 'Rescue request status updated successfully.',
      report_id: parseInt(id),
      new_status: status,
    });
  } catch (err) {
    console.error('Update rescue request status error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

function isValidRescueTransition(from, to) {
  const allowed = {
    pending:     ['in_progress', 'closed'],
    in_progress: ['resolved', 'closed'],
    resolved:    [],
    closed:      [],
  };
  return (allowed[from] || []).includes(to);
}
