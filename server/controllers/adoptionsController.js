import pool from '../config/db.js';

// =====================================================
// POST /api/adoptions
// nag-cre-create ng bagong adoption application.
// kailangan naka-login — gagamitin yung user_id galing sa session.
// =====================================================
export async function submitApplication(req, res) {
  const userId = req.session.userId;
  const {
    pet_id,
    applicant_address,
    is_first_pet,
    has_experience,
    has_other_pets,
    has_children,
    owns_home,
    financial_capability,
    motivation,
  } = req.body;

  // basic validation — required fields
  if (!pet_id) {
    return res.status(400).json({ error: 'Pet ID is required.' });
  }
  if (!applicant_address) {
    return res.status(400).json({ error: 'Address is required.' });
  }
  if (!motivation) {
    return res.status(400).json({ error: 'Please tell us why you want to adopt this pet.' });
  }
  if (!financial_capability) {
    return res.status(400).json({ error: 'Please share your financial capability.' });
  }

  try {
    // tingnan kung existing yung pet at hindi pa adopted
    const [petRows] = await pool.query(
      'SELECT pet_id, is_adopted FROM Pets WHERE pet_id = ?',
      [pet_id]
    );

    if (petRows.length === 0) {
      return res.status(404).json({ error: 'Pet not found.' });
    }

    if (petRows[0].is_adopted === 1) {
      return res.status(409).json({ error: 'This pet has already been adopted.' });
    }

    // tingnan kung may existing application yung user para sa same pet
    // na hindi pa decided.  hindi natin papayagan na mag-apply ulit.
    const [existingRows] = await pool.query(
      `SELECT adoption_id FROM Adoptions
       WHERE user_id = ? AND pet_id = ?
       AND status IN ('pending', 'appointment_scheduled', 'under_review', 'approved')`,
      [userId, pet_id]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        error: 'You already have an active application for this pet.',
      });
    }

    // i-insert na yung application — default status: pending
    const [result] = await pool.query(
      `INSERT INTO Adoptions (
        user_id, pet_id, status,
        applicant_address, is_first_pet, has_experience,
        has_other_pets, has_children, owns_home,
        financial_capability, motivation
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        pet_id,
        applicant_address,
        is_first_pet ? 1 : 0,
        has_experience ? 1 : 0,
        has_other_pets ? 1 : 0,
        has_children ? 1 : 0,
        owns_home ? 1 : 0,
        financial_capability,
        motivation,
      ]
    );

    return res.status(201).json({
      message: 'Application submitted successfully.',
      adoption_id: result.insertId,
    });

  } catch (err) {
    console.error('Submit application error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// GET /api/adoptions/me
// kunin lahat ng adoption applications ng currently logged-in user.
// =====================================================
export async function getMyApplications(req, res) {
  const userId = req.session.userId;

  try {
    const [rows] = await pool.query(
      `SELECT
        a.adoption_id, a.status, a.date_applied,
        a.applicant_address, a.is_first_pet, a.has_experience,
        a.has_other_pets, a.has_children, a.owns_home,
        a.financial_capability, a.motivation,
        a.appointment_date, a.decision_note, a.date_decided,
        a.date_completed,
        p.pet_id, p.name AS pet_name, p.breed,
        s.species_name,
        MIN(ph.file_path) AS pet_photo
      FROM Adoptions a
      JOIN Pets p    ON a.pet_id = p.pet_id
      JOIN Species s ON p.species_id = s.species_id
      LEFT JOIN pet_photos ph ON p.pet_id = ph.pet_id
      WHERE a.user_id = ?
      GROUP BY a.adoption_id
      ORDER BY a.date_applied DESC`,
      [userId]
    );

    const applications = rows.map(toApplicationShape);

    return res.status(200).json({
      count: applications.length,
      applications,
    });

  } catch (err) {
    console.error('Get my applications error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}


// =====================================================
// GET /api/adoptions/:adoption_id
// get a specific adoption application
// =====================================================
export async function getApplicationById(req, res) {
  const userId = req.session.userId;
  const { adoption_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT
          a.adoption_id,
          a.status,
          a.date_applied,
          a.applicant_address,
          a.is_first_pet,
          a.has_experience,
          a.has_other_pets,
          a.has_children,
          a.owns_home,
          a.financial_capability,
          a.motivation,
          a.appointment_date,
          a.decision_note,
          a.date_decided,
          a.date_completed,

          p.pet_id,
          p.name AS pet_name,
          p.breed,

          s.species_name,

          MIN(ph.file_path) AS pet_photo

        FROM Adoptions a
        JOIN Pets p
          ON a.pet_id = p.pet_id

        JOIN Species s
          ON p.species_id = s.species_id

        LEFT JOIN pet_photos ph
          ON p.pet_id = ph.pet_id

        WHERE a.user_id = ?
          AND a.adoption_id = ?

        GROUP BY a.adoption_id`,
      [userId, adoption_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Application not found.',
      });
    }

    const application = toApplicationShape(rows[0]);

    return res.status(200).json(application);

  } catch (err) {
    console.error('Get application by ID error:', err.message);

    return res.status(500).json({
      error: 'Server error. Please try again.',
    });
  }
}



