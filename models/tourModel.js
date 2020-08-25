const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [
        10,
        'a tour name must have name char more or equal than 10 char'
      ],
      maxlength: [
        30,
        'a tour name must have name char less or equal than 30 char'
      ]
      //cara menggunakan validator library pada function custom validator kita
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: {
      type: String
    },
    duration: {
      type: String,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty option is just: easy, medium, and difficult'
      }
    },
    rating: {
      type: Number,
      default: 4.5
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'tour rating must be above or equal 1.0'],
      max: [5, 'tour rating must be below or equal 1.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //custom validator
      validate: {
        //they can hold value for this val
        validator: function(val) {
          // this is only for create new document !!!
          return val < this.price;
        },
        message: 'a price ({VALUE}) must be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON : JSON for geospatial
      //We create object inside startLocation field
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//INDEXING
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//document middleware
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -PasswordChangedAt'
  });
  next();
});

//Embedding guides for tour
// tourSchema.pre('save', async function(next) {
//   const guidesPromise = this.guides.map(id => {
//     return User.findById(id).select('+role');
//   });
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('document will be saved...');
//   next()
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//query middleware
// tourSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`finding document takes ${Date.now() - this.start} millisecond`);
//   next();
// });

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   //this.pipeline() method untuk mereturn array dari stage aggregate.
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
