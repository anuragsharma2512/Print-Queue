import jwt from 'jsonwebtoken';

/**
 * Middleware to enforce shopkeeper authentication via HttpOnly JWT cookie.
 */
export const requireShopkeeperAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Please log in as shopkeeper.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'shopkeeper') {
      return res.status(403).json({
        message: 'Forbidden. Shopkeeper role required.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        expired: true,
      });
    }
    return res.status(401).json({
      message: 'Invalid authentication token.',
    });
  }
};
