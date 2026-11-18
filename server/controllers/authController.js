import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @desc  Authenticate shopkeeper using hashed PIN and issue HttpOnly JWT cookie
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { pin } = req.body;

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid PIN.' });
    }

    const pinHash = process.env.SHOPKEEPER_PIN_HASH;

    if (!pinHash) {
      console.error('SHOPKEEPER_PIN_HASH is not configured in server environment');
      return res.status(500).json({ message: 'Server authentication configuration error.' });
    }

    const isMatch = await bcrypt.compare(pin.trim(), pinHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid PIN. Access denied.' });
    }

    // Sign JWT with 8-hour expiry
    const token = jwt.sign(
      { role: 'shopkeeper' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/',
    });

    res.json({
      success: true,
      message: 'Authenticated successfully',
      role: 'shopkeeper',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Log out shopkeeper by clearing the HttpOnly cookie
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc  Check current authentication session status
 * @route GET /api/auth/me
 */
export const getCurrentSession = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'shopkeeper') {
      return res.json({ authenticated: true, role: 'shopkeeper' });
    }

    return res.json({ authenticated: false });
  } catch {
    return res.json({ authenticated: false });
  }
};