// =====================================================
// GET /api/adoptions
// admin only — kunin lahat ng applications, may applicant info na.
// =====================================================
export async function getAllAdoptions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        a.adoption_id, a.status, a.date_applied,
        a.applicant_address, a.is_first_pet, a.has_experience,
        a.has_other_pets, a.has_children, a.owns_home,
        a.financial_capability, a.motivation,
        a.appointment_date, a.decision_note, a.date_decided,
        a.date_completed,
        p.pet_id, p.name AS pet_name, p.breed,
        s.species_name,
        MIN(ph.file_path) AS pet_photo,
        u.user_id AS applicant_user_id,
        u.first_name, u.last_name,
        u.email AS applicant_email,
        u.cell_num AS applicant_cell
      FROM Adoptions a
      JOIN Users u   ON a.user_id = u.user_id
      JOIN Pets p    ON a.pet_id = p.pet_id
      JOIN Species s ON p.species_id = s.species_id
      LEFT JOIN pet_photos ph ON p.pet_id = ph.pet_id
      GROUP BY a.adoption_id
      ORDER BY a.date_applied DESC`
    );

    const applications = rows.map((row) => ({
      ...toApplicationShape(row),
      applicant: {
        user_id:   row.applicant_user_id,
        full_name: `${row.first_name} ${row.last_name}`,
        email:     row.applicant_email,
        cell_num:  row.applicant_cell,
        address:   row.applicant_address,
      },
    }));

    return res.status(200).json({
      count: applications.length,
      applications,
    });

  } catch (err) {
    console.error('Get all adoptions error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// PUT /api/adoptions/:id/status
// admin only — i-update ang status ng adoption (approve/reject/etc.).
// kasama na rin yung pag-update ng pet's is_adopted flag kapag completed.
// =====================================================
export async function updateAdoptionStatus(req, res) {
  const adoptionId = req.params.id;
  const { status, decision_note, appointment_date } = req.body;

  // valid status values
  const validStatuses = [
    'pending',
    'appointment_scheduled',
    'under_review',
    'approved',
    'rejected',
    'completed',
  ];

  // basic validation
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
    });
  }

  try {
    // kunin yung kasalukuyang application
    const [rows] = await pool.query(
      'SELECT adoption_id, pet_id, status FROM Adoptions WHERE adoption_id = ?',
      [adoptionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adoption application not found.' });
    }

    const current = rows[0];

    // i-check kung valid yung transition (e.g. hindi pwede mag-rejected → approved)
    if (!isValidTransition(current.status, status)) {
      return res.status(400).json({
        error: `Cannot change status from "${current.status}" to "${status}".`,
      });
    }

    // build yung dynamic UPDATE query depende sa status
    const fields = ['status = ?'];
    const values = [status];

    // kung approved or rejected, save yung decision details
    if (status === 'approved' || status === 'rejected') {
      fields.push('decision_note = ?', 'date_decided = NOW()');
      values.push(decision_note || null);
    }

    // kung appointment_scheduled, kailangan may date
    if (status === 'appointment_scheduled') {
      if (!appointment_date) {
        return res.status(400).json({
          error: 'Appointment date is required when scheduling an appointment.',
        });
      }
      fields.push('appointment_date = ?');
      values.push(appointment_date);
    }

    // kung completed, mark yung date_completed at i-flag yung pet as adopted
    if (status === 'completed') {
      fields.push('date_completed = NOW()');
    }

    values.push(adoptionId);

    // i-update na yung adoption record
    await pool.query(
      `UPDATE Adoptions SET ${fields.join(', ')} WHERE adoption_id = ?`,
      values
    );

    // side effect — kapag completed, i-mark din as adopted yung pet
    if (status === 'completed') {
      await pool.query(
        'UPDATE Pets SET is_adopted = 1 WHERE pet_id = ?',
        [current.pet_id]
      );
    }

    return res.status(200).json({
      message: 'Adoption status updated successfully.',
      adoption_id: parseInt(adoptionId),
      new_status: status,
    });

  } catch (err) {
    console.error('Update adoption status error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// helper — i-check kung valid yung transition mula sa lumang status
// papunta sa bagong status.  para hindi makagawa ng weird na jumps.
// =====================================================
function isValidTransition(fromStatus, toStatus) {
  // kung pareho, ok lang (idempotent)
  if (fromStatus === toStatus) return true;

  // mga valid na transitions per current status
  const allowed = {
    pending:               ['appointment_scheduled', 'under_review', 'approved', 'rejected'],
    appointment_scheduled: ['under_review', 'approved', 'rejected'],
    under_review:          ['approved', 'rejected'],
    approved:              ['completed', 'rejected'],
    rejected:              [],   // final state
    completed:             [],   // final state
  };

  return (allowed[fromStatus] || []).includes(toStatus);
}

// =====================================================
// helper — i-convert ang flat row into nested shape.
// =====================================================
function toApplicationShape(row) {
  return {
    adoption_id:  row.adoption_id,
    status:       row.status,
    date_applied: row.date_applied,

    pet: {
      pet_id:       row.pet_id,
      name:         row.pet_name,
      breed:        row.breed,
      species_name: row.species_name,
      photo:        row.pet_photo,
    },

    applicant_address:    row.applicant_address,
    is_first_pet:         !!row.is_first_pet,
    has_experience:       !!row.has_experience,
    has_other_pets:       !!row.has_other_pets,
    has_children:         !!row.has_children,
    owns_home:            !!row.owns_home,
    financial_capability: row.financial_capability,
    motivation:           row.motivation,

    appointment_date: row.appointment_date,
    decision_note:    row.decision_note,
    date_decided:     row.date_decided,
    date_completed:   row.date_completed,
  };
}