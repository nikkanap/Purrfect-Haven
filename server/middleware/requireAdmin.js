import pool from '../config/db.js';

// middleware na chinecheck kung admin yung naka-login.
// dapat tumakbo ito after requireAuth, o pwede rin standalone
// (since chinecheck din niya yung session dito).
export async function requireAdmin(req, res, next) {
  // walang session = hindi naka-login
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  try {
    // tingnan sa db kung admin nga
    const [rows] = await pool.query(
      'SELECT is_admin FROM Users WHERE user_id = ?',
      [req.session.userId]
    );

    // wala sa db, o hindi admin
    if (rows.length === 0 || rows[0].is_admin !== 1) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    // pasado — tuloy sa next handler
    next();
  } catch (err) {
    console.error('requireAdmin error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}