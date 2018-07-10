const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

const SessionSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true,
  },
  csrfToken: {
    type: String,
    unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ['valid', 'expired'],
    default: 'valid',
  },
});

SessionSchema.plugin(uniqueValidator);

SessionSchema.statics.generateToken = function() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        reject(err);
      }
      const token = buf.toString('hex');
      resolve(token);
    });
  });
};

SessionSchema.statics.expireAllTokensForUser = function(userId) {
  return this.updateMany({ userId }, { $set: { status: 'expired' } });
};

SessionSchema.methods.expireToken = function() {
  const session = this;
  return session.update({ $set: { status: 'expired' } });
};

module.exports = mongoose.model('Session', SessionSchema);
