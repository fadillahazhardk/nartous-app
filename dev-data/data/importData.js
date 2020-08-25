const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

const data = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

// console.log(data);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const deteleteDatabase = async () => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  console.log('success deleted');
  process.exit();
};

const updateDatabase = async () => {
  await Tour.create(data);
  await User.create(user);
  await Review.create(review);
  console.log('success imported');
  process.exit();
};

// console.log(process.argv[2]);
if (process.argv[2] === '--import') {
  updateDatabase();
} else if (process.argv[2] === '--delete') {
  deteleteDatabase();
} else {
  console.log(
    'Input required correct argument when execute this file... (importDatabase/deleteDatabase)'
  );
  process.exit();
}
