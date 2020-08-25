const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value} not found`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = `Invalid fields value: ${
    err.keyValue.name
  }.Change that value to another one`;
  return new AppError(message, 400);
};

const handleValidationDB = err => {
  return new AppError(err.message, 400);
};

const handleJWTError = () => {
  return new AppError('Something error. Please log in again', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('You out of a session. Please log in again', 401);
};

const sendErrorDev = (error, request, response) => {
  console.log(error);
  // 1) API
  if (request.originalUrl.startsWith('/api')) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack
    });
  }
  // 2) RENDERED WEBSITE
  response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message
  });
};

const sendErrorProd = (error, request, response) => {
  // 1) API
  if (request.originalUrl.startsWith('/api')) {
    //IF OPERATIONAL ERROR OCCUR
    if (error.isOperationalError === true) {
      response.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });

      //IF PROGRAMMING OR UNKNOWN ERROR OCCUR
    } else {
      response.status(error.statusCode).json({
        status: 500,
        message: 'Something went wrong!',
        error: error
      });
    }
  }

  // 2) RENDERED WEBSITE
  //IF OPERATIONAL ERROR OCCUR
  if (error.isOperationalError === true) {
    response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message
    });

    //IF PROGRAMMING OR UNKNOWN ERROR OCCUR
  } else {
    response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  const validationMessage = err.message;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // //Handling Invalid ID
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    // //Handling duplicate field
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    // //Handling validation errors
    if (err.name === 'ValidationError') {
      error = handleValidationDB(error);
      error.message = validationMessage;
    }
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, req, res);
  }
};
