/**
 * Student Routes (read-only for students)
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyPerformance, getTeachers } = require('../controllers/studentController');

router.use(protect);

router.get('/performance', authorize('student'), getMyPerformance);
router.get('/teachers', authorize('student'), getTeachers);

module.exports = router;
