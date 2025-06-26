const statusCodes = require("../constants.js");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case statusCodes.statusCode.VALIDATION_ERROR:
      res.status(statusCode).json({
        title: "Validation error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    case statusCodes.statusCode.UNAUTHORIZED:
      res.status(statusCode).json({
        title: "Unauthorized error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    case statusCodes.statusCode.FORBIDDEN:
      res.status(statusCode).json({
        title: "Forbidden error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    case statusCodes.statusCode.NOT_FOUND:
      res.status(statusCode).json({
        title: "Not found",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    case statusCodes.statusCode.SERVER_ERROR:
      res.status(statusCode).json({
        title: "Server error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    default:
      res.status(500).json({
        title: "Unknown error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;
  }
};

module.exports = errorHandler;
