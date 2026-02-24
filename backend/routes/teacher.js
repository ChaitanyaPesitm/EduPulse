const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getStudents, getStudent,
    updateSubjectMarks, addAttendance,
    getAnalytics,
} = require('../controllers/teacherController');

// All teacher routes require JWT + teacher role
router.use(protect, authorize('teacher'));

router.get('/students', getStudents);
router.get('/students/:id', getStudent);
router.put('/students/:id', updateSubjectMarks);  // edit marks for own subject
router.post('/students/:id/attendance', addAttendance); // mark attendance for own subject
router.get('/analytics', getAnalytics);

module.exports = router;
