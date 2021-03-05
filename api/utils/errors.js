import mongoose from 'mongoose';

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details ?? undefined;
  }
}

export const invalidRequestError = (message, details) => {
  return new ApiError(400, message, details);
};

export const notFoundError = (message, details) => {
  return new ApiError(404, message, details);
};

export const methodNotAllowedError = () => {
  return new ApiError(405, 'Method not allowed.');
};

export const errorHandler = (err, req, res, __next) => {
  // TODO: Use a better logger
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `Error at ${req.method} ${req.path}`
      + ` query=${JSON.stringify(req.query)}`
      + ` body=${JSON.stringify(req.body)}: `,
      err,
    );
  }

  if (err instanceof mongoose.Error) {
    return res
      .status(err?.api?.status ?? 400)
      .json({
        error: err?.api?.message ?? 'Invalid request.',
        details: err?.api?.details ?? undefined,
      });
  }

  return res
    .status(err.status)
    .json({
      error: err.message,
      details: err.details,
    });
};

export default {
  invalidRequestError,
  notFoundError,
  errorHandler,
};
