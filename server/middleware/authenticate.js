const User = require('../models/user');
const Session = require('../models/session');

const authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (typeof token !== 'string') {
      throw new Error();
    }
    const session = await Session.findOne({ token, status: 'valid' });
    req.session = session;
    next();
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Authentication credentials invalid',
          errorMessage: err,
        },
      ],
    });
  }
};

module.exports = { authenticate };
