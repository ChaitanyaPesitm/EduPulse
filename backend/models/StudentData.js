const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    moduleNo: { type: Number, required: true },  // 1–5
    unitTestMarks: { type: Number, default: 0, min: 0, max: 20 },
}, { _id: false });

const attendanceEntrySchema = new mongoose.Schema({
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    present: { type: Boolean, default: false },
}, { _id: false });

const VTU_SUBJECTS = [
    { name: 'Cloud Computing', code: 'BCS601', teacher: 'sanketh@edupulse.com' },
    { name: 'Machine Learning', code: 'BCS602', teacher: 'vinutha@edupulse.com' },
    { name: 'Blockchain Technology', code: 'BCS613A', teacher: 'shivanad@edupulse.com' },
    { name: 'Open Elective', code: 'BXX654x', teacher: 'rajesh@edupulse.com' },
    { name: 'Indian Knowledge System', code: 'BIKS609', teacher: 'sunil@edupulse.com' },
];

/**
 * Marks Structure (VTU CIE):
 *   IA1      : 0–50  (exam on Modules 1, 2, first half of 3)
 *   IA2      : 0–50  (exam on second half of Module 3, 4, 5)
 *   Assignment: 0–10
 *   Raw Total = IA1 + IA2 + Assignment  (max 110)
 *   CIE (out of 50) = round(raw * 50 / 110)
 */
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    teacher: { type: String, required: true },

    modules: {
        type: [moduleSchema],
        default: () => [1, 2, 3, 4, 5].map(n => ({ moduleNo: n, unitTestMarks: 0 })),
    },

    ia1: { type: Number, default: 0, min: 0, max: 50 },
    ia2: { type: Number, default: 0, min: 0, max: 50 },
    assignment: { type: Number, default: 0, min: 0, max: 10 },
    totalCIE: { type: Number, default: 0 },   // auto = round((ia1+ia2+assignment)/110 * 50)

    attendance: { type: [attendanceEntrySchema], default: [] },
    attendancePct: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const studentDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    usn: { type: String, default: '' },

    subjects: {
        type: [subjectSchema],
        default: () => VTU_SUBJECTS.map(s => ({
            name: s.name, code: s.code, teacher: s.teacher,
            modules: [1, 2, 3, 4, 5].map(n => ({ moduleNo: n, unitTestMarks: 0 })),
        })),
    },

    performanceScore: { type: Number, default: 0 },
    learnerCategory: { type: String, default: 'Not Analyzed' },
    riskLevel: { type: String, default: 'Not Analyzed' },
    recommendation: { type: String, default: '' },
    remarks: { type: String, default: '' },
}, { timestamps: true });

// Helper: compute CIE from raw scores
studentDataSchema.statics.calcCIE = (ia1, ia2, assignment) =>
    Math.round(((Number(ia1) + Number(ia2) + Number(assignment)) / 110) * 50);

const StudentData = mongoose.model('StudentData', studentDataSchema);
StudentData.VTU_SUBJECTS = VTU_SUBJECTS;
module.exports = StudentData;
