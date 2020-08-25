const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect, authController.restrictTo('user', 'admin'));

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.insertUserTourId, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
