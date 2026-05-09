import pool from '../config/db.js';
import bcrypt from 'bcrypt'; 

// GET /api/users/profile
export async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, first_name, last_name, city, email, cell_num,
              is_admin, created_at
      FROM Users WHERE user_id = ?`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: rows[0] });

  } catch (err) {
    console.error('Get profile error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// =====================================================
// DELETE /api/users/:id
// admin only — delete a user account.
// nag-rerefuse kapag may existing data ng user (adoptions, posts, etc).
// =====================================================
export async function deleteUser(req, res) {
  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.session.userId;

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  // bawal mag-delete ng sarili — para hindi ma-lockout ang admin
  if (targetUserId === currentUserId) {
    return res.status(400).json({
      error: 'You cannot delete your own account.',
    });
  }

  try {
    // tingnan kung existing yung user
    const [userRows] = await pool.query(
      'SELECT user_id, is_admin FROM Users WHERE user_id = ?',
      [targetUserId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // bawal mag-delete ng kapwa admin para safe
    if (userRows[0].is_admin === 1) {
      return res.status(403).json({
        error: 'Cannot delete another admin account.',
      });
    }

    // i-check kung may active adoption applications
    const [adoptionRows] = await pool.query(
      `SELECT adoption_id FROM Adoptions
       WHERE user_id = ?
       AND status IN ('pending', 'appointment_scheduled', 'under_review', 'approved', 'completed')`,
      [targetUserId]
    );

    if (adoptionRows.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete user — they have adoption records. Resolve those first.',
      });
    }

    // i-delete na — ang ibang linked rows (rescue reports, posts) ay
    // hahawakan ng FK ON DELETE behavior sa schema.
    const [result] = await pool.query(
      'DELETE FROM Users WHERE user_id = ?',
      [targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User deleted successfully.',
    });

  } catch (err) {
    // kapag may FK violation ang MySQL, ito 'yon
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'Cannot delete user — they have linked data (rescue reports, community posts, etc).',
      });
    }
    console.error('Delete user error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// =====================================================
// GET /api/users
// admin only — kunin lahat ng accounts.
// =====================================================
export async function getAllUsers(req, res) {
  try {
    // hindi isasama ang password_hash — sensitive 'yon kahit
    // admin lang ang makakakita.
    const [rows] = await pool.query(
      `SELECT user_id, first_name, last_name, city, email, cell_num,
              is_admin, created_at
       FROM Users
       ORDER BY created_at DESC`
    );
    return res.status(200).json({
      count: rows.length,
      users: rows,
    });
  } catch (err) {
    console.error('Get all users error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}

// Modify my user details
// PUT /api/users/profile
export async function updateProfile(req, res) {
  const { first_name, last_name, city, email, cell_num } = req.body;
 
  // Input validation
  if (!first_name && !last_name && !city && !email && !cell_num) {
    return res.status(400).json({
      error: 'At least one field must be provided to update.',
    });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
  }
 
  try {
    if (email || cell_num) {
      const conditions = [];
      const checkParams = [];
 
      if (email) {
        conditions.push('email = ?');
        checkParams.push(email);
      }
      if (cell_num) {
        conditions.push('cell_num = ?');
        checkParams.push(cell_num);
      }
 
      const [existing] = await pool.query(
        `SELECT user_id FROM Users
         WHERE (${conditions.join(' OR ')})
         AND user_id != ?`,
        [...checkParams, req.session.userId]
      );
 
      if (existing.length > 0) {
        return res.status(409).json({
          error: 'That email or phone number is already in use by another account.',
        });
      }
    }
 
    const fields = [];
    const params = [];
 
    if (first_name) { fields.push('first_name = ?'); params.push(first_name); }
    if (last_name)  { fields.push('last_name = ?');  params.push(last_name);  }
    if (city)       { fields.push('city = ?');       params.push(city);       }
    if (email)      { fields.push('email = ?');      params.push(email);      }
    if (cell_num)   { fields.push('cell_num = ?');   params.push(cell_num);   }
 
    params.push(req.session.userId);
 
    await pool.query(
      `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`,
      params
    );
 
    const [rows] = await pool.query(
      `SELECT user_id, first_name, last_name, city, email, cell_num, created_at
       FROM Users WHERE user_id = ?`,
      [req.session.userId]
    );
 
    return res.status(200).json({
      message: 'Profile updated successfully.',
      user:    rows[0],
    });
 
  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// PUT /api/users/change-password
export async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Both current and new passwords are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT password_hash FROM Users WHERE user_id = ?',
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    await pool.query(
      'UPDATE Users SET password_hash = ? WHERE user_id = ?',
      [hashedNewPassword, req.session.userId]
    );

    return res.status(200).json({ message: 'Password changed successfully.' });

  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}