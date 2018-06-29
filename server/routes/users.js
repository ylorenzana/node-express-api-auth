const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Session = require('../models/session');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    const persistedUser = await user.save();
    const userId = persistedUser._id;

    const token = await Session.generateToken();
    const session = new Session({ token, userId });
    await session.save();

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        // secure: true, This option would be set to true in production.
      })
      .json({
        title: 'User Registration Successful',
        detail: 'Successfully registered new user',
      });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Registration Error',
          detail: 'Something went wrong during registration process.',
          errorMessage: err,
        },
      ],
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const userId = user._id;
    if (!user) {
      res.status(401).json({
        errors: [
          {
            title: 'Invalid credentials',
            detail: 'Email is not registered',
          },
        ],
      });
    }

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      res.status(401).json({
        errors: [
          {
            title: 'Invalid credentials',
            detail: 'Check email and password combination',
          },
        ],
      });
    }

    const token = await Session.generateToken();
    const session = new Session({ token, userId });
    await session.save();

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        // secure: true, Option would be set to true in production
      })
      .json({
        title: 'Login Successful',
        detail: 'Successfully validated user credentials',
      });
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          title: 'Server Error',
          detail: 'Something went wrong with your request',
          errorMessage: err,
        },
      ],
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { userId } = req.session;
    const user = await User.findById({ _id: userId }, { email: 1, _id: 0 });

    res.json({
      title: 'Authentication successful',
      detail: 'Successfully authenticated user',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err,
        },
      ],
    });
  }
});

router.get('/logout', authenticate, async (req, res) => {
  try {
    const { session } = req;
    await session.expireToken(session.token);
    res.clearCookie('token');

    res.json({
      title: 'Logout Successful',
      detail: 'Successfuly expired login session',
    });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Logout Failed',
          detail: 'Something went wrong during the logout process.',
          errorMessage: err,
        },
      ],
    });
  }
});

module.exports = router;
