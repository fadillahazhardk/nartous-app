const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1). Retrieve data from collection
  const tours = await Tour.find();
  //2). Create template
  //3). Render the template
  res.status(200).render('overview', {
    title: 'All tour',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1). Retrieve data from collection, based on requested tour
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'user review rating'
  });

  if (!tour) {
    return next(new AppError('Tour with that name not found', 404));
  }
  //2). Create template
  //3). Render the template
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
    tour
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'login to your account'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});
