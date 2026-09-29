const { z } = require('zod');

// Auth Validators
const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']).optional().default('STUDENT'),
    phone: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

const updatePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
};

// Internship Validators
const internshipSchema = {
  body: z.object({
    title: z.string().min(3).max(150),
    code: z.string().min(2).max(20),
    description: z.string().min(10),
    domain: z.string().min(2),
    durationWeeks: z.number().int().min(1).max(52),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().default('Intermediate'),
    prerequisites: z.array(z.string()).optional(),
    fee: z.number().min(0).optional().default(0),
    coverImage: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
};

// Batch Validators
const batchSchema = {
  body: z.object({
    batchCode: z.string().min(2).max(30),
    title: z.string().min(3).max(150),
    internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid internship ID'),
    teachers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    students: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    maxStudents: z.number().int().min(1).optional().default(50),
    scheduleDetails: z
      .object({
        daysOfWeek: z.array(z.string()).optional(),
        timing: z.string().optional(),
        mode: z.enum(['Online', 'Offline', 'Hybrid']).optional(),
      })
      .optional(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Archived']).optional().default('Ongoing'),
  }),
};

// Task Validators
const taskSchema = {
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10),
    internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid internship ID'),
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid batch ID'),
    dueDate: z.string().or(z.date()),
    maxScore: z.number().int().min(1).optional().default(100),
    taskType: z.enum(['Assignment', 'Project', 'Quiz', 'Assessment']).optional().default('Assignment'),
    priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string(),
          fileType: z.string().optional(),
        })
      )
      .optional(),
  }),
};

// Task Submission Validators
const submissionSchema = {
  body: z.object({
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
    githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).optional(),
    liveUrl: z.string().url('Invalid Live Demo URL').or(z.literal('')).optional(),
    notes: z.string().optional(),
    submissionFiles: z
      .array(
        z.object({
          name: z.string(),
          url: z.string(),
          fileType: z.string().optional(),
          size: z.number().optional(),
        })
      )
      .optional(),
  }),
};

const gradeSubmissionSchema = {
  body: z.object({
    score: z.number().min(0),
    feedback: z.string().min(1, 'Feedback is required'),
    status: z.enum(['Reviewed', 'Late', 'Resubmitted']).optional().default('Reviewed'),
  }),
};

// Attendance Validators
const markAttendanceSchema = {
  body: z.object({
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid batch ID'),
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID').optional(),
    date: z.string().or(z.date()).optional(),
    status: z.enum(['Present', 'Absent', 'Late', 'Excused']).optional().default('Present'),
    notes: z.string().optional(),
    records: z
      .array(
        z.object({
          studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
          notes: z.string().optional(),
        })
      )
      .optional(),
  }),
};

// Leave Validators
const leaveSchema = {
  body: z.object({
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid batch ID'),
    leaveType: z.enum(['Sick', 'Casual', 'Academic', 'Emergency']),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    documentUrl: z.string().optional(),
  }),
};

const reviewLeaveSchema = {
  body: z.object({
    status: z.enum(['Approved', 'Rejected']),
    reviewRemarks: z.string().optional(),
  }),
};

// Result Validators
const resultSchema = {
  body: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    title: z.string().min(2),
    evaluationType: z.enum(['Midterm', 'Final', 'Project', 'Practical']).optional().default('Final'),
    totalMarks: z.number().min(1).default(100),
    marksObtained: z.number().min(0),
    remarks: z.string().optional(),
    published: z.boolean().optional().default(true),
  }),
};

// Announcement Validators
const announcementSchema = {
  body: z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(5),
    targetAudience: z.enum(['All', 'Students', 'Teachers', 'SpecificBatch']).default('All'),
    targetBatchId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
    priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
    attachments: z.array(z.any()).optional(),
  }),
};

// Certificate Validators
const issueCertificateSchema = {
  body: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    internshipId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    completionDate: z.string().or(z.date()),
    grade: z.string().optional().default('A'),
    templateData: z
      .object({
        studentName: z.string().optional(),
        internshipTitle: z.string().optional(),
        batchCode: z.string().optional(),
        directorSignature: z.string().optional(),
      })
      .optional(),
  }),
};

// Meeting Validators
const meetingSchema = {
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    meetingType: z.enum(['Lecture', 'Mentorship', 'Review', 'General']).default('Mentorship'),
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    scheduledStartTime: z.string().or(z.date()),
    scheduledEndTime: z.string().or(z.date()),
    meetingLink: z.string().url('Must be a valid meeting URL'),
    platform: z.enum(['GoogleMeet', 'Zoom', 'Teams', 'Internal']).default('GoogleMeet'),
  }),
};

// Message Validators
const messageSchema = {
  body: z.object({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    batchId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    messageType: z.enum(['Direct', 'BatchDiscussion']).default('Direct'),
    content: z.string().min(1, 'Message cannot be empty'),
  }),
};

// Settings Validators
const settingsSchema = {
  body: z.object({
    companyName: z.string().optional(),
    companyEmail: z.string().email().optional(),
    companyPhone: z.string().optional(),
    companyAddress: z.string().optional(),
    website: z.string().url().optional(),
    primaryColor: z.string().optional(),
    academicYear: z.string().optional(),
    termsAndConditions: z.string().optional(),
    allowStudentRegistration: z.boolean().optional(),
    requirePaymentForEnrollment: z.boolean().optional(),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  internshipSchema,
  batchSchema,
  taskSchema,
  submissionSchema,
  gradeSubmissionSchema,
  markAttendanceSchema,
  leaveSchema,
  reviewLeaveSchema,
  resultSchema,
  announcementSchema,
  issueCertificateSchema,
  meetingSchema,
  messageSchema,
  settingsSchema,
};
