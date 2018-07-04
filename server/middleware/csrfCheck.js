const User = require('../models/user');
const Session = require('../models/session');

const csrfCheck = async (req, res, next) => {
  try {
    const { csrfToken } = req.session;
    const receivedToken = req.headers['csrf-token'];
    if (!receivedToken || csrfToken !== receivedToken) {
      throw new Error('Provided CSRF-token is invalid');
    }
    next();
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'CSRF has been attempted.',
          errorMessage: err.message,
        },
      ],
    });
  }
};

module.exports = { csrfCheck };
