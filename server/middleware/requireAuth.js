/* Note: Checks whether the current request has an active session with a userId
If the session exists, it calls next() and the request proceeds to the route handler. If not, it returns a 401. */

// Used later for protecting inside routes
// Example: for pets later
export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}
