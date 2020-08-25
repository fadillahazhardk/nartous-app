const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty']
    },
    rating: {
      type: Number,
      required: [true, 'review must have rating'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'a review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a review must belong to user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function(next) {
  //Populating tour and user field
  //Behind the scenes, populate akan membuat query lain dan setidaknya akan menghambat request
  this //.populate({
    //   path: 'tour',
    //   select: 'name'
    //})
    .populate({
      path: 'user',
      select: 'name photo'
    });
  next();
});

//STATIC METHOD : FOR MODEL
reviewSchema.statics.calcAvgRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRatings: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRatings,
    ratingsQuantity: stats[0].nRating
  });
};

//TO ENSURE THAT ONE USER IS ONLY HAVE ONE REVIEW FOR TOUR
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//CALC AVG RATING : When we save review
reviewSchema.post('save', function() {
  this.constructor.calcAvgRatings(this.tour);
});

// CALC AVG RATING : When we update and delete review
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
