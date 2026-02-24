/**
 * Student Controller – Read student's own data and performance
 */
const StudentData = require('../models/StudentData');
const User = require('../models/User');

// @desc   Get student's own performance data
// @route  GET /api/student/performance
// @access Private (student)
const getMyPerformance = async (req, res, next) => {
    try {
        const data = await StudentData.findOne({ userId: req.user._id })
            .populate('userId', 'name email');

        if (!data) {
            return res.status(404).json({ success: false, message: 'No performance data found' });
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

// @desc   Get list of teachers with their subjects (for messaging)
// @route  GET /api/student/teachers
// @access Private (student)
const getTeachers = async (req, res, next) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('name email subject');
        const data = teachers.map(t => ({
            id: t._id,
            name: t.name,
            email: t.email,
            subject: t.subject,
        }));
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyPerformance, getTeachers };
