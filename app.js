const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const appErrorHandler = require('./controllers/appErrorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const adminRouter = require('./routes/adminRoutes');
const viewsRouter = require('./routes/viewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');

//Initialize express application
const app = express();

//VIEW ENGINE SETUP
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));

// 1) GLOBAL MIDDLEWARES

//Securing HTPP Headers
app.use(helmet());

//Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limiting request per IP
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request, try again later'
});
app.use('/api', limit);

//Body parser, create req.body from data's body
app.use(express.json({ limit: '10kb' }));
//Cookie parser
app.use(cookieParser());

//Data Sanitization : Against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization : Against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'rating',
      'ratingsAverage',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//Compress text response to client
app.use(compression());

//Serving static file
app.use(express.static(`${__dirname}/public`));

//Creating request time to req property
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
//SSR ROUTE
app.use('/', viewsRouter);
//API ROUTE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
//ADMIN ROUTE
app.use('/admin', adminRouter);

//HANDLING UNAVAILABLE ROUTE
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 400));
});

//GLOBAL ERROR MIDDLEWARE
app.use(appErrorHandler);

module.exports = app;
