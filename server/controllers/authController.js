import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const SALT_ROUNDS = 10;

// POST /api/auth/signup
export async function signup(req, res) {
  const { first_name, last_name, city, email, cell_num, password } = req.body;

  // Empty input validation
  if (!first_name || !last_name || !city || !email || !cell_num || !password) {
    return res.status(400).json({
      error: 'All fields are required: first_name, last_name, city, email, cell_num, password.',
    });
  }
  
  // Email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    // Uses pool query from db 
    // Checks for existing email OR cell_num
    const [existing] = await pool.query(
      'SELECT user_id FROM Users WHERE email = ? OR cell_num = ?',
      [email, cell_num]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'An account with this email or phone number already exists.',
      });
    }

    // Password hash w/ bcrypt
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // INSERT statement here
    const [result] = await pool.query(
      `INSERT INTO Users (first_name, last_name, city, email, cell_num, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, city, email, cell_num, password_hash]
    );

    // Success on: POST /api/auth/signup
    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        user_id:    result.insertId,
        first_name,
        last_name,
        city,
        email,
        cell_num,
        is_admin:   0,
      },
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
 
  // Empty input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
 
  try {
    // Email lookup
    const [rows] = await pool.query(
      `SELECT user_id, first_name, last_name, city, email, cell_num,
              password_hash, is_admin
      FROM Users WHERE email = ?`,
      [email]
    );
 
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
 
    const user = rows[0];
 
    // Match via bcrypt lib (password && stored hash)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
 
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
 
    // Session init (userId, firstName, lastName)
    req.session.userId    = user.user_id;
    req.session.firstName = user.first_name;
    req.session.lastName  = user.last_name;
 
    // Return user data (see via Postman)
    return res.status(200).json({
      message: 'Login successful.',
      user: {
        user_id:    user.user_id,
        first_name: user.first_name,
        last_name:  user.last_name,
        city:       user.city,
        email:      user.email,
        cell_num:   user.cell_num,
        is_admin:   user.is_admin,  // bago — para alam ng frontend
      },
    });
 
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No active session to log out from.' });
  }
 
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({ error: 'Logout failed. Please try again.' });
    }
 
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
}
 