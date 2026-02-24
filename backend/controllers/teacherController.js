/**
 * Teacher Controller
 * - All subjects visible (read-only for non-owned subjects)
 * - Marks & attendance only editable for teacher's own subject
 */
const StudentData = require('../models/StudentData');
const User = require('../models/User');
const axios = require('axios');

// ─── GET all students ────────────────────────────────────────────────────────
exports.getStudents = async (req, res, next) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
        const results = await Promise.all(
            students.map(async (s) => {
                const data = await StudentData.findOne({ userId: s._id });
                return { student: { id: s._id, name: s.name, email: s.email, usn: data?.usn || '' }, performance: data };
            })
        );
        res.json({ success: true, data: results });
    } catch (err) { next(err); }
};

// ─── GET single student ──────────────────────────────────────────────────────
exports.getStudent = async (req, res, next) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        const data = await StudentData.findOne({ userId: req.params.id });
        res.json({ success: true, data: { student: { id: student._id, name: student.name, email: student.email }, performance: data } });
    } catch (err) { next(err); }
};

// ─── UPDATE subject marks ────────────────────────────────────────────────────
exports.updateSubjectMarks = async (req, res, next) => {
    try {
        const teacherSubject = req.user.subject;
        if (!teacherSubject) return res.status(403).json({ success: false, message: 'No subject assigned to your account' });

        const { modules, ia1, ia2, assignment, remarks } = req.body;

        // Load current document
        const data = await StudentData.findOne({ userId: req.params.id });
        if (!data) return res.status(404).json({ success: false, message: 'Student not found' });

        const subIdx = data.subjects.findIndex(s => s.name === teacherSubject);
        if (subIdx === -1) return res.status(403).json({ success: false, message: 'You do not teach this subject' });

        // Build atomic $set update for the specific array index — avoids Mongoose dirty tracking issues
        const setFields = {};

        if (modules && Array.isArray(modules)) {
            modules.forEach(({ moduleNo, unitTestMarks }) => {
                const mIdx = data.subjects[subIdx].modules.findIndex(m => m.moduleNo === moduleNo);
                if (mIdx !== -1 && unitTestMarks !== undefined) {
                    setFields[`subjects.${subIdx}.modules.${mIdx}.unitTestMarks`] = Math.min(20, Math.max(0, Number(unitTestMarks)));
                }
            });
        }
        if (ia1 !== undefined) setFields[`subjects.${subIdx}.ia1`] = Math.min(50, Math.max(0, Number(ia1)));
        if (ia2 !== undefined) setFields[`subjects.${subIdx}.ia2`] = Math.min(50, Math.max(0, Number(ia2)));
        if (assignment !== undefined) setFields[`subjects.${subIdx}.assignment`] = Math.min(10, Math.max(0, Number(assignment)));
        if (remarks !== undefined) setFields['remarks'] = remarks;

        // CIE = round((IA1 + IA2 + Assignment) / 110 * 50)
        const newIa1 = ia1 !== undefined ? Number(ia1) : data.subjects[subIdx].ia1;
        const newIa2 = ia2 !== undefined ? Number(ia2) : data.subjects[subIdx].ia2;
        const newAssign = assignment !== undefined ? Number(assignment) : data.subjects[subIdx].assignment;
        setFields[`subjects.${subIdx}.totalCIE`] = Math.round(((newIa1 + newIa2 + newAssign) / 110) * 50);
        setFields[`subjects.${subIdx}.updatedAt`] = new Date();

        // Apply atomic update
        const updated = await StudentData.findOneAndUpdate(
            { userId: req.params.id },
            { $set: setFields },
            { new: true }
        );

        // AI analysis — use overall avg CIE
        const cieTotals = updated.subjects.map(s => s.totalCIE);
        const avgCIE = cieTotals.reduce((a, b) => a + b, 0) / (cieTotals.length || 1);
        const avgAtt = updated.subjects.reduce((a, s) => a + s.attendancePct, 0) / (updated.subjects.length || 1);

        try {
            const aiRes = await axios.post(`${process.env.FLASK_URL}/predict`, {
                avg_marks: (avgCIE / 50) * 100,
                attendance: avgAtt,
                improvement_rate: 60,
            });
            await StudentData.findOneAndUpdate(
                { userId: req.params.id },
                {
                    $set: {
                        performanceScore: aiRes.data.performance_score,
                        learnerCategory: aiRes.data.learner_category,
                        riskLevel: aiRes.data.risk_level,
                        recommendation: aiRes.data.recommendation,
                    }
                }
            );
        } catch (_) { /* AI offline — skip */ }

        const final = await StudentData.findOne({ userId: req.params.id });
        res.json({ success: true, data: final });
    } catch (err) { next(err); }
};

