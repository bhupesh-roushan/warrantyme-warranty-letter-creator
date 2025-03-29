const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'auth') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};

export default errorHandler; 