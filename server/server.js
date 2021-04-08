const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const usersRoute = require('./routes/users');

require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(
  () => {
    console.log('Connected to mongoDB');
  })
  .catch((err) => console.log('Error connecting to mongoDB', err));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/api/users', usersRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app };
