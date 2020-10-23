const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true, //ini bukan validator, hanya membuat data yang masuk menjadi lowercase
    validate: [validator.isEmail, 'Please provide a valid email'] //custom validation
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user'
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlenght: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      //VALIDATE HANYA BISA BEKERJA PADA SAVE() ATAU CREATE()
      validator: function(val) {
        return val === this.password;
      },
      message: 'Password are not the same'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// HASHING PASSWORD BEFORE SAVE IT TO THE DATABASE
userSchema.pre('save', async function(next) {
  //RUN WHEN SOMETHING CHANGED IN PASSWORD FIELD
  if (!this.isModified('password')) return next();
  //HASHING PASSWORD BEFORE SAVE IT TO THE DATABASE
  this.password = await bcrypt.hash(this.password, 10);
  //WE SET THIS TO UNDEFINED SO IT WONT SAVED TO DATABATASE
  this.passwordConfirm = undefined;

  next();
});

//Make sure passwordChangedAt created after issued JWT
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Select only active user
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//Create method for each document
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; //IF TRUE IT WILL RETURN ERROR
  }
  return false;
};

userSchema.methods.changePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log(this);
  return resetToken;
};

// To Hide The Password
userSchema.post('save', function() {
  this.password = undefined;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