// ─── ADD / UPDATE ATTENDANCE ─────────────────────────────────────────────────
exports.addAttendance = async (req, res, next) => {
    try {
        const teacherSubject = req.user.subject;
        if (!teacherSubject) return res.status(403).json({ success: false, message: 'No subject assigned' });

        const { date, present } = req.body;
        if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

        const data = await StudentData.findOne({ userId: req.params.id });
        if (!data) return res.status(404).json({ success: false, message: 'Student not found' });

        const subIdx = data.subjects.findIndex(s => s.name === teacherSubject);
        if (subIdx === -1) return res.status(403).json({ success: false, message: 'Subject not found' });

        const sub = data.subjects[subIdx];
        const existIdx = sub.attendance.findIndex(a => a.date === date);

        let updateQuery;
        if (existIdx >= 0) {
            // Update existing date entry
            updateQuery = {
                $set: { [`subjects.${subIdx}.attendance.${existIdx}.present`]: present }
            };
        } else {
            // Push new date entry
            updateQuery = {
                $push: { [`subjects.${subIdx}.attendance`]: { date, present } }
            };
        }

        await StudentData.findOneAndUpdate({ userId: req.params.id }, updateQuery);

        // Recalculate attendance %
        const updatedData = await StudentData.findOne({ userId: req.params.id });
        const updatedSub = updatedData.subjects[subIdx];
        const totalDays = updatedSub.attendance.length;
        const presentDays = updatedSub.attendance.filter(a => a.present).length;
        const pct = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

        await StudentData.findOneAndUpdate(
            { userId: req.params.id },
            { $set: { [`subjects.${subIdx}.attendancePct`]: pct } }
        );

        const final = await StudentData.findOne({ userId: req.params.id });
        res.json({ success: true, data: final });
    } catch (err) { next(err); }
};

// ─── CLASS ANALYTICS ─────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
    try {
        const students = await User.find({ role: 'student' });
        const allData = await StudentData.find({ userId: { $in: students.map(s => s._id) } });

        const totalStudents = students.length;
        let atRisk = 0, scoreSum = 0;
        const riskBreakdown = { Low: 0, Medium: 0, High: 0, 'Not Analyzed': 0 };
        const categoryBreakdown = { 'Fast Learner': 0, 'Average Learner': 0, 'Slow Learner': 0, 'Not Analyzed': 0 };

        allData.forEach(d => {
            const r = d.riskLevel || 'Not Analyzed';
            const c = d.learnerCategory || 'Not Analyzed';
            riskBreakdown[r] = (riskBreakdown[r] || 0) + 1;
            categoryBreakdown[c] = (categoryBreakdown[c] || 0) + 1;
            if (r === 'High') atRisk++;
            scoreSum += d.performanceScore || 0;
        });

        res.json({
            success: true,
            analytics: {
                totalStudents,
                atRiskStudents: atRisk,
                classAvgScore: totalStudents ? +(scoreSum / totalStudents).toFixed(1) : 0,
                riskBreakdown,
                categoryBreakdown,
            },
        });
    } catch (err) { next(err); }
};
