export function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const payload = {
    message: err.message || 'Server error',
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}
