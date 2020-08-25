const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const factory = require('./factoryController');

//Upload File Middleware
//Save the current file to file system
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

//Save current file to memory not file system (buffer way)
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImage = upload.single('photo');

//Crop image middleware
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file.buffer) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

//CRUD
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Use /signup instead.'
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

//Admin Things
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

//Update Current User's Data
const filterObj = (obj, ...allowedProps) => {
  const newObj = {};

  Object.keys(obj).forEach(prop => {
    if (allowedProps.includes(prop)) newObj[prop] = obj[prop];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1). Check if its contain password or password confirm / no
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route isnt for updating password.', 400));
  }
  //2). Filtering out unupdated properties from request body's
  const filteredBody = filterObj(req.body, 'name', 'email');
  //+ add img filename if user update it
  if (req.file) filteredBody.photo = req.file.filename;

  //3). Update current user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  //4). Send updated user document
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //Find the current user and set active prop to false
  await User.findByIdAndUpdate(req.user.id, { active: false });
  //Send no response
  res.status(204).json({
    status: 'success',
    data: null
  });
});
