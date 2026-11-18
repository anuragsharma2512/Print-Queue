/**
 * 404 handler — catches requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found – ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — returns consistent JSON error responses
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(', '),
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource ID' });
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export { notFound, errorHandler };
