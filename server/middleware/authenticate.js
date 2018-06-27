const User = require('../models/user');
const Session = require('../models/session');

const authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const session = await Session.findOne({ token, status: 'valid' });
    if (!session) {
      throw new Error();
    }
    req.session = session;
    next();
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthenticated',
          detail: 'Failed to authenticate request',
          errorMessage: err,
        },
      ],
    });
  }
};

module.exports = { authenticate };
