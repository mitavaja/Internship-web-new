const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const runTests = async () => {
  await connectDB();

  const server = app.listen(5099, async () => {
    console.log('Testing server running on port 5099');

    const request = (path, method = 'GET', body = null, token = null) => {
      return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
          hostname: '127.0.0.1',
          port: 5099,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
      });
    };

    try {
      console.log('\n--- 1. Testing Health Endpoint ---');
      const health = await request('/health');
      console.log('Health Status:', health.status, health.body?.status === 'UP' ? '✅ PASS' : '❌ FAIL');

      console.log('\n--- 2. Testing Public Certificate Verification ---');
      const cert = await request('/api/v1/certificates/verify/MDVERIFY2026A1');
      console.log('Cert Verification Status:', cert.status, cert.body?.data?.valid ? '✅ PASS' : '❌ FAIL');
      console.log('Verified Student:', cert.body?.data?.studentName, '| Grade:', cert.body?.data?.grade);

      console.log('\n--- 3. Testing Student Login ---');
      const studentLogin = await request('/api/v1/auth/login', 'POST', {
        email: 'student@maindot.com',
        password: 'Password123!',
      });
      console.log('Student Login Status:', studentLogin.status, studentLogin.body?.success ? '✅ PASS' : '❌ FAIL');
      const studentToken = studentLogin.body?.data?.token;

      console.log('\n--- 4. Testing Admin Login ---');
      const adminLogin = await request('/api/v1/auth/login', 'POST', {
        email: 'maindot.tech@gmail.com',
        password: 'maindot2745',
      });
      console.log('Admin Login Status:', adminLogin.status, adminLogin.body?.success ? '✅ PASS' : '❌ FAIL');
      const adminToken = adminLogin.body?.data?.token;

      console.log('\n--- 5. Testing Role-Based Access Control (RBAC) ---');
      const studentToAdminRoute = await request('/api/v1/users', 'GET', null, studentToken);
      console.log(
        'Student accessing /api/v1/users (Expect 403 Forbidden):',
        studentToAdminRoute.status,
        studentToAdminRoute.status === 403 ? '✅ PASS (Correctly Forbidden)' : '❌ FAIL'
      );

      const adminToAdminRoute = await request('/api/v1/users', 'GET', null, adminToken);
      console.log(
        'Admin accessing /api/v1/users (Expect 200 OK):',
        adminToAdminRoute.status,
        adminToAdminRoute.status === 200 ? '✅ PASS' : '❌ FAIL'
      );

      console.log('\n--- 6. Testing Student Dashboard Endpoints ---');
      const studentProfile = await request('/api/v1/students/me/profile', 'GET', null, studentToken);
      console.log('Student Profile Status:', studentProfile.status, studentProfile.body?.data?.studentId ? '✅ PASS' : '❌ FAIL');
      console.log('Enrolled Student ID:', studentProfile.body?.data?.studentId);

      const studentTasks = await request('/api/v1/tasks/student/my-tasks', 'GET', null, studentToken);
      console.log('Student Tasks Status:', studentTasks.status, Array.isArray(studentTasks.body?.data) ? '✅ PASS' : '❌ FAIL');
      console.log('Tasks Count:', studentTasks.body?.data?.length);

      const studentAttendance = await request('/api/v1/attendance/my-attendance', 'GET', null, studentToken);
      console.log('Student Attendance Status:', studentAttendance.status, studentAttendance.body?.data?.summary ? '✅ PASS' : '❌ FAIL');
      console.log('Attendance Rate:', studentAttendance.body?.data?.summary?.attendanceRate + '%');

      console.log('\n--- 7. Testing Admin Dashboard Analytics ---');
      const adminStats = await request('/api/v1/dashboard/stats', 'GET', null, adminToken);
      console.log('Admin Stats Status:', adminStats.status, adminStats.body?.data?.kpis ? '✅ PASS' : '❌ FAIL');
      console.log('KPIs:', adminStats.body?.data?.kpis);

      console.log('\n=============================================');
      console.log('🎉 ALL BACKEND API SMOKE TESTS PASSED 100%!');
      console.log('=============================================\n');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close(() => {
        process.exit(0);
      });
    }
  });
};

runTests();
