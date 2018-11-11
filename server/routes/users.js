const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Session = require('../models/session');
const { authenticate } = require('../middleware/authenticate');
const { csrfCheck } = require('../middleware/csrfCheck');
const { initSession, isEmail } = require('../utils/utils');

const router = express.Router();



// POST REQUEST
// Registers user
// http://localhost:3000/api/users/register
// REQ: {
//        "email":"user@gmail.com",
//        "password":"thisisapassword!"
//      }
// RES: {
//         "title": "User Registration Successful",
//         "detail": "Successfully registered new user",
//         "csrfToken": "b151b06ece52c5e4db1ae7b52a34dd89"
//      }

router.post('/register', async (req, res) => {
  try {
    console.log(req.body.email)
    const { email, password } = req.body;
    if (!isEmail(email)) {
      throw new Error('Email must be a valid email address.');
    }
    if (typeof password !== 'string') {
      throw new Error('Password must be a string.');
    }
    const user = new User({ email, password });
    const persistedUser = await user.save();
    const userId = persistedUser._id;

    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(201)
      .json({
        title: 'User Registration Successful',
        detail: 'Successfully registered new user',
        csrfToken: session.csrfToken,
      });
  } catch (err) {
    res.status(400).json({
      errors: [
        {
          title: 'Registration Error',
          detail: 'Something went wrong during registration process.',
          errorMessage: err.message,
        },
      ],
    });
  }
});

// POST REQUEST
// Log in user
// http://localhost:3000/api/users/login
// REQ: {
//        "email":"user@gmail.com",
//        "password":"thisisapassword!"
//      }
// RES: {
//        "title": "Login Successful",
//        "detail": "Successfully validated user credentials",
//        "csrfToken": "cbe03d62810ccf548e7c5a887f5090d2"
//      }

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Email must be a valid email address',
          },
        ],
      });
    }
    if (typeof password !== 'string') {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Password must be a string',
          },
        ],
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    const userId = user._id;

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        title: 'Login Successful',
        detail: 'Successfully validated user credentials',
        csrfToken: session.csrfToken,
      });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
        },
      ],
    });
  }
});

// GET REQUEST
// gets user info
// http://localhost:3000/api/users/me
// HEADERS:
//  Content-Type: application/json
//  csrfToken: cbe03d62810ccf548e7c5a887f5090d2
// RES: {
//        "title": "Authentication successful",
//        "detail": "Successfully authenticated user",
//        "user": {
//          "email": "user@gmail.com"
//        }
//      }

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
          errorMessage: err.message,
        },
      ],
    });
  }
});

// DELETE REQUEST
// delete logged in user
// http://localhost:3000/api/users/me
// HEADERS:
//  Content-Type: application/json
//  csrf-token: cbe03d62810ccf548e7c5a887f5090d2
// REQ: {
//        "password":"thisisapassword"
//      }
// RES: {
//        "title": "Account Deleted",
//        "detail": "Account with credentials provided has been successfuly deleted"
//      }

router.delete('/me', authenticate, csrfCheck, async (req, res) => {
  try {
    const { userId } = req.session;
    const { password } = req.body;
    if (typeof password !== 'string') {
      throw new Error();
    }
    const user = await User.findById({ _id: userId });

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }

    await Session.expireAllTokensForUser(userId);
    res.clearCookie('token');
    await User.findByIdAndDelete({ _id: userId });
    res.json({
      title: 'Account Deleted',
      detail: 'Account with credentials provided has been successfuly deleted',
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Invalid Credentials',
          detail: 'Check email and password combination',
          errorMessage: err.message,
        },
      ],
    });
  }
});

// PUT REQUEST
// Log out user
// http://localhost:3000/api/users/logout
// HEADERS:
//  Content-Type: application/json
//  csrf-token: cbe03d62810ccf548e7c5a887f5090d2
// RES: {
//        "title": "Logout Successful",
//        "detail": "Successfuly expired login session"
//      }

router.put('/logout', authenticate, csrfCheck, async (req, res) => {
  try {
    const { session } = req;
    console.log(session);
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
          errorMessage: err.message,
        },
      ],
    });
  }
});

module.exports = router;
