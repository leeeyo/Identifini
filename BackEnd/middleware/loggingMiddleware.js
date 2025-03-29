const winston = require("winston")
const path = require("path")

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
  ],
})

/**
 * Middleware to log HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now()

  // Log when the request completes
  res.on("finish", () => {
    const duration = Date.now() - start

    logger.debug({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    })
  })

  next()
}

/**
 * Log errors
 */
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  })

  next(err)
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
}

