const dotenv = require('dotenv');
const mongoose = require('mongoose');

//UNCAUGHT EXCEPTION
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION, Shuting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const connectDB = mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

connectDB.then(() => console.log('Success connecting to database'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//UNHANDLED PROMISE REJECTION
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION, Shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
