const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../middleware/advancedResults');

//Include other resource routers
const courseRouter = require('./courses');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/:id/photo').put(protect, authorize('publisher'), bootcampPhotoUpload);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);

module.exports = router;