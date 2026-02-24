/**
 * Seed Script – PESITM 6th Sem VTU 2025-26
 * 5 subject teachers + 133 real students from class list
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentData = require('../models/StudentData');
const Message = require('../models/Message');

const VTU_SUBJECTS = [
    { name: 'Cloud Computing', code: 'BCS601', teacher: 'sanketh@edupulse.com' },
    { name: 'Machine Learning', code: 'BCS602', teacher: 'vinutha@edupulse.com' },
    { name: 'Blockchain Technology', code: 'BCS613A', teacher: 'shivanad@edupulse.com' },
    { name: 'Open Elective', code: 'BXX654x', teacher: 'rajesh@edupulse.com' },
    { name: 'Indian Knowledge System', code: 'BIKS609', teacher: 'sunil@edupulse.com' },
];

const TEACHERS = [
    { name: 'Mr. Sanketh U G', email: 'sanketh@edupulse.com', subject: 'Cloud Computing' },
    { name: 'Ms. Vinutha H M', email: 'vinutha@edupulse.com', subject: 'Machine Learning' },
    { name: 'Mr. Shivanad C Maradi', email: 'shivanad@edupulse.com', subject: 'Blockchain Technology' },
    { name: 'Mr. Rajesh T H', email: 'rajesh@edupulse.com', subject: 'Open Elective' },
    { name: 'Dr. Sunil Kumar H R', email: 'sunil@edupulse.com', subject: 'Indian Knowledge System' },
];

// All 133 students from PESITM class list (USN, Name)
const STUDENTS_RAW = [
    ['4PM23CS001', 'ADARSH UMESH HEGDE'], ['4PM23CS002', 'ADITYA KUMAR'], ['4PM23CS003', 'AHMED SHAREEF'],
    ['4PM23CS004', 'AISHWARYA K R'], ['4PM23CS005', 'AISHWARYALAXMI'], ['4PM23CS006', 'AKASH'],
    ['4PM23CS007', 'ALOK HAVANAGI'], ['4PM23CS008', 'AMRUTHA R H'], ['4PM23CS009', 'ANAND HOLI'],
    ['4PM23CS010', 'ANANYA K JOIS'], ['4PM23CS011', 'ANISH M'], ['4PM23CS012', 'ANKITHA B'],
    ['4PM23CS013', 'ANKITHA C'], ['4PM23CS014', 'ANKITHA N B'], ['4PM23CS015', 'ANUSHA H M'],
    ['4PM23CS016', 'B M BHARATH KUMAR'], ['4PM23CS017', 'BHARGAVI S R'], ['4PM23CS018', 'BHAVYA G S'],
    ['4PM23CS019', 'CHANDANA B'], ['4PM23CS020', 'CHANDRAPPA IRAPPA BANNIHATTI'], ['4PM23CS021', 'CHETAN R J'],
    ['4PM23CS022', 'CHETAN SATYEPPA MAGADUM'], ['4PM23C0S23', 'CHINMAY S R'], ['4PM23CS024', 'D R VIJAY'],
    ['4PM23CS025', 'DASARI KEERTHAN DATTA'], ['4PM23CS026', 'DEEKSHA J R'], ['4PM23CS027', 'DHANYA P TIMALAPUR'],
    ['4PM23CS028', 'DHRUVA PATEL H'], ['4PM23CS029', 'DIVYA S K'], ['4PM23CS030', 'DUTHI S M'],
    ['4PM23CS031', 'G VARUN RAJU'], ['4PM23CS032', 'GAGAN R BANGER'], ['4PM23CS033', 'GAGANA J'],
    ['4PM23CS034', 'GORAKATI CHAITANYA REDDY'], ['4PM23CS035', 'GOWTHAM K'], ['4PM23CS036', 'H GANESH'],
    ['4PM23CS037', 'H N SPANDAN GOWDA'], ['4PM23CS038', 'HARSHA D P'], ['4PM23CS039', 'HARSHITHA B R'],
    ['4PM23CS042', 'IMRAN BAIG'], ['4PM23CS043', 'JAYASURYA V'], ['4PM23CS044', 'JEEVANA KRISHNAMOORTI NAIK'],
    ['4PM23CS045', 'JYOTI ASHOK HINDI'], ['4PM23CS046', 'K C ASHWINI'], ['4PM23CS047', 'K N NANDITHA'],
    ['4PM23CS048', 'KAVANA A'], ['4PM23CS049', 'KONA VENKATA SRUJANA SREE'], ['4PM23CS050', 'LAVANYA J'],
    ['4PM23CS051', 'LIKHITH GOWDA K N'], ['4PM23CS052', 'LINGANAGOUDA SHADAKSHARAGOUDA PATIL'],
    ['4PM23CS053', 'M C BINDU RANI'], ['4PM23CS054', 'MAHANTESHA U'], ['4PM23CS055', 'MAHERA MUSKAN'],
    ['4PM23CS056', 'MANASA M P'], ['4PM23CS057', 'MANASA N C'], ['4PM23CS058', 'MANDARA G N'],
    ['4PM23CS059', 'MANSI H J'], ['4PM23CS061', 'MD ZULKERNAIN KHAN'], ['4PM23CS062', 'MOHAMMED MAAZ F'],
    ['4PM23CS063', 'MOHAMMED SAIF KATTIMANI'], ['4PM23CS064', 'MUBARAK KHAN'], ['4PM23CS065', 'NANDAN S P'],
    ['4PM23CS066', 'NANDINI HOSAMANI'], ['4PM24CS400', 'A R VAISHNAVI'], ['4PM24CS401', 'BHUVAN S'],
    ['4PM24CS402', 'CHETHAN K C'], ['4PM23CS067', 'NIDA KHANUM'], ['4PM23CS068', 'NISHAN K N'],
    ['4PM23CS069', 'NISHANTH M R'], ['4PM23CS070', 'PALLETI PRADEEPA'], ['4PM23CS071', 'PAVAN KUMAR'],
    ['4PM23CS072', 'POOJA S'], ['4PM23CS073', 'POORVIKA J GOWDA'], ['4PM23CS074', 'PRACHI YADAV'],
    ['4PM23CS075', 'PRAHLAD P PATIL'], ['4PM23CS076', 'PRAJWAL K H'], ['4PM23CS077', 'PRANATH K J'],
    ['4PM23CS078', 'PRASHANTH C'], ['4PM23CS079', 'PREMA R B'], ['4PM23CS080', 'PRIYA R G'],
    ['4PM23CS081', 'PUSHKAR RAJ PUROHIT'], ['4PM23CS082', 'RACHANA D'], ['4PM23CS083', 'RAKSHITHA RAMESH KURDEKAR'],
    ['4PM23CS084', 'RAMYA VIJAYKUMAR KATTI'], ['4PM23CS085', 'RANJITH T H'], ['4PM23CS086', 'ROHITH D K'],
    ['4PM23CS087', 'S B SINCHANA'], ['4PM23CS088', 'S U GAYATRI'], ['4PM23CS089', 'SAHANA H M'],
    ['4PM23CS090', 'SAHANA PRABULINGAPPA KAJJERA'], ['4PM23CS091', 'SAHANA R MIRAJAKAR'], ['4PM23CS092', 'SAMARTHA B'],
    ['4PM23CS093', 'SANJANA K KUBASADA'], ['4PM23CS094', 'SANJAY A'], ['4PM23CS095', 'SANKALPA V HEGDE'],
    ['4PM23CS096', 'SATHVIK D'], ['4PM23CS097', 'SHASHANK KUMAR G N'], ['4PM23CS098', 'SHASHANK V S'],
    ['4PM23CS099', 'SHIVAJI KULKARNI'], ['4PM23CS101', 'SHUBHAM KUMAR SINGH'], ['4PM23CS102', 'SMITHA SUBHASH ISARAGONDA'],
    ['4PM23CS103', 'SNEHA T'], ['4PM23CS104', 'SOMANATH MOTAGI'], ['4PM23CS105', 'SOUMYA GURUPADAYYA HIREMATH'],
    ['4PM23CS106', 'SOUMYA M GALABHI'], ['4PM23CS107', 'SRUSHTI M V'], ['4PM23CS108', 'SUHAS PATEL N'],
    ['4PM23CS109', 'SUHASINI H PUJAR'], ['4PM23CS110', 'SUSHMA MARUTI JADHAV'], ['4PM23CS111', 'SWAYAM DATTATRAY'],
    ['4PM23CS112', 'T A ANANTHA KRISHNA'], ['4PM23CS113', 'THANUSHREE K H'], ['4PM23CS114', 'THEJAS GOWDA H J'],
    ['4PM23CS115', 'THRISHA A P'], ['4PM23CS116', 'TRISHA VISHWANATH BALI'], ['4PM23CS117', 'TUSHAR D G'],
    ['4PM23CS119', 'VEDHA P TUMMINAKATTI'], ['4PM23CS120', 'VEERENDRA K J'], ['4PM23CS121', 'VIKAS NAIK'],
    ['4PM23CS122', 'VIKAS U G'], ['4PM23CS124', 'YELLAMLA BHAVANI'], ['4PM23CS125', 'YUSRA SADIYAH SHAIKH'],
    ['4PM23CS126', 'GUNAVATHI G R'], ['4PM24CS403', 'MALLANNA RAJU KARU'], ['4PM24CS404', 'MOHAMMED SHAKIR MADANI'],
    ['4PM24CS405', 'NIKITHA HUBLIKAR'], ['4PM24CS406', 'PAVAN G'], ['4PM24CS407', 'RABIYA BASARI'],
    ['4PM24CS408', 'SACHIN MALLAPPA ADI'], ['4PM24CS409', 'SHRIDHAR K'], ['4PM24CS410', 'TEJASWINI K S'],
    ['4PM24CS411', 'VIGHNESH C'], ['4PM22CS003', 'ABHISHEK S'],
];

// Seeded random for consistent values
function seededRand(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function buildSubjects(studentIdx) {
    return VTU_SUBJECTS.map((s, si) => {
        const base = seededRand(studentIdx * 17 + si * 31);
        const tier = base < 0.2 ? 'low' : base < 0.5 ? 'mid' : 'high';
        const r = (low, high) => Math.round(low + seededRand(studentIdx * 7 + si * 13 + low) * (high - low));

        const modules = [1, 2, 3, 4, 5].map(n => ({
            moduleNo: n,
            unitTestMarks: tier === 'high' ? r(12, 20) : tier === 'mid' ? r(8, 14) : r(3, 10),
        }));

        // IA1 and IA2 are now out of 50
        const ia1 = tier === 'high' ? r(35, 50) : tier === 'mid' ? r(20, 36) : r(5, 22);
        const ia2 = tier === 'high' ? r(35, 50) : tier === 'mid' ? r(20, 36) : r(5, 22);
        const assign = tier === 'high' ? r(7, 10) : tier === 'mid' ? r(5, 8) : r(2, 6);
        // CIE = round((ia1 + ia2 + assign) / 110 * 50)
        const totalCIE = Math.round(((ia1 + ia2 + assign) / 110) * 50);

        // Sample attendance (last 20 classes)
        const today = new Date('2026-02-24');
        // Teaching days: Mon, Tue, Wed, Thu, Fri (skip Sat, Sun)
        const classDays = [];
        let d = new Date(today);
        while (classDays.length < 20) {
            const day = d.getDay();
            if (day !== 0 && day !== 6) classDays.push(d.toISOString().slice(0, 10));
            d.setDate(d.getDate() - 1);
        }
        const attRate = tier === 'high' ? 0.9 : tier === 'mid' ? 0.78 : 0.62;
        const attendance = classDays.map((date, i) => ({
            date,
            present: seededRand(studentIdx * 11 + si * 23 + i) < attRate,
        }));
        const presentCount = attendance.filter(a => a.present).length;
        const attendancePct = Math.round((presentCount / attendance.length) * 100);

        return { ...s, modules, ia1, ia2, assignment: assign, totalCIE, attendance, attendancePct };
    });
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    await User.deleteMany({});
    await StudentData.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create teachers
    for (const t of TEACHERS) {
        await User.create({ name: t.name, email: t.email, password: 'teacher123', role: 'teacher', subject: t.subject });
        console.log(`👨‍🏫 ${t.email.padEnd(28)} → ${t.subject}`);
    }

    // Create students
    let created = 0;
    for (let i = 0; i < STUDENTS_RAW.length; i++) {
        const [usn, fullName] = STUDENTS_RAW[i];
        const emailBase = usn.toLowerCase().replace(/[^a-z0-9]/g, '');
        const email = `${emailBase}@edupulse.com`;
        const subjects = buildSubjects(i);
        const avgCIE = subjects.reduce((a, s) => a + s.totalCIE, 0) / subjects.length;
        const avgAtt = subjects.reduce((a, s) => a + s.attendancePct, 0) / subjects.length;
        const perfScore = parseFloat(((0.6 * (avgCIE / 50) * 100) + (0.3 * avgAtt) + (0.1 * 60)).toFixed(1));
        const learnerCategory = perfScore >= 75 ? 'Fast Learner' : perfScore >= 50 ? 'Average Learner' : 'Slow Learner';
        const riskLevel = perfScore >= 75 ? 'Low' : perfScore >= 50 ? 'Medium' : 'High';

        const user = await User.create({ name: fullName, email, password: 'student123', role: 'student' });
        await StudentData.create({ userId: user._id, usn, subjects, performanceScore: perfScore, learnerCategory, riskLevel, recommendation: `Focus on improving your weakest subjects.`, remarks: '' });
        created++;
    }
    console.log(`\n✅ Created ${created} students`);
    console.log('\n─────────────────────────────────────────────────────');
    console.log('TEACHER LOGINS  (password: teacher123)');
    TEACHERS.forEach(t => console.log(`  ${t.email.padEnd(30)} → ${t.subject}`));
    console.log('\nSTUDENT LOGIN PATTERN: <usn_lowercase>@edupulse.com');
    console.log('  e.g.  4pm23cs001@edupulse.com / student123');
    console.log('─────────────────────────────────────────────────────');
    process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
