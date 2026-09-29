const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/environment');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeacherProfile = require('../models/TeacherProfile');
const Internship = require('../models/Internship');
const InternshipBatch = require('../models/InternshipBatch');
const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Result = require('../models/Result');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const Document = require('../models/Document');
const Payment = require('../models/Payment');
const Meeting = require('../models/Meeting');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const Settings = require('../models/Settings');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('[Seed] Connected. Clearing previous data...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      TeacherProfile.deleteMany({}),
      Internship.deleteMany({}),
      InternshipBatch.deleteMany({}),
      Task.deleteMany({}),
      TaskSubmission.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Result.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({}),
      Certificate.deleteMany({}),
      Document.deleteMany({}),
      Payment.deleteMany({}),
      Meeting.deleteMany({}),
      Message.deleteMany({}),
      ActivityLog.deleteMany({}),
      Settings.deleteMany({}),
    ]);

    console.log('[Seed] Creating Platform Settings...');
    await Settings.create({
      companyName: 'MAINDOT',
      companyEmail: 'maindot.tech@gmail.com',
      companyPhone: '+91 83208 18881',
      companyAddress: '225/4 Uniq Square, Opp. Shubham K Mart & Zudio, Dabholi, Katargam, Surat 395004',
      website: 'https://www.maindot.tech.com',
      primaryColor: '#F47B20',
      academicYear: '2026-2027',
      allowStudentRegistration: true,
      requirePaymentForEnrollment: false,
    });

    console.log('[Seed] Creating Users...');
    // Create Users with pre-hashed passwords or save
    const superAdmin = await User.create({
      name: 'Alex Vance (Super Admin)',
      email: 'superadmin@maindot.com',
      password: 'Password123!',
      role: 'SUPER_ADMIN',
      phone: '+91 98765 00001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });

    const admin = await User.create({
      name: 'Priya Sharma (Admin)',
      email: 'maindot.tech@gmail.com',
      password: 'maindot2745',
      role: 'ADMIN',
      phone: '+91 98765 00002',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      createdBy: superAdmin._id,
    });

    const teacherDevon = await User.create({
      name: 'Devon Reed (Lead Instructor)',
      email: 'teacher@maindot.com',
      password: 'Password123!',
      role: 'TEACHER',
      phone: '+91 98765 00003',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      createdBy: admin._id,
    });

    const teacherAnanya = await User.create({
      name: 'Ananya Verma (Cloud Mentor)',
      email: 'ananya@maindot.com',
      password: 'Password123!',
      role: 'TEACHER',
      phone: '+91 98765 00004',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      createdBy: admin._id,
    });

    const studentRohan = await User.create({
      name: 'Rohan Patel',
      email: 'student@maindot.com',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+91 98765 11101',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      createdBy: admin._id,
    });

    const studentNeha = await User.create({
      name: 'Neha Gupta',
      email: 'neha@maindot.com',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+91 98765 11102',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      createdBy: admin._id,
    });

    const studentArjun = await User.create({
      name: 'Arjun Nair',
      email: 'arjun@maindot.com',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+91 98765 11103',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      createdBy: admin._id,
    });

    console.log('[Seed] Creating Teacher Profiles...');
    await TeacherProfile.create([
      {
        userId: teacherDevon._id,
        employeeId: 'MD-EMP-001',
        designation: 'Principal Tech Lead & Senior Mentor',
        department: 'Full Stack & Web Systems',
        specialization: ['React.js', 'Node.js', 'System Design', 'MongoDB'],
        bio: '10+ years architecting web platforms and mentoring 500+ aspiring software engineers.',
        createdBy: admin._id,
      },
      {
        userId: teacherAnanya._id,
        employeeId: 'MD-EMP-002',
        designation: 'Staff Cloud Architect',
        department: 'Cloud & Infrastructure',
        specialization: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        bio: 'DevOps evangelist focused on microservices reliability and automated deployment pipelines.',
        createdBy: admin._id,
      },
    ]);

    console.log('[Seed] Creating Internships Tracks...');
    const internshipFswd = await Internship.create({
      title: 'Full Stack Web Development (MERN)',
      code: 'FSWD-2026',
      description:
        'End-to-end full stack web development using modern React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript, and Docker containerization.',
      domain: 'Web Development',
      durationWeeks: 12,
      level: 'Intermediate',
      prerequisites: ['HTML/CSS/JS Basics', 'Object Oriented Programming', 'Basic Git knowledge'],
      fee: 15000,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      syllabus: [
        {
          moduleNumber: 1,
          title: 'Advanced Modern JavaScript & TypeScript',
          description: 'Async/Await, Promises, Closures, Event Loop, TypeScript interfaces and types.',
          durationWeeks: 2,
          topics: ['ES6+ Modules', 'Async Patterns', 'TypeScript Fundamentals', 'Strict Typing'],
        },
        {
          moduleNumber: 2,
          title: 'Modern Frontend Architecture with React',
          description: 'React Hooks, Custom Hooks, State Management, Tailwind CSS, Performance optimization.',
          durationWeeks: 3,
          topics: ['Context API', 'Zustand/Redux', 'Component Reusability', 'Responsive UI Design'],
        },
        {
          moduleNumber: 3,
          title: 'RESTful Backend Engineering with Node & Express',
          description: 'Clean layered architecture, middleware, JWT authentication, MongoDB indexing and aggregation.',
          durationWeeks: 4,
          topics: ['REST API Standards', 'RBAC Security', 'Mongoose Schemas', 'Query Optimization'],
        },
        {
          moduleNumber: 4,
          title: 'DevOps, CI/CD, and Production Capstone',
          description: 'Docker containerization, cloud deployment on AWS/Render, automated testing, real client project.',
          durationWeeks: 3,
          topics: ['Dockerizing MERN', 'Cloud Hosting', 'Testing with Jest/Node', 'Capstone Presentation'],
        },
      ],
      createdBy: superAdmin._id,
    });

    const internshipCloud = await Internship.create({
      title: 'Cloud Engineering & DevOps Infrastructure',
      code: 'CLD-2026',
      description:
        'Master cloud architecture on AWS, infrastructure as code with Terraform, container orchestration with Kubernetes, and enterprise CI/CD pipelines.',
      domain: 'Cloud & DevOps',
      durationWeeks: 10,
      level: 'Advanced',
      prerequisites: ['Linux Basics', 'Networking Fundamentals', 'Basic Python/Bash'],
      fee: 18000,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      syllabus: [
        {
          moduleNumber: 1,
          title: 'Linux Systems & Bash Automation',
          description: 'OS internals, shell scripting, permission models, systemd services.',
          durationWeeks: 2,
          topics: ['Linux CLI', 'Bash Scripting', 'SSH & Security', 'Cron & Daemons'],
        },
        {
          moduleNumber: 2,
          title: 'AWS Core Cloud Architecture',
          description: 'VPC, EC2, IAM, S3, RDS, Lambda, and CloudWatch monitoring.',
          durationWeeks: 4,
          topics: ['Network Isolation', 'Auto Scaling', 'Serverless', 'Monitoring'],
        },
        {
          moduleNumber: 3,
          title: 'Docker & Kubernetes Orchestration',
          description: 'Multi-stage Docker builds, Kubernetes pods, deployments, services, ingress.',
          durationWeeks: 4,
          topics: ['Container Security', 'Helm Charts', 'K8s Cluster Management', 'CI/CD Pipelines'],
        },
      ],
      createdBy: superAdmin._id,
    });

    console.log('[Seed] Creating Batches...');
    const batchFswd = await InternshipBatch.create({
      batchCode: 'BATCH-2026-FSWD-01',
      title: 'Summer 2026 Full Stack Cohort Alpha',
      internshipId: internshipFswd._id,
      teachers: [teacherDevon._id],
      students: [studentRohan._id, studentNeha._id, studentArjun._id],
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      maxStudents: 30,
      scheduleDetails: {
        daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
        timing: '10:00 AM - 01:00 PM IST',
        mode: 'Hybrid',
      },
      status: 'Ongoing',
      createdBy: admin._id,
    });

    // Update teacher Devon's assigned batches
    await TeacherProfile.findOneAndUpdate(
      { userId: teacherDevon._id },
      { $addToSet: { assignedBatches: batchFswd._id } }
    );

    console.log('[Seed] Creating Student Profiles...');
    await StudentProfile.create([
      {
        userId: studentRohan._id,
        studentId: 'MD-STU-2026-0001',
        internshipId: internshipFswd._id,
        batchId: batchFswd._id,
        educationalDetails: {
          college: 'National Institute of Technology',
          degree: 'B.Tech Computer Science & Engineering',
          graduationYear: 2026,
          cgpa: '8.8',
        },
        skills: ['JavaScript', 'React.js', 'Node.js', 'Git', 'Tailwind CSS', 'MongoDB'],
        githubProfile: 'https://github.com/rohan-maindot',
        linkedinProfile: 'https://linkedin.com/in/rohan-patel-cs',
        status: 'Active',
        joiningDate: new Date('2026-06-01'),
        guardianDetails: { name: 'Kishore Patel', relation: 'Father', phone: '+91 98765 22201' },
        emergencyContact: { name: 'Kishore Patel', relation: 'Father', phone: '+91 98765 22201' },
        createdBy: admin._id,
      },
      {
        userId: studentNeha._id,
        studentId: 'MD-STU-2026-0002',
        internshipId: internshipFswd._id,
        batchId: batchFswd._id,
        educationalDetails: {
          college: 'RV College of Engineering',
          degree: 'B.E Information Science',
          graduationYear: 2026,
          cgpa: '9.1',
        },
        skills: ['React.js', 'TypeScript', 'UI/UX Design', 'Tailwind CSS', 'Redux'],
        githubProfile: 'https://github.com/neha-gupta-dev',
        linkedinProfile: 'https://linkedin.com/in/neha-gupta-web',
        status: 'Active',
        joiningDate: new Date('2026-06-01'),
        createdBy: admin._id,
      },
      {
        userId: studentArjun._id,
        studentId: 'MD-STU-2026-0003',
        internshipId: internshipFswd._id,
        batchId: batchFswd._id,
        educationalDetails: {
          college: 'PES University Bangalore',
          degree: 'B.Tech Information Technology',
          graduationYear: 2027,
          cgpa: '8.4',
        },
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST APIs'],
        githubProfile: 'https://github.com/arjun-nair-codes',
        status: 'Active',
        joiningDate: new Date('2026-06-01'),
        createdBy: admin._id,
      },
    ]);

    console.log('[Seed] Creating Tasks...');
    const task1 = await Task.create({
      title: 'Milestone 1: Build Secure JWT Authentication API',
      taskCode: 'TSK-MERN-001',
      description:
        'Create a full authentication and role authorization service with bcrypt password hashing, JWT Bearer tokens, token expiration handling, and input validation with Zod.',
      internshipId: internshipFswd._id,
      batchId: batchFswd._id,
      teacherId: teacherDevon._id,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Due 3 days ago
      maxScore: 100,
      taskType: 'Assignment',
      priority: 'High',
      attachments: [{ name: 'Auth_API_Specs.pdf', url: '/uploads/documents/sample_spec.pdf', fileType: 'pdf' }],
      createdBy: teacherDevon._id,
    });

    const task2 = await Task.create({
      title: 'Milestone 2: Design Responsive Dashboard UI with Tailwind CSS',
      taskCode: 'TSK-MERN-002',
      description:
        'Build a responsive admin and student dashboard layout with collapsible sidebar, KPI metrics cards, Recharts visual analytics, and mobile navigation drawer.',
      internshipId: internshipFswd._id,
      batchId: batchFswd._id,
      teacherId: teacherDevon._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      maxScore: 100,
      taskType: 'Project',
      priority: 'Medium',
      createdBy: teacherDevon._id,
    });

    const task3 = await Task.create({
      title: 'Milestone 3: Database Indexing & Aggregation Pipelines',
      taskCode: 'TSK-MERN-003',
      description:
        'Implement complex MongoDB aggregation queries for student performance statistics and ensure index optimization for high read throughput.',
      internshipId: internshipFswd._id,
      batchId: batchFswd._id,
      teacherId: teacherDevon._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      taskType: 'Assessment',
      priority: 'High',
      createdBy: teacherDevon._id,
    });

    console.log('[Seed] Creating Task Submissions...');
    // Rohan submitted Task 1 and was reviewed with 94/100
    await TaskSubmission.create({
      taskId: task1._id,
      studentId: studentRohan._id,
      batchId: batchFswd._id,
      githubUrl: 'https://github.com/rohan-maindot/maindot-auth-service',
      liveUrl: 'https://auth-api-demo.maindot.app',
      notes: 'Completed all required endpoints including password refresh, rate limiting, and Zod validation schemas.',
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'Reviewed',
      score: 94,
      maxScore: 100,
      feedback: 'Excellent clean architecture and proper modular middleware. Well documented Postman collection!',
      reviewedBy: teacherDevon._id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: studentRohan._id,
    });

    // Neha submitted Task 1 and is awaiting review
    await TaskSubmission.create({
      taskId: task1._id,
      studentId: studentNeha._id,
      batchId: batchFswd._id,
      githubUrl: 'https://github.com/neha-gupta-dev/auth-flow',
      notes: 'Implemented with TypeScript and cookie-based session verification.',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'Submitted',
      maxScore: 100,
      createdBy: studentNeha._id,
    });

    console.log('[Seed] Creating Attendance Records...');
    const students = [studentRohan._id, studentNeha._id, studentArjun._id];
    for (let i = 10; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setUTCHours(0, 0, 0, 0);

      for (const sId of students) {
        await Attendance.create({
          batchId: batchFswd._id,
          studentId: sId,
          date: d,
          status: i === 4 && sId.equals(studentRohan._id) ? 'Late' : 'Present',
          checkInTime: new Date(d.getTime() + 10 * 3600000 + (i === 4 ? 25 * 60000 : 0)),
          markedBy: teacherDevon._id,
          createdBy: teacherDevon._id,
        });
      }
    }

    console.log('[Seed] Creating Leave Applications...');
    await Leave.create([
      {
        studentId: studentRohan._id,
        batchId: batchFswd._id,
        leaveType: 'Academic',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        reason: 'College semester end-term practical examination.',
        status: 'Approved',
        reviewRemarks: 'Approved. Please make sure to catch up on the recorded session.',
        reviewedBy: teacherDevon._id,
        reviewedAt: new Date(),
        createdBy: studentRohan._id,
      },
      {
        studentId: studentArjun._id,
        batchId: batchFswd._id,
        leaveType: 'Sick',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        reason: 'Suffering from viral fever. Doctor advised 2 days bed rest.',
        status: 'Pending',
        createdBy: studentArjun._id,
      },
    ]);

    console.log('[Seed] Creating Evaluations & Results...');
    await Result.create([
      {
        studentId: studentRohan._id,
        batchId: batchFswd._id,
        internshipId: internshipFswd._id,
        title: 'Midterm Practical Evaluation',
        evaluationType: 'Midterm',
        totalMarks: 100,
        marksObtained: 92,
        grade: 'A+',
        remarks: 'Outstanding performance in technical architecture and React component patterns.',
        published: true,
        evaluatedBy: teacherDevon._id,
        createdBy: teacherDevon._id,
      },
      {
        studentId: studentNeha._id,
        batchId: batchFswd._id,
        internshipId: internshipFswd._id,
        title: 'Midterm Practical Evaluation',
        evaluationType: 'Midterm',
        totalMarks: 100,
        marksObtained: 89,
        grade: 'A',
        remarks: 'Great UI design sensibility, clean CSS styling and structured code.',
        published: true,
        evaluatedBy: teacherDevon._id,
        createdBy: teacherDevon._id,
      },
    ]);

    console.log('[Seed] Creating Announcements...');
    await Announcement.create([
      {
        title: 'Welcome to MAINDOT Internship 2026!',
        content:
          'We are thrilled to welcome all selected interns to the MAINDOT technical training cohort. Please review the course syllabus and join the orientation session on Google Meet.',
        targetAudience: 'All',
        priority: 'High',
        authorId: superAdmin._id,
        createdBy: superAdmin._id,
      },
      {
        title: 'Guest Masterclass: Production Microservices with Kubernetes',
        content:
          'Join us this Friday at 4:00 PM IST for an exclusive session with senior cloud architects from MAINDOT IT Solutions discussing real-world Kubernetes deployments.',
        targetAudience: 'Students',
        priority: 'Normal',
        authorId: teacherAnanya._id,
        createdBy: teacherAnanya._id,
      },
    ]);

    console.log('[Seed] Creating Meetings...');
    await Meeting.create([
      {
        title: 'Full Stack Sprint Review & Mentorship Standup',
        description: 'Weekly sprint review, code walkthrough, and Q&A session with Devon Reed.',
        meetingType: 'Mentorship',
        batchId: batchFswd._id,
        hostId: teacherDevon._id,
        attendees: [studentRohan._id, studentNeha._id, studentArjun._id],
        scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduledEndTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        meetingLink: 'https://meet.google.com/mdt-fswd-meet',
        platform: 'GoogleMeet',
        status: 'Scheduled',
        createdBy: teacherDevon._id,
      },
    ]);

    console.log('[Seed] Creating Payments...');
    await Payment.create([
      {
        invoiceNumber: 'MD-INV-2026-0001',
        studentId: studentRohan._id,
        internshipId: internshipFswd._id,
        batchId: batchFswd._id,
        amount: 15000,
        currency: 'INR',
        paymentMethod: 'Online',
        transactionId: 'TXN-RAZORPAY-882193',
        paymentDate: new Date('2026-05-28'),
        status: 'Completed',
        notes: 'Full tuition fee paid online via UPI/Netbanking.',
        verifiedBy: admin._id,
        createdBy: studentRohan._id,
      },
      {
        invoiceNumber: 'MD-INV-2026-0002',
        studentId: studentNeha._id,
        internshipId: internshipFswd._id,
        batchId: batchFswd._id,
        amount: 15000,
        currency: 'INR',
        paymentMethod: 'BankTransfer',
        transactionId: 'TXN-HDFC-991204',
        paymentDate: new Date('2026-05-29'),
        status: 'Completed',
        verifiedBy: admin._id,
        createdBy: studentNeha._id,
      },
    ]);

    console.log('[Seed] Creating Documents...');
    await Document.create([
      {
        title: 'MAINDOT Intern Code of Conduct & Policies',
        category: 'Policy',
        fileUrl: '/uploads/documents/maindot_policies_2026.pdf',
        fileSize: 1024 * 512,
        fileType: 'application/pdf',
        isPublicToStudents: true,
        uploadedBy: admin._id,
        createdBy: admin._id,
      },
      {
        title: 'Full Stack MERN Architecture Blueprint',
        category: 'StudyMaterial',
        fileUrl: '/uploads/documents/mern_blueprint_v1.pdf',
        fileSize: 1024 * 1024 * 2,
        fileType: 'application/pdf',
        internshipId: internshipFswd._id,
        isPublicToStudents: true,
        uploadedBy: teacherDevon._id,
        createdBy: teacherDevon._id,
      },
    ]);

    console.log('[Seed] Creating Sample Certificate with Verification Code...');
    await Certificate.create({
      certificateNumber: 'MD-CERT-2026-0001',
      studentId: studentRohan._id,
      internshipId: internshipFswd._id,
      batchId: batchFswd._id,
      issueDate: new Date(),
      completionDate: new Date('2026-08-31'),
      grade: 'A+',
      verificationCode: 'MDVERIFY2026A1',
      verificationUrl: '/verify/MDVERIFY2026A1',
      templateData: {
        studentName: 'Rohan Patel',
        internshipTitle: 'Full Stack Web Development (MERN)',
        batchCode: 'BATCH-2026-FSWD-01',
        directorSignature: 'MAINDOT Academic Directorate',
      },
      status: 'Issued',
      issuedBy: admin._id,
      createdBy: admin._id,
    });

    console.log('[Seed] Creating Messages & Discussions...');
    await Message.create([
      {
        senderId: teacherDevon._id,
        batchId: batchFswd._id,
        messageType: 'BatchDiscussion',
        content:
          'Welcome everyone! Please remember that tomorrow is our live code review session at 10 AM. Feel free to ask questions here.',
        createdBy: teacherDevon._id,
      },
      {
        senderId: studentRohan._id,
        receiverId: teacherDevon._id,
        messageType: 'Direct',
        content: 'Hi Devon, I pushed my update for Milestone 1 with Zod validation. Thank you for the feedback!',
        createdBy: studentRohan._id,
      },
    ]);

    console.log('[Seed] Creating Notifications...');
    await Notification.create([
      {
        recipientId: studentRohan._id,
        title: 'Assignment Graded 🌟',
        message: 'Your submission for Milestone 1 has been graded: 94/100.',
        type: 'Grade',
        link: '/tasks',
        isRead: false,
      },
      {
        recipientId: studentRohan._id,
        title: 'Live Mentorship Tomorrow 📅',
        message: 'Sprint review tomorrow at 10:00 AM IST on Google Meet.',
        type: 'Task',
        link: '/meetings',
        isRead: false,
      },
    ]);

    console.log('[Seed] Creating Activity Logs...');
    await ActivityLog.create([
      {
        userId: superAdmin._id,
        action: 'PLATFORM_INITIALIZATION',
        module: 'SYSTEM',
        details: { description: 'MAINDOT Internship Management System initialized with demo data.' },
        ipAddress: '127.0.0.1',
        status: 'Success',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('👑 Super Admin : superadmin@maindot.com');
    console.log('🛡️ Admin       : maindot.tech@gmail.com / maindot2745');
    console.log('👨‍🏫 Teacher     : teacher@maindot.com');
    console.log('🎓 Student     : student@maindot.com');
    console.log('======================================================');
    console.log('Sample Certificate Verification Code: MDVERIFY2026A1');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
