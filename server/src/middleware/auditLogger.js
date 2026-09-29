const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, module) => {
  return async (req, res, next) => {
    // Intercept finish to check status
    res.on('finish', async () => {
      try {
        if (req.user && res.statusCode < 400) {
          await ActivityLog.create({
            userId: req.user._id,
            action,
            module,
            details: {
              method: req.method,
              url: req.originalUrl,
              params: req.params,
              body: req.method !== 'GET' ? req.body : undefined,
            },
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            status: 'Success',
          });
        }
      } catch (err) {
        console.error('Failed to write activity log:', err.message);
      }
    });
    next();
  };
};

module.exports = {
  logActivity,
};
