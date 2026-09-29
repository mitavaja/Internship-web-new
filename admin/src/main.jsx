import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Award, BarChart3, BookOpen, BriefcaseBusiness, CalendarCheck, Check, ChevronDown, ChevronRight, ClipboardList, CreditCard, FileText, GraduationCap, LogOut, Menu, MessageSquare, Pencil, Plus, RefreshCw, Search, Send, ShieldCheck, Trash2, UserRound, Users, Video, X } from 'lucide-react';
import './index.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const ConfirmationContext = createContext(null);
const useConfirmation = () => useContext(ConfirmationContext);

function ConfirmationProvider({ children }) {
  const [confirmation, setConfirmation] = useState(null);
  const resolver = useRef(null);
  const confirm = (options) => new Promise((resolve) => {
    resolver.current = resolve;
    setConfirmation(options);
  });
  const finish = (accepted) => {
    resolver.current?.(accepted);
    resolver.current = null;
    setConfirmation(null);
  };

  useEffect(() => {
    if (!confirmation) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') finish(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmation]);

  return <ConfirmationContext.Provider value={confirm}>
    {children}
    {confirmation && <div className="modal-backdrop confirmation-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) finish(false); }}>
      <section className="confirmation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message">
        <div className="confirmation-icon"><Trash2 size={19} /></div>
        <h2 id="confirmation-title">{confirmation.title || 'Confirm action'}</h2>
        <p id="confirmation-message">{confirmation.message}</p>
        <div className="confirmation-actions"><button className="secondary-button" type="button" onClick={() => finish(false)}>Cancel</button><button className="confirmation-danger" type="button" onClick={() => finish(true)}>{confirmation.confirmLabel || 'Delete'}</button></div>
      </section>
    </div>}
  </ConfirmationContext.Provider>;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maindot_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const request = async (method, path, data) => {
  try {
    const response = await api({ method, url: path, data });
    if (method.toLowerCase() !== 'get' && path !== '/auth/login') {
      const serverMessage = response.data?.message;
      const cleanMessage = serverMessage?.replace(/[.!?]+$/, '');
      toast.success(cleanMessage && /successfully$/i.test(cleanMessage) ? `${cleanMessage}!` : `${cleanMessage || 'Saved'} successfully!`);
    }
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('maindot_admin_token');
      localStorage.removeItem('maindot_admin_user');
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    const message = error.response?.data?.message || 'Something went wrong!';
      if (!error.toastShown) toast.error(message || 'Something went wrong!');
      throw Object.assign(new Error(message), { toastShown: true });
  }
};

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'leaves', label: 'Leaves', icon: CalendarCheck },
  { id: 'results', label: 'Results & Grades', icon: Award },
  { id: 'submissions', label: 'Submissions', icon: Check },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'meetings', label: 'Mentorship', icon: Video },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'internships', label: 'Internships', icon: BriefcaseBusiness },
  { id: 'batches', label: 'Batches', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: BookOpen },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'users', label: 'All users', icon: ShieldCheck },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await request('post', '/auth/login', { email, password });
      if (!['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(result.data.user.role)) {
        const message = 'This console is restricted to administrators and teachers.';
        toast.error(message);
        throw new Error(message);
      }
      localStorage.setItem('maindot_admin_token', result.data.token);
      localStorage.setItem('maindot_admin_user', JSON.stringify(result.data.user));
      toast.success('Logged in successfully!');
      onLogin(result.data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <aside className="login-art">
        <div className="login-art-pattern" aria-hidden="true" />
        <div className="login-brand"><span className="login-brand-mark">M</span><span>MAINDOT<small>INTERNSHIP MANAGEMENT</small></span></div>
        <div className="login-art-copy">
          <p className="eyebrow">MAINDOT / OPERATIONS</p>
          <h2>Make room for<br /><span>what&apos;s next.</span></h2>
          <p>A clearer view of every learner, mentor, and milestone.</p>
        </div>
        <div className="login-art-footer">
          <div className="login-pulse">
            <div className="pulse-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <div><span>PLATFORM PULSE</span><strong><i /> READY FOR TODAY</strong></div>
          </div>
          <span className="login-access-note">SECURE ADMIN ACCESS / 2026</span>
        </div>
      </aside>
      <section className="login-panel">
        <div className="login-panel-inner">
          <p className="login-step">01 <span>/</span> SIGN IN</p>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1>Good to have you back.</h1>
          <p className="login-copy">Sign in with your administrator account to continue.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="admin-email">Work email<input id="admin-email" type="email" autoComplete="username" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label htmlFor="admin-password">Password<input id="admin-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <div className="alert error login-error" role="alert">{error}</div>}
            <button className="primary-button" disabled={loading}><span>{loading ? 'Signing in...' : 'Sign in to console'}</span><ChevronRight size={17} /></button>
          </form>
          <p className="login-security"><ShieldCheck size={15} /> Protected workspace <span>/</span> Authorized users only</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('maindot_admin_token');
    return token ? JSON.parse(localStorage.getItem('maindot_admin_user') || 'null') : null;
  });
  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const logout = () => {
    localStorage.removeItem('maindot_admin_token');
    localStorage.removeItem('maindot_admin_user');
    setAccountMenuOpen(false);
    setProfileOpen(false);
    setUser(null);
  };
  const openProfile = () => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    setAccountMenuOpen(false);
    setProfileOpen(true);
  };
  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    try {
      const userId = user._id || user.id;
      const result = await request('put', `/users/${userId}`, profileForm);
      const updatedUser = { ...user, ...result.data, id: userId };
      setUser(updatedUser);
      localStorage.setItem('maindot_admin_user', JSON.stringify(updatedUser));
      setProfileOpen(false);
    } catch (err) {
      if (!err.toastShown) toast.error(err.message || 'Something went wrong!');
    } finally {
      setProfileSaving(false);
    }
  };
  const syncCurrentUser = (updatedUser) => {
    const currentUserId = user._id || user.id;
    const updatedUserId = updatedUser._id || updatedUser.id;
    if (String(currentUserId) !== String(updatedUserId)) return;
    const syncedUser = { ...user, ...updatedUser, id: currentUserId };
    setUser(syncedUser);
    localStorage.setItem('maindot_admin_user', JSON.stringify(syncedUser));
  };
  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('admin-session-expired', handleExpiredSession);
    return () => window.removeEventListener('admin-session-expired', handleExpiredSession);
  }, []);
  if (!user) return <Login onLogin={setUser} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="side-brand"><span className="small-mark">M</span><span>MAINDOT <small>ADMIN</small></span><button className="icon-button mobile-close" onClick={() => setMobileNav(false)}><X size={19} /></button></div>
      <div className="side-label">Workspace</div>
      <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'nav-item active' : 'nav-item'} onClick={() => { setSection(id); setMobileNav(false); }}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-footer account-footer">
        <button className="account-trigger" type="button" aria-expanded={accountMenuOpen} aria-label={`Account options for ${user.name || 'admin'}`} onClick={() => setAccountMenuOpen((open) => !open)}>
          <span className="avatar">{user.name?.slice(0, 1) || 'A'}</span>
          <span className="account-trigger-copy"><strong>{user.name || 'Administrator'}</strong><small>{(user.role || 'ADMIN').replace(/_/g, ' ')}</small></span>
          <ChevronDown size={15} />
        </button>
        {accountMenuOpen && <div className="account-menu">
          <button type="button" onClick={openProfile}><UserRound size={16} /> My profile</button>
          <button type="button" onClick={logout}><LogOut size={16} /> Log out</button>
        </div>}
      </div>
    </aside>
    {mobileNav && <button className="nav-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="main-content">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button><div><p className="eyebrow">MAINDOT / {section}</p><h2>{navItems.find((item) => item.id === section)?.label}</h2></div><div className="topbar-user"><span className="status-dot" /> Live system</div></header>
      <section className="page-content">{section === 'overview' && <Overview />}{section === 'tasks' && <TaskManager user={user} />}{section === 'attendance' && <AttendanceManager />}{section === 'leaves' && <LeaveManager />}{section === 'results' && <ResultManager user={user} />}{section === 'internships' && <InternshipManager user={user} />}{section === 'batches' && <BatchManager user={user} />}{section === 'students' && <Directory type="students" />}{section === 'teachers' && <TeacherManager user={user} />}{section === 'submissions' && <SubmissionManager />}{section === 'certificates' && <CertificateManager user={user} />}{section === 'chat' && <ChatManager user={user} />}{section === 'users' && <UsersDirectory user={user} onUserUpdated={syncCurrentUser} />}{['meetings', 'resources', 'payments'].includes(section) && <AdminOperations type={section} user={user} />}</section>
    </main>
    {profileOpen && <div className="modal-backdrop profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
      <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="profile-dialog-heading"><div><p className="eyebrow">Account / Profile</p><h2 id="profile-title">Your profile</h2></div><button className="icon-button" type="button" aria-label="Close profile" onClick={() => setProfileOpen(false)}><X size={19} /></button></div>
        <div className="profile-identity"><div className="avatar profile-avatar">{user.name?.slice(0, 1) || 'A'}</div><div><strong>{user.name || 'Administrator'}</strong><span>{(user.role || 'ADMIN').replace(/_/g, ' ')}</span></div></div>
        <form className="profile-edit-form" onSubmit={saveProfile}>
          <label>Name<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required maxLength={100} /></label>
          <label>Email<input value={user.email || ''} readOnly /></label>
          <label>Phone<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label>
          <div className="profile-readonly-row"><span>Access level</span><strong>{(user.role || 'ADMIN').replace(/_/g, ' ')}</strong></div>
          <div className="profile-dialog-actions"><button className="secondary-button" type="button" onClick={() => setProfileOpen(false)} disabled={profileSaving}>Cancel</button><button className="primary-button compact-button" type="submit" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button></div>
        </form>
      </section>
    </div>}
  </div>;
}

function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = async () => { try { setError(''); const result = await request('get', '/dashboard/stats'); setData(result.data); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  if (error) return <LoadError message={error} retry={load} />;
  if (!data) return <Loading />;
  const kpis = data.kpis || {};
  return <>
    <div className="page-intro"><div><p className="eyebrow">Today’s pulse</p><h1>Good morning, keep things moving.</h1><p className="muted">A live view of your internship operation.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
    <div className="metric-grid"><Metric label="Total students" value={kpis.totalStudents} accent="lime" /><Metric label="Active batches" value={kpis.activeBatches} /><Metric label="Teaching team" value={kpis.totalTeachers} accent="coral" /><Metric label="Awaiting review" value={kpis.pendingSubmissions} accent="gold" /><Metric label="Certificates issued" value={kpis.totalCertificates} /></div>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Latest arrivals</p><h3>Recent students</h3></div><button className="text-button">View directory <ChevronRight size={15} /></button></div>{(data.recentStudents || []).map((student) => { const studentUser = student.userId && typeof student.userId === 'object' ? student.userId : student.user && typeof student.user === 'object' ? student.user : {}; const studentName = studentUser.name || student.name || student.fullName || 'Unnamed student'; const studentEmail = studentUser.email || student.email || 'No email'; return <div className="person-row" key={student._id}><div className="avatar pale">{studentName.trim().charAt(0).toUpperCase()}</div><div className="person-copy"><strong>{studentName}</strong><small>{studentEmail}</small></div><span className="row-meta">{student.internshipId?.title || 'Unassigned'}</span></div>; })}{!data.recentStudents?.length && <Empty text="No students found yet." />}</section><section className="panel dark-panel"><p className="eyebrow">Submission flow</p><h3>Work waiting for a review</h3><div className="big-number">{kpis.pendingSubmissions || 0}</div><div className="progress-track"><span style={{ width: `${Math.min(100, (kpis.pendingSubmissions || 0) * 8)}%` }} /></div><p className="muted light">Pending, submitted, or late task submissions across all active cohorts.</p></section></div>
  </>;
}

function Directory({ type }) {
  const [rows, setRows] = useState(null); const [query, setQuery] = useState(''); const [error, setError] = useState('');
  const [internships, setInternships] = useState([]); const [batches, setBatches] = useState([]); const [selectedStudent, setSelectedStudent] = useState(null); const [assignment, setAssignment] = useState({ internshipId: '', batchId: '' }); const [saving, setSaving] = useState(false);
  const load = async () => { try { setError(''); const result = await request('get', `/${type}?limit=100`); setRows(result.data || []); if (type === 'students') { const [internshipResult, batchResult] = await Promise.all([request('get', '/internships?limit=100'), request('get', '/batches?limit=100')]); setInternships(internshipResult.data || []); setBatches(batchResult.data || []); } } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, [type]);
  const filtered = (rows || []).filter((row) => `${row.userId?.name || ''} ${row.userId?.email || ''} ${row.studentId || row.employeeId || ''}`.toLowerCase().includes(query.toLowerCase()));
  const openAssignment = (student) => { setSelectedStudent(student); setAssignment({ internshipId: student.internshipId?._id || student.internshipId || '', batchId: student.batchId?._id || student.batchId || '' }); };
  const matchingBatches = batches.filter((batch) => (batch.internshipId?._id || batch.internshipId) === assignment.internshipId);
  const saveAssignment = async (event) => { event.preventDefault(); setSaving(true); try { await request('put', `/students/${selectedStudent._id}`, assignment); setSelectedStudent(null); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  if (error) return <LoadError message={error} retry={load} />;
  return <><div className="page-intro"><div><p className="eyebrow">Directory / {type}</p><h1>{type === 'students' ? 'Student directory' : 'Teaching team'}</h1><p className="muted">{rows ? `${rows.length} records in the system.` : 'Loading records...'}</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div><section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or ID" /></div></div>{!rows ? <Loading /> : filtered.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>{type === 'students' ? 'Student ID' : 'Employee ID'}</th><th>Status</th><th>Program</th>{type === 'students' && <th>Actions</th>}</tr></thead><tbody>{filtered.map((row) => <tr key={row._id}><td><strong>{row.userId?.name || 'Unnamed'}</strong></td><td>{row.userId?.email || '—'}</td><td>{row.studentId || row.employeeId || '—'}</td><td><span className={row.userId?.isActive === false ? 'pill muted-pill' : 'pill'}>{row.userId?.isActive === false ? 'Inactive' : 'Active'}</span></td><td>{row.internshipId?.title || row.department || 'Unassigned'}</td>{type === 'students' && <td><button className="text-button" onClick={() => openAssignment(row)}>{row.batchId ? 'Update batch' : 'Assign batch'}</button></td>}</tr>)}</tbody></table></div> : <Empty text="No matching records." />}</section>{selectedStudent && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">Student enrollment</p><h3>Assign {selectedStudent.userId?.name}</h3></div><button className="icon-button" onClick={() => setSelectedStudent(null)}><X size={19} /></button></div><form className="task-form" onSubmit={saveAssignment}><label>Internship track<select value={assignment.internshipId} onChange={(event) => { const internshipId = event.target.value; const firstBatch = batches.find((batch) => (batch.internshipId?._id || batch.internshipId) === internshipId); setAssignment({ internshipId, batchId: firstBatch?._id || '' }); }} required><option value="">Select track</option>{internships.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.code})</option>)}</select></label><label>Batch<select value={assignment.batchId} onChange={(event) => setAssignment({ ...assignment, batchId: event.target.value })} required><option value="">Select batch</option>{matchingBatches.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.batchCode})</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSelectedStudent(null)}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={saving || !assignment.batchId}>{saving ? 'Saving...' : 'Assign student'}</button></div></form></section></div>}</>;
}

function TaskManager({ user }) {
  const confirm = useConfirmation();
  const emptyForm = { title: '', description: '', internshipId: '', batchId: '', dueDate: '', maxScore: 100, taskType: 'Assignment', priority: 'Medium' };
  const [tasks, setTasks] = useState(null);
  const [internships, setInternships] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError('');
      const [taskResult, internshipResult, batchResult] = await Promise.all([
        request('get', '/tasks?limit=100'),
        request('get', '/internships?limit=100'),
        request('get', '/batches?limit=100'),
      ]);
      setTasks(taskResult.data || []);
      setInternships(internshipResult.data || []);
      setBatches(batchResult.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    const internshipId = internships[0]?._id || '';
    const firstBatch = batches.find((batch) => (batch.internshipId?._id || batch.internshipId) === internshipId);
    setForm({ ...emptyForm, internshipId, batchId: firstBatch?._id || '' });
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title || '', description: task.description || '', internshipId: task.internshipId?._id || task.internshipId || '', batchId: task.batchId?._id || task.batchId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '', maxScore: task.maxScore || 100, taskType: task.taskType || 'Assignment', priority: task.priority || 'Medium',
    });
    setShowForm(true);
  };

  const saveTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, maxScore: Number(form.maxScore) };
      if (editing) await request('put', `/tasks/${editing._id}`, payload);
      else await request('post', '/tasks', payload);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async (task) => {
    if (!await confirm({ title: 'Delete task?', message: `Delete task "${task.title}"? This action cannot be undone.` })) return;
    try { await request('delete', `/tasks/${task._id}`); await load(); } catch (err) { setError(err.message); }
  };

  const visibleTasks = (tasks || []).filter((task) => `${task.title} ${task.taskCode} ${task.batchId?.title || ''}`.toLowerCase().includes(query.toLowerCase()));
  const availableBatches = batches.filter((batch) => (batch.internshipId?._id || batch.internshipId) === form.internshipId);
  const canDelete = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  if (error && !tasks) return <LoadError message={error} retry={load} />;

  return <>
    <div className="page-intro"><div><p className="eyebrow">Assignments / tasks</p><h1>Task management</h1><p className="muted">Create assignments and send them to a selected internship batch.</p></div><div className="intro-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="primary-button compact-button" onClick={openCreate}><Plus size={16} /> Add task</button></div></div>
    {error && <div className="alert error page-alert task-alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
    <section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, codes, or batches" /></div></div>{!tasks ? <Loading /> : visibleTasks.length ? <div className="table-wrap"><table><thead><tr><th>Task</th><th>Batch</th><th>Due date</th><th>Type</th><th>Priority</th><th>Actions</th></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task._id}><td><strong>{task.title}</strong><small className="table-subtitle">{task.taskCode || 'No code'}</small></td><td>{task.batchId?.title || '—'}</td><td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td><td>{task.taskType}</td><td><span className={`priority ${task.priority?.toLowerCase()}`}>{task.priority}</span></td><td><div className="row-actions"><button className="icon-button action-edit" title="Edit task" onClick={() => openEdit(task)}><Pencil size={15} /></button>{canDelete && <button className="icon-button action-delete" title="Delete task" onClick={() => removeTask(task)}><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table></div> : <Empty text="No tasks found. Add the first assignment for a batch." />}</section>
    {showForm && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Update task' : 'New assignment'}</p><h3>{editing ? 'Edit task details' : 'Assign a task'}</h3></div><button className="icon-button" onClick={() => setShowForm(false)}><X size={19} /></button></div><form className="task-form" onSubmit={saveTask}><label>Task title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={200} /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={4} /></label><div className="form-grid"><label>Internship track<select value={form.internshipId} onChange={(event) => { const internshipId = event.target.value; const firstBatch = batches.find((batch) => (batch.internshipId?._id || batch.internshipId) === internshipId); setForm({ ...form, internshipId, batchId: firstBatch?._id || '' }); }} required disabled={!!editing}><option value="">Select track</option>{internships.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.code})</option>)}</select></label><label>Assign to batch<select value={form.batchId} onChange={(event) => setForm({ ...form, batchId: event.target.value })} required disabled={!!editing}><option value="">Select batch</option>{availableBatches.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.batchCode})</option>)}</select></label><label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></label><label>Maximum score<input type="number" min="1" value={form.maxScore} onChange={(event) => setForm({ ...form, maxScore: event.target.value })} required /></label><label>Task type<select value={form.taskType} onChange={(event) => setForm({ ...form, taskType: event.target.value })}><option>Assignment</option><option>Project</option><option>Quiz</option><option>Assessment</option></select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={saving || !form.batchId}>{saving ? 'Saving...' : <><Check size={16} /> {editing ? 'Update task' : 'Create task'}</>}</button></div></form></section></div>}
  </>;
}

function AttendanceManager() {
  const today = new Date().toISOString().slice(0, 10);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(today);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBatches = async () => {
    try {
      const result = await request('get', '/batches?limit=100');
      const data = result.data || [];
      setBatches(data);
      if (!batchId && data[0]) setBatchId(data[0]._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSheet = async () => {
    if (!batchId) return;
    try {
      setError('');
      const result = await request('get', `/attendance/batch/${batchId}?date=${date}&refresh=${Date.now()}`);
      setSheet(result.data?.sheet || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadBatches(); }, []);
  useEffect(() => { loadSheet(); }, [batchId, date]);

  const updateRow = (studentId, field, value) => {
    setSheet((rows) => rows.map((row) => row.studentId === studentId ? { ...row, [field]: value } : row));
  };

  const markAll = (status) => {
    setSheet((rows) => rows.map((row) => ({ ...row, status })));
  };

  const save = async () => {
    setSaving(true);
    try {
      await request('post', '/attendance/batch', { batchId, date, records: sheet.map((row) => ({ studentId: row.studentId, status: row.status, notes: row.notes || '' })) });
      await loadSheet();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const counts = (sheet || []).reduce((result, row) => { result[row.status] = (result[row.status] || 0) + 1; return result; }, {});
  if (error && !sheet) return <LoadError message={error} retry={loadSheet} />;

  return <>
    <div className="page-intro"><div><p className="eyebrow">Operations / attendance</p><h1>Attendance & check-in</h1><p className="muted">Mark daily attendance for every student in a live batch.</p></div><button className="secondary-button" onClick={loadSheet}><RefreshCw size={16} /> Refresh</button></div>
    {error && <div className="alert error page-alert task-alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
    <section className="panel attendance-controls"><label>Batch<select value={batchId} onChange={(event) => setBatchId(event.target.value)}><option value="">Select batch</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.title} ({batch.batchCode})</option>)}</select></label><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><div className="attendance-actions"><button className="secondary-button" onClick={() => markAll('Present')} disabled={!sheet}>Mark all present</button><button className="secondary-button" onClick={() => markAll('Absent')} disabled={!sheet}>Mark all absent</button><button className="primary-button compact-button" onClick={save} disabled={!sheet || saving}>{saving ? 'Saving...' : <><Check size={16} /> Save attendance</>}</button></div></section>
    <div className="attendance-summary"><span><strong>{sheet?.length || 0}</strong> students</span><span className="present-text"><strong>{counts.Present || 0}</strong> present</span><span className="late-text"><strong>{counts.Late || 0}</strong> late</span><span className="absent-text"><strong>{counts.Absent || 0}</strong> absent</span></div>
    <section className="panel table-panel">{!sheet ? <Loading /> : sheet.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Email</th><th>Status</th><th>Notes</th><th>Check-in</th></tr></thead><tbody>{sheet.map((row) => <tr key={row.studentId}><td><strong>{row.name}</strong></td><td>{row.email}</td><td><select className={`status-select ${row.status.toLowerCase()}`} value={row.status} onChange={(event) => updateRow(row.studentId, 'status', event.target.value)}><option>Present</option><option>Absent</option><option>Late</option><option>Excused</option></select></td><td><input className="notes-input" value={row.notes || ''} onChange={(event) => updateRow(row.studentId, 'notes', event.target.value)} placeholder="Optional note" /></td><td>{row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '—'}</td></tr>)}</tbody></table></div> : <Empty text="This batch has no enrolled students yet." />}</section>
  </>;
}

function TeacherManager({ user }) {
  const confirm = useConfirmation();
  const empty = { name: '', email: '', password: 'Password123!', phone: '', designation: 'Technical Mentor', department: 'Engineering', specialization: '', bio: '' };
  const [rows, setRows] = useState(null); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(false); const [query, setQuery] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = async () => { try { setError(''); const result = await request('get', '/teachers?limit=100'); setRows(result.data || []); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.userId?.name || '', email: row.userId?.email || '', password: '', phone: row.userId?.phone || '', designation: row.designation || '', department: row.department || '', specialization: (row.specialization || []).join(', '), bio: row.bio || '' }); setShowForm(true); };
  const save = async (event) => { event.preventDefault(); setSaving(true); try { if (editing) { await request('put', `/teachers/${editing._id}`, { designation: form.designation, department: form.department, specialization: form.specialization.split(',').map((item) => item.trim()).filter(Boolean), bio: form.bio }); await request('put', `/users/${editing.userId._id}`, { name: form.name, phone: form.phone }); } else { await request('post', '/users', { name: form.name, email: form.email, password: form.password || 'Password123!', phone: form.phone, role: 'TEACHER' }); } setShowForm(false); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const remove = async (row) => { if (!await confirm({ title: 'Delete teacher?', message: `Delete teacher "${row.userId?.name}"? This action cannot be undone.` })) return; try { await request('delete', `/users/${row.userId._id}`); await load(); } catch (err) { setError(err.message); } };
  const visible = (rows || []).filter((row) => `${row.userId?.name || ''} ${row.userId?.email || ''} ${row.employeeId || ''}`.toLowerCase().includes(query.toLowerCase()));
  if (error && !rows) return <LoadError message={error} retry={load} />;
  return <><div className="page-intro"><div><p className="eyebrow">Directory / teachers</p><h1>Teaching team</h1><p className="muted">Create mentors, update profiles, and manage access.</p></div><div className="intro-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="primary-button compact-button" onClick={openCreate}><Plus size={16} /> Add teacher</button></div></div>{error && <div className="alert error page-alert task-alert">{error}</div>}<section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teachers" /></div></div>{!rows ? <Loading /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Employee ID</th><th>Department</th><th>Actions</th></tr></thead><tbody>{visible.map((row) => <tr key={row._id}><td><strong>{row.userId?.name}</strong></td><td>{row.userId?.email}</td><td>{row.employeeId || '—'}</td><td>{row.department || '—'}</td><td><div className="row-actions"><button className="icon-button action-edit" onClick={() => openEdit(row)} title="Edit teacher"><Pencil size={15} /></button><button className="icon-button action-delete" onClick={() => remove(row)} title="Delete teacher"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <Empty text="No teachers found." />}</section>{showForm && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Update teacher' : 'New teacher'}</p><h3>{editing ? 'Edit teacher profile' : 'Add teaching team member'}</h3></div><button className="icon-button" onClick={() => setShowForm(false)}><X size={19} /></button></div><form className="task-form" onSubmit={save}><div className="form-grid"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required disabled={!!editing} /></label><label>{editing ? 'Password unchanged' : 'Temporary password'}<input type={editing ? 'text' : 'password'} value={editing ? 'Managed by account' : form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} disabled={!!editing} /></label><label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Designation<input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} /></label><label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></label></div><label>Specializations<textarea rows={2} value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} placeholder="React, Node.js, MongoDB" /></label><label>Bio<textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button compact-button" disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> {editing ? 'Update teacher' : 'Create teacher'}</>}</button></div></form></section></div>}</>;
}

function LeaveManager() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [selected, setSelected] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError('');
      const result = await request('get', '/leaves?limit=200');
      setRows(result.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const openReview = (leave) => {
    setSelected(leave);
    setReviewRemarks(leave.reviewRemarks || '');
  };

  const review = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      await request('put', `/leaves/${selected._id}/review`, { status, reviewRemarks: reviewRemarks.trim() });
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const counts = (rows || []).reduce((result, leave) => {
    result[leave.status] = (result[leave.status] || 0) + 1;
    return result;
  }, {});
  const visible = (rows || []).filter((leave) => filter === 'All' || leave.status === filter);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const statusClass = (status) => `leave-status ${status?.toLowerCase() || 'pending'}`;

  if (error && !rows) return <LoadError message={error} retry={load} />;

  return <>
    <div className="page-intro"><div><p className="eyebrow">People / leave requests</p><h1>Leave requests</h1><p className="muted">Review student leave applications and send your decision.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
    {error && <div className="alert error page-alert task-alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
    <div className="leave-summary"><span><strong>{rows?.length || 0}</strong> total</span><span className="leave-count-pending"><strong>{counts.Pending || 0}</strong> pending</span><span className="leave-count-approved"><strong>{counts.Approved || 0}</strong> approved</span><span className="leave-count-rejected"><strong>{counts.Rejected || 0}</strong> rejected</span></div>
    <section className="panel table-panel leave-panel">
      <div className="leave-toolbar"><div className="leave-filters" role="group" aria-label="Filter leave requests">{['Pending', 'Approved', 'Rejected', 'All'].map((status) => <button key={status} type="button" className={filter === status ? 'leave-filter active' : 'leave-filter'} onClick={() => setFilter(status)}>{status}{status !== 'All' && <span>{counts[status] || 0}</span>}</button>)}</div></div>
      {!rows ? <Loading /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Leave period</th><th>Type / Batch</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((leave) => <tr key={leave._id}><td><strong>{leave.studentId?.name || 'Unknown student'}</strong><small className="table-subtitle">{leave.studentId?.email || 'No email'}</small></td><td>{formatDate(leave.startDate)}<small className="table-subtitle">to {formatDate(leave.endDate)}</small></td><td><strong>{leave.leaveType}</strong><small className="table-subtitle">{leave.batchId?.title || leave.batchId?.batchCode || 'No batch'}</small></td><td className="leave-reason-cell">{leave.reason}</td><td><span className={statusClass(leave.status)}>{leave.status}</span></td><td><button className="text-button leave-review-button" onClick={() => openReview(leave)}>{leave.status === 'Pending' ? 'Review' : 'View'}</button></td></tr>)}</tbody></table></div> : <Empty text={filter === 'Pending' ? 'No pending leave requests.' : `No ${filter.toLowerCase()} leave requests.`} />}
    </section>
    {selected && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setSelected(null); }}><section className="task-modal leave-review-modal" role="dialog" aria-modal="true" aria-labelledby="leave-review-title"><div className="modal-heading"><div><p className="eyebrow">Leave application / {selected.leaveType}</p><h3 id="leave-review-title">{selected.studentId?.name || 'Student request'}</h3><p className="muted">{selected.studentId?.email || ''}</p></div><button className="icon-button" type="button" aria-label="Close review" onClick={() => setSelected(null)}><X size={19} /></button></div>
      <dl className="leave-review-details"><div><dt>Dates</dt><dd>{formatDate(selected.startDate)} – {formatDate(selected.endDate)}</dd></div><div><dt>Batch</dt><dd>{selected.batchId?.title || 'Not assigned'}</dd></div><div><dt>Status</dt><dd><span className={statusClass(selected.status)}>{selected.status}</span></dd></div></dl>
      <div className="leave-reason"><strong>Reason</strong><p>{selected.reason}</p></div>
      {selected.documentUrl && <a className="leave-document" href={selected.documentUrl} target="_blank" rel="noreferrer">Open supporting document</a>}
      {selected.status === 'Pending' ? <><label className="leave-remarks-label">Review note <span>Optional</span><textarea rows={3} value={reviewRemarks} onChange={(event) => setReviewRemarks(event.target.value)} placeholder="Add a note for the student" /></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelected(null)} disabled={saving}>Cancel</button><button className="leave-reject-button" type="button" onClick={() => review('Rejected')} disabled={saving}>{saving ? 'Saving...' : 'Reject'}</button><button className="leave-approve-button" type="button" onClick={() => review('Approved')} disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> Approve</>}</button></div></> : <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelected(null)}>Close</button></div>}
    </section></div>}
  </>;
}

function InternshipManager({ user }) {
  const confirm = useConfirmation();
  const empty = { title: '', code: '', description: '', domain: '', durationWeeks: 12, level: 'Intermediate', prerequisites: '', fee: 0, isActive: true };
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const canDelete = user.role === 'SUPER_ADMIN';

  const load = async () => {
    try {
      setError('');
      const result = await request('get', '/internships?limit=100');
      setRows(result.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (internship) => {
    setEditing(internship);
    setForm({
      title: internship.title || '',
      code: internship.code || '',
      description: internship.description || '',
      domain: internship.domain || '',
      durationWeeks: internship.durationWeeks || 1,
      level: internship.level || 'Intermediate',
      prerequisites: (internship.prerequisites || []).join(', '),
      fee: internship.fee || 0,
      isActive: internship.isActive !== false,
    });
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        domain: form.domain.trim(),
        durationWeeks: Number(form.durationWeeks),
        level: form.level,
        prerequisites: form.prerequisites.split(',').map((item) => item.trim()).filter(Boolean),
        fee: Number(form.fee),
        isActive: form.isActive,
      };
      if (editing) await request('put', `/internships/${editing._id}`, payload);
      else await request('post', '/internships', { ...payload, code: form.code.trim().toUpperCase() });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (internship) => {
    if (!await confirm({ title: 'Delete internship track?', message: `Delete "${internship.title}"? This action cannot be undone.` })) return;
    try {
      await request('delete', `/internships/${internship._id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = (rows || []).filter((internship) => `${internship.title} ${internship.code} ${internship.domain}`.toLowerCase().includes(query.toLowerCase()));
  if (error && !rows) return <LoadError message={error} retry={load} />;

  return <>
    <div className="page-intro"><div><p className="eyebrow">Programs / internships</p><h1>Internship tracks</h1><p className="muted">Create and maintain programs used by batches, tasks, and certificates.</p></div><div className="intro-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="primary-button compact-button" onClick={openCreate}><Plus size={16} /> Add internship</button></div></div>
    {error && <div className="alert error page-alert task-alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
    <section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search internship tracks" /></div></div>{!rows ? <Loading /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Internship</th><th>Domain</th><th>Duration</th><th>Level</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((internship) => <tr key={internship._id}><td><strong>{internship.title}</strong><small className="table-subtitle">{internship.code}</small></td><td>{internship.domain}</td><td>{internship.durationWeeks} weeks</td><td>{internship.level}</td><td>{Number(internship.fee || 0).toLocaleString()}</td><td><span className={internship.isActive === false ? 'pill muted-pill' : 'pill'}>{internship.isActive === false ? 'Inactive' : 'Active'}</span></td><td><div className="row-actions"><button className="icon-button action-edit" onClick={() => openEdit(internship)} title="Edit internship"><Pencil size={15} /></button>{canDelete && <button className="icon-button action-delete" onClick={() => remove(internship)} title="Delete internship"><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table></div> : <Empty text={query ? 'No matching internship tracks.' : 'No internship tracks yet. Add one to make it available when creating a batch.'} />}</section>
    {showForm && <div className="modal-backdrop"><section className="task-modal internship-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Update program' : 'New program'}</p><h3>{editing ? 'Edit internship track' : 'Create an internship track'}</h3></div><button className="icon-button" type="button" aria-label="Close form" onClick={() => setShowForm(false)}><X size={19} /></button></div><form className="task-form" onSubmit={save}>
      <div className="form-grid"><label>Track title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={3} maxLength={150} /></label><label>Track code<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required minLength={2} maxLength={20} disabled={!!editing} placeholder="e.g. FSWD-2026" /></label><label>Domain<input value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} required minLength={2} placeholder="e.g. Web Development" /></label><label>Duration (weeks)<input type="number" min="1" max="52" value={form.durationWeeks} onChange={(event) => setForm({ ...form, durationWeeks: event.target.value })} required /></label><label>Level<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label>Fee<input type="number" min="0" step="1" value={form.fee} onChange={(event) => setForm({ ...form, fee: event.target.value })} required /></label></div>
      <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required minLength={10} rows={4} /></label><label>Prerequisites <span className="field-hint">Comma-separated</span><input value={form.prerequisites} onChange={(event) => setForm({ ...form, prerequisites: event.target.value })} placeholder="HTML basics, Git fundamentals" /></label><label className="toggle-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Available for new batches</label>
      <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button compact-button" type="submit" disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> {editing ? 'Save changes' : 'Create internship'}</>}</button></div>
    </form></section></div>}
  </>;
}

function BatchManager({ user }) {
  const confirm = useConfirmation();
  const empty = { batchCode: '', title: '', internshipId: '', teacherId: '', startDate: '', endDate: '', maxStudents: 50, status: 'Ongoing', mode: 'Online', timing: '10:00 AM - 01:00 PM IST' };
  const [rows, setRows] = useState(null); const [internships, setInternships] = useState([]); const [teachers, setTeachers] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(false); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = async () => { try { setError(''); const [batchResult, internshipResult, teacherResult] = await Promise.all([request('get', '/batches?limit=100'), request('get', '/internships?limit=100'), request('get', '/teachers?limit=100')]); setRows(batchResult.data || []); setInternships(internshipResult.data || []); setTeachers(teacherResult.data || []); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const openCreate = () => { setEditing(null); setForm({ ...empty, internshipId: internships[0]?._id || '', teacherId: teachers[0]?.userId?._id || '' }); setShowForm(true); };
  const openEdit = (row) => { setEditing(row); setForm({ batchCode: row.batchCode, title: row.title, internshipId: row.internshipId?._id || row.internshipId || '', teacherId: row.teachers?.[0]?._id || '', startDate: row.startDate?.slice(0, 10) || '', endDate: row.endDate?.slice(0, 10) || '', maxStudents: row.maxStudents || 50, status: row.status || 'Ongoing', mode: row.scheduleDetails?.mode || 'Online', timing: row.scheduleDetails?.timing || '' }); setShowForm(true); };
  const save = async (event) => { event.preventDefault(); setSaving(true); try { const payload = { title: form.title, internshipId: form.internshipId, teachers: form.teacherId ? [form.teacherId] : [], startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), maxStudents: Number(form.maxStudents), status: form.status, scheduleDetails: { mode: form.mode, timing: form.timing, daysOfWeek: ['Monday', 'Wednesday', 'Friday'] } }; if (editing) await request('put', `/batches/${editing._id}`, payload); else await request('post', '/batches', { ...payload, batchCode: form.batchCode }); setShowForm(false); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const remove = async (row) => { if (!await confirm({ title: 'Delete batch?', message: `Delete batch "${row.title}"? This action cannot be undone.` })) return; try { await request('delete', `/batches/${row._id}`); await load(); } catch (err) { setError(err.message); } };
  if (error && !rows) return <LoadError message={error} retry={load} />;
  return <><div className="page-intro"><div><p className="eyebrow">Cohorts / batches</p><h1>Batch management</h1><p className="muted">Create cohorts, attach mentors, and update schedules.</p></div><div className="intro-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="primary-button compact-button" onClick={openCreate}><Plus size={16} /> Add batch</button></div></div>{error && <div className="alert error page-alert task-alert">{error}</div>}<section className="panel table-panel">{!rows ? <Loading /> : rows.length ? <div className="table-wrap"><table><thead><tr><th>Batch</th><th>Program</th><th>Dates</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td><strong>{row.title}</strong><small className="table-subtitle">{row.batchCode}</small></td><td>{row.internshipId?.title || '—'}</td><td>{new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}</td><td>{row.students?.length || 0} / {row.maxStudents}</td><td><span className="pill">{row.status}</span></td><td><div className="row-actions"><button className="icon-button action-edit" onClick={() => openEdit(row)} title="Edit batch"><Pencil size={15} /></button><button className="icon-button action-delete" onClick={() => remove(row)} title="Delete batch"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <Empty text="No batches found." />}</section>{showForm && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Update batch' : 'New batch'}</p><h3>{editing ? 'Edit cohort details' : 'Create a cohort'}</h3></div><button className="icon-button" onClick={() => setShowForm(false)}><X size={19} /></button></div><form className="task-form" onSubmit={save}><div className="form-grid"><label>Batch code<input value={form.batchCode} onChange={(event) => setForm({ ...form, batchCode: event.target.value })} required disabled={!!editing} /></label><label>Batch title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label><label>Internship<select value={form.internshipId} onChange={(event) => setForm({ ...form, internshipId: event.target.value })} required disabled={!!editing}>{internships.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></label><label>Teacher<select value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })}><option value="">No teacher yet</option>{teachers.map((item) => <option key={item.userId?._id} value={item.userId?._id}>{item.userId?.name}</option>)}</select></label><label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required /></label><label>End date<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required /></label><label>Max students<input type="number" min="1" value={form.maxStudents} onChange={(event) => setForm({ ...form, maxStudents: event.target.value })} required /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Upcoming</option><option>Ongoing</option><option>Completed</option><option>Archived</option></select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button compact-button" disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> {editing ? 'Update batch' : 'Create batch'}</>}</button></div></form></section></div>}</>;
}

function SubmissionManager() {
  const confirm = useConfirmation();
  const [rows, setRows] = useState(null); const [query, setQuery] = useState(''); const [selected, setSelected] = useState(null); const [score, setScore] = useState(''); const [feedback, setFeedback] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = async () => { try { setError(''); const result = await request('get', '/submissions?limit=100'); setRows(result.data || []); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const openReview = (row) => { setSelected(row); setScore(row.score ?? ''); setFeedback(row.feedback || ''); };
  const grade = async (event) => { event.preventDefault(); setSaving(true); try { await request('put', `/submissions/${selected._id}/grade`, { score: Number(score), feedback, status: 'Reviewed' }); setSelected(null); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const remove = async (row) => { if (!await confirm({ title: 'Delete submission?', message: 'Delete this student submission? This action cannot be undone.' })) return; try { await request('delete', `/submissions/${row._id}`); await load(); } catch (err) { setError(err.message); } };
  const visible = (rows || []).filter((row) => `${row.studentId?.name || ''} ${row.taskId?.title || ''} ${row.status || ''}`.toLowerCase().includes(query.toLowerCase()));
  if (error && !rows) return <LoadError message={error} retry={load} />;
  return <><div className="page-intro"><div><p className="eyebrow">Learning / submissions</p><h1>Student submissions</h1><p className="muted">Review links, notes, and grades submitted by students.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>{error && <div className="alert error page-alert task-alert">{error}</div>}<section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student, task, or status" /></div></div>{!rows ? <Loading /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Task</th><th>Batch</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((row) => <tr key={row._id}><td><strong>{row.studentId?.name}</strong><small className="table-subtitle">{row.studentId?.email}</small></td><td>{row.taskId?.title || '—'}</td><td>{row.batchId?.title || '—'}</td><td>{row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '—'}</td><td><span className="pill">{row.status}</span></td><td><button className="text-button" onClick={() => openReview(row)}>{row.status === 'Reviewed' ? 'Update grade' : 'Review'}</button></td></tr>)}</tbody></table></div> : <Empty text="No student submissions yet." />}</section>{selected && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">Submission review</p><h3>{selected.taskId?.title}</h3><p className="muted">{selected.studentId?.name} / {selected.studentId?.email}</p></div><button className="icon-button" onClick={() => setSelected(null)}><X size={19} /></button></div><div className="submission-links">{selected.githubUrl && <a href={selected.githubUrl} target="_blank" rel="noreferrer">Open GitHub repository</a>}{selected.liveUrl && <a href={selected.liveUrl} target="_blank" rel="noreferrer">Open live demo</a>}<p>{selected.notes || 'No student notes.'}</p></div><form className="task-form" onSubmit={grade}><div className="form-grid"><label>Score / {selected.maxScore}<input type="number" min="0" max={selected.maxScore} value={score} onChange={(event) => setScore(event.target.value)} required /></label><label>Status<select value="Reviewed" disabled><option>Reviewed</option></select></label></div><label>Feedback<textarea rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)} required placeholder="Write actionable feedback" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSelected(null)}>Cancel</button><button className="primary-button compact-button" disabled={saving}>{saving ? 'Saving...' : <><Check size={16} /> Save review</>}</button></div></form></section></div>}</>;
}

function ResultManager({ user }) {
  const confirm = useConfirmation();
  const emptyForm = { studentId: '', batchId: '', internshipId: '', title: '', evaluationType: 'Final', totalMarks: 100, marksObtained: '', remarks: '', published: true };
  const [rows, setRows] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const canDelete = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const load = async () => {
    try {
      setError('');
      const [resultResponse, studentResponse, batchResponse, internshipResponse] = await Promise.all([
        request('get', '/results?limit=200'),
        request('get', '/students?limit=200'),
        request('get', '/batches?limit=200'),
        request('get', '/internships?limit=200'),
      ]);
      setRows(resultResponse.data || []);
      setStudents(studentResponse.data || []);
      setBatches(batchResponse.data || []);
      setInternships(internshipResponse.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const getId = (value) => value && typeof value === 'object' ? value._id : value || '';
  const selectedStudent = students.find((student) => String(getId(student.userId)) === String(form.studentId));
  const assignedBatchId = getId(selectedStudent?.batchId);
  const eligibleBatches = assignedBatchId ? batches.filter((batch) => String(batch._id) === String(assignedBatchId)) : batches;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const chooseStudent = (studentId) => {
    const student = students.find((item) => String(getId(item.userId)) === String(studentId));
    const batchId = getId(student?.batchId);
    const batch = batches.find((item) => String(item._id) === String(batchId));
    setForm({
      ...form,
      studentId,
      batchId,
      internshipId: getId(student?.internshipId) || getId(batch?.internshipId),
    });
  };

  const chooseBatch = (batchId) => {
    const batch = batches.find((item) => item._id === batchId);
    setForm({ ...form, batchId, internshipId: getId(batch?.internshipId) });
  };

  const openEdit = (result) => {
    setEditing(result);
    setForm({
      ...emptyForm,
      title: result.title || '',
      evaluationType: result.evaluationType || 'Final',
      totalMarks: result.totalMarks || 100,
      marksObtained: result.marksObtained ?? '',
      remarks: result.remarks || '',
      published: result.published === true,
    });
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        evaluationType: form.evaluationType,
        totalMarks: Number(form.totalMarks),
        marksObtained: Number(form.marksObtained),
        remarks: form.remarks.trim(),
        published: form.published,
      };
      if (editing) {
        await request('put', `/results/${editing._id}`, payload);
      } else {
        await request('post', '/results', {
          ...payload,
          studentId: form.studentId,
          batchId: form.batchId,
          internshipId: form.internshipId,
        });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (result) => {
    if (!await confirm({ title: 'Delete result?', message: `Delete "${result.title}" for ${result.studentId?.name || 'this student'}? This action cannot be undone.` })) return;
    try {
      await request('delete', `/results/${result._id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = (rows || []).reduce((summary, result) => {
    summary[result.published ? 'Published' : 'Draft'] += 1;
    return summary;
  }, { Published: 0, Draft: 0 });
  const visible = (rows || []).filter((result) => {
    const matchesFilter = filter === 'All' || (filter === 'Published' ? result.published : !result.published);
    const matchesSearch = `${result.studentId?.name || ''} ${result.studentId?.email || ''} ${result.title || ''} ${result.batchId?.batchCode || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  if (error && !rows) return <LoadError message={error} retry={load} />;

  return <>
    <div className="page-intro"><div><p className="eyebrow">Assessment / gradebook</p><h1>Results & Grades</h1><p className="muted">Record scores and publish evaluations to student accounts.</p></div><div className="intro-actions"><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button><button className="primary-button compact-button" onClick={openCreate}><Plus size={16} /> Add result</button></div></div>
    {error && <div className="alert error page-alert task-alert">{error}<button className="text-button" onClick={() => setError('')}>Dismiss</button></div>}
    <div className="result-summary"><span><strong>{rows?.length || 0}</strong> assessments</span><span className="result-published-count"><strong>{counts.Published}</strong> published</span><span className="result-draft-count"><strong>{counts.Draft}</strong> drafts</span></div>
    <section className="panel table-panel result-panel"><div className="result-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student, assessment, or batch" /></div><div className="result-filters" role="group" aria-label="Filter results">{['All', 'Published', 'Draft'].map((status) => <button key={status} type="button" className={filter === status ? 'result-filter active' : 'result-filter'} onClick={() => setFilter(status)}>{status}</button>)}</div></div>
      {!rows ? <Loading /> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Assessment</th><th>Batch / program</th><th>Score</th><th>Grade</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((result) => <tr key={result._id}><td><strong>{result.studentId?.name || 'Unknown student'}</strong><small className="table-subtitle">{result.studentId?.email || 'No email'}</small></td><td><strong>{result.title}</strong><small className="table-subtitle">{result.evaluationType}</small></td><td><strong>{result.batchId?.batchCode || '—'}</strong><small className="table-subtitle">{result.internshipId?.title || 'No program'}</small></td><td>{result.marksObtained} / {result.totalMarks}<small className="table-subtitle">{result.percentage ?? 0}%</small></td><td><span className="result-grade">{result.grade || '—'}</span></td><td><span className={result.published ? 'result-status published' : 'result-status draft'}>{result.published ? 'Published' : 'Draft'}</span></td><td><div className="row-actions"><button className="icon-button action-edit" title="Edit result" onClick={() => openEdit(result)}><Pencil size={15} /></button>{canDelete && <button className="icon-button action-delete" title="Delete result" onClick={() => remove(result)}><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table></div> : <Empty text={query ? 'No matching results.' : filter === 'All' ? 'No grades recorded yet. Add a result to publish an assessment.' : `No ${filter.toLowerCase()} results.`} />}
    </section>
    {showForm && <div className="modal-backdrop"><section className="task-modal result-modal"><div className="modal-heading"><div><p className="eyebrow">{editing ? 'Grade update' : 'New assessment'}</p><h3>{editing ? 'Edit result' : 'Record a student result'}</h3></div><button className="icon-button" type="button" aria-label="Close result form" onClick={() => setShowForm(false)}><X size={19} /></button></div><form className="task-form" onSubmit={save}>
      {!editing && <div className="form-grid"><label>Student<select value={form.studentId} onChange={(event) => chooseStudent(event.target.value)} required><option value="">Select student</option>{students.map((student) => <option key={student._id} value={getId(student.userId)}>{student.userId?.name || student.name || 'Unnamed student'}{student.studentId ? ` (${student.studentId})` : ''}</option>)}</select></label><label>Batch<select value={form.batchId} onChange={(event) => chooseBatch(event.target.value)} required disabled={!form.studentId || (!!assignedBatchId && eligibleBatches.length === 1)}><option value="">Select batch</option>{eligibleBatches.map((batch) => <option key={batch._id} value={batch._id}>{batch.title} ({batch.batchCode})</option>)}</select></label><label>Internship<select value={form.internshipId} onChange={(event) => setForm({ ...form, internshipId: event.target.value })} required disabled={!!form.batchId}><option value="">Select internship</option>{internships.map((internship) => <option key={internship._id} value={internship._id}>{internship.title} ({internship.code})</option>)}</select></label></div>}
      {editing && <div className="result-student-note"><strong>{editing.studentId?.name || 'Student'}</strong><span>{editing.batchId?.batchCode || 'Batch'} / {editing.internshipId?.title || 'Internship'}</span></div>}
      <label>Assessment title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={2} maxLength={200} placeholder="e.g. React milestone assessment" /></label><div className="form-grid"><label>Assessment type<select value={form.evaluationType} onChange={(event) => setForm({ ...form, evaluationType: event.target.value })}><option>Midterm</option><option>Final</option><option>Project</option><option>Practical</option></select></label><label>Total marks<input type="number" min="1" step="any" value={form.totalMarks} onChange={(event) => setForm({ ...form, totalMarks: event.target.value })} required /></label><label>Marks obtained<input type="number" min="0" step="any" max={form.totalMarks} value={form.marksObtained} onChange={(event) => setForm({ ...form, marksObtained: event.target.value })} required /></label></div><label>Mentor remarks<textarea rows={3} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} placeholder="Optional feedback for the student" /></label>
      <label className="result-publish-toggle"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span><strong>Publish to student</strong><small>{form.published ? 'Student can see this result after saving.' : 'Save as a draft hidden from the student.'}</small></span></label>
      <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button><button className="primary-button compact-button" type="submit" disabled={saving || (!editing && (!students.length || !batches.length || !internships.length))}>{saving ? 'Saving...' : <><Check size={16} /> {editing ? 'Save changes' : form.published ? 'Publish result' : 'Save draft'}</>}</button></div>
      {!editing && (!students.length || !batches.length || !internships.length) && <p className="result-form-note">A student, batch and internship must exist before a score can be recorded.</p>}
    </form></section></div>}
  </>;
}

function CertificateManager({ user }) {
  const confirm = useConfirmation();
  const [certificates, setCertificates] = useState(null);
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({ studentId: '', internshipId: '', batchId: '', completionDate: new Date().toISOString().slice(0, 10), grade: 'A' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError('');
      const [certificateResult, studentResult, internshipResult, batchResult] = await Promise.all([
        request('get', '/certificates?limit=100'),
        request('get', '/students?limit=100'),
        request('get', '/internships?limit=100'),
        request('get', '/batches?limit=100'),
      ]);
      setCertificates(certificateResult.data || []);
      setStudents(studentResult.data || []);
      setInternships(internshipResult.data || []);
      setBatches(batchResult.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStudent = (event) => {
    const studentId = event.target.value;
    const student = students.find((item) => (item.userId?._id || item.userId) === studentId);
    setForm({
      ...form,
      studentId,
      internshipId: student?.internshipId?._id || student?.internshipId || '',
      batchId: student?.batchId?._id || student?.batchId || '',
    });
  };

  const issue = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const student = students.find((item) => (item.userId?._id || item.userId) === form.studentId);
      const internship = internships.find((item) => item._id === form.internshipId);
      const batch = batches.find((item) => item._id === form.batchId);
      await request('post', '/certificates/issue', {
        ...form,
        templateData: {
          studentName: student?.userId?.name || student?.name || '',
          internshipTitle: internship?.title || '',
          batchCode: batch?.batchCode || '',
        },
      });
      setForm({ ...form, studentId: '', internshipId: '', batchId: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (certificate) => {
    if (!await confirm({ title: 'Revoke certificate?', message: `Revoke certificate ${certificate.certificateNumber}?` , confirmLabel: 'Revoke' })) return;
    try {
      await request('put', `/certificates/${certificate._id}/revoke`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !certificates) return <LoadError message={error} retry={load} />;
  return <>
    <div className="page-intro"><div><p className="eyebrow">Credentials / certificates</p><h1>Certificate management</h1><p className="muted">Issue completion certificates with live student, program, and batch details.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
    {error && <div className="alert error page-alert task-alert">{error}</div>}
    {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && <section className="panel" style={{ marginBottom: 18 }}><form className="task-form" onSubmit={issue}><div className="form-grid"><label>Student<select value={form.studentId} onChange={updateStudent} required><option value="">Select student</option>{students.map((student) => <option key={student._id} value={student.userId?._id || student.userId}>{student.userId?.name || student.name || 'Unnamed student'}{student.studentId ? ` (${student.studentId})` : ''}</option>)}</select></label><label>Internship<select value={form.internshipId} onChange={(event) => setForm({ ...form, internshipId: event.target.value })} required><option value="">Select internship</option>{internships.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.code})</option>)}</select></label><label>Batch<select value={form.batchId} onChange={(event) => setForm({ ...form, batchId: event.target.value })} required><option value="">Select batch</option>{batches.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.batchCode})</option>)}</select></label><label>Completion date<input type="date" value={form.completionDate} onChange={(event) => setForm({ ...form, completionDate: event.target.value })} required /></label><label>Grade<select value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}><option>A</option><option>A+</option><option>B</option><option>B+</option><option>C</option></select></label></div><button className="primary-button compact-button" disabled={saving}><Award size={16} /> {saving ? 'Issuing...' : 'Issue certificate'}</button></form></section>}
    <section className="panel table-panel">{!certificates ? <Loading /> : certificates.length ? <div className="table-wrap"><table><thead><tr><th>Certificate</th><th>Student</th><th>Internship</th><th>Batch</th><th>Issued</th><th>Status</th><th>Action</th></tr></thead><tbody>{certificates.map((certificate) => <tr key={certificate._id}><td><strong>{certificate.certificateNumber}</strong><small className="table-subtitle">{certificate.verificationCode}</small></td><td>{certificate.templateData?.studentName || certificate.studentId?.name || 'Unnamed student'}</td><td>{certificate.templateData?.internshipTitle || certificate.internshipId?.title || '—'}</td><td>{certificate.templateData?.batchCode || certificate.batchId?.batchCode || '—'}</td><td>{certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '—'}</td><td><span className={certificate.status === 'Revoked' ? 'pill muted-pill' : 'pill'}>{certificate.status}</span></td><td>{user.role === 'SUPER_ADMIN' && certificate.status === 'Issued' && <button className="text-button action-delete" onClick={() => revoke(certificate)}>Revoke</button>}</td></tr>)}</tbody></table></div> : <Empty text="No certificates issued yet." />}</section>
  </>;
}

function ChatManager({ user }) {
  const [mode, setMode] = useState('batch');
  const [contacts, setContacts] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [batchId, setBatchId] = useState('');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const toList = (payload) => Array.isArray(payload) ? payload : payload?.data || [];

  const load = async () => {
    try {
      setError('');
      const [conversationResult, studentResult, batchResult] = await Promise.all([
        request('get', '/messages/conversations'),
        request('get', '/students?limit=100'),
        request('get', '/batches?limit=100'),
      ]);
      setContacts(toList(conversationResult));
      setStudents(toList(studentResult));
      const loadedBatches = toList(batchResult);
      setBatches(loadedBatches);
      if (!batchId && loadedBatches[0]) setBatchId(loadedBatches[0]._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if ((mode === 'batch' && !batchId) || (mode === 'direct' && !selected)) return;
    try {
      setError('');
      const result = mode === 'batch'
        ? await request('get', `/messages/batch/${batchId}`)
        : await request('get', `/messages/direct/${selected._id}`);
      setMessages(toList(result));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadMessages(); }, [mode, batchId, selected]);

  const chooseStudent = (event) => {
    const student = students.find((item) => (item.userId?._id || item.userId) === event.target.value);
    if (student) {
      setSelected({ _id: student.userId?._id || student.userId, name: student.userId?.name || 'Unnamed student', email: student.userId?.email || '' });
      setMode('direct');
    }
  };

  const openPersonalChat = () => {
    setMode('direct');
    setMessages([]);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!content.trim() || (mode === 'batch' && !batchId) || (mode === 'direct' && !selected)) return;
    setSending(true);
    try {
      await request('post', '/messages', mode === 'batch'
        ? { batchId, messageType: 'BatchDiscussion', content: content.trim() }
        : { receiverId: selected._id, messageType: 'Direct', content: content.trim() });
      setContent('');
      await loadMessages();
      if (mode === 'direct') await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user._id;
  const activeBatch = batches.find((batch) => batch._id === batchId);
  const title = mode === 'batch' ? activeBatch?.title || 'Batch discussion' : selected?.name || 'Direct chat';
  if (loading) return <Loading />;
  return <>
    <div className="page-intro"><div><p className="eyebrow">Communication / live chat</p><h1>Chat with students</h1><p className="muted">Reply to direct messages or post updates to a batch discussion.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>
    {error && <div className="alert error page-alert task-alert">{error}</div>}
    <section className="chat-layout">
      <aside className="panel chat-sidebar"><div className="chat-mode-options"><button className={`chat-switch ${mode === 'batch' ? 'active' : ''}`} onClick={() => setMode('batch')}><Users size={16} /> Batch group</button><button className={`chat-switch ${mode === 'direct' ? 'active' : ''}`} onClick={openPersonalChat}><MessageSquare size={16} /> Personal chat</button></div><label className="chat-select-label">Choose batch<select value={batchId} onChange={(event) => { setBatchId(event.target.value); setMode('batch'); }}><option value="">Select batch</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.title}</option>)}</select></label><label className="chat-select-label">Choose student<select value={mode === 'direct' ? selected?._id || '' : ''} onChange={chooseStudent}><option value="">Select student</option>{students.map((student) => <option key={student._id} value={student.userId?._id || student.userId}>{student.userId?.name || 'Unnamed student'}</option>)}</select></label><p className="chat-label">Recent personal chats</p>{contacts.map((contact) => <button key={contact.user._id} className={`chat-contact ${mode === 'direct' && selected?._id === contact.user._id ? 'active' : ''}`} onClick={() => { setSelected(contact.user); setMode('direct'); }}><strong>{contact.user.name}</strong><small>{contact.lastMessage}</small></button>)}{!contacts.length && <p className="empty chat-empty">No personal chats yet.</p>}</aside>
      <section className="panel chat-window"><div className="chat-heading"><div><p className="eyebrow">{mode === 'batch' ? 'Batch group messages' : 'Personal messages'}</p><h3>{title}</h3></div><MessageSquare size={19} /></div><div className="chat-messages">{messages.length ? messages.map((message) => { const senderId = message.senderId?._id || message.senderId; const text = message.content || message.message || ''; return <div key={message._id} className={`chat-message ${String(senderId) === String(currentUserId) ? 'mine' : ''}`}><strong>{message.senderId?.name || 'User'}</strong><p>{text || 'Message unavailable'}</p><small>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</small></div>; }) : <Empty text={mode === 'batch' ? 'No messages in this batch yet.' : selected ? 'No messages in this conversation yet.' : 'Select a student to start a personal chat.'} />}</div><form className="chat-compose" onSubmit={sendMessage}><input value={content} onChange={(event) => setContent(event.target.value)} placeholder={mode === 'batch' ? 'Post an update to this batch...' : 'Write a personal message...'} disabled={mode === 'batch' ? !batchId : !selected} /><button className="primary-button compact-button" disabled={sending || !content.trim()}><Send size={16} /> Send</button></form></section>
    </section>
  </>;
}

function UsersDirectory({ user, onUserUpdated }) {
  const confirm = useConfirmation();
  const [rows, setRows] = useState(null); const [query, setQuery] = useState(''); const [error, setError] = useState(''); const [selected, setSelected] = useState(null); const [form, setForm] = useState({ name: '', phone: '', role: 'STUDENT', isActive: true });
  const load = async () => { try { setError(''); const result = await request('get', '/users?limit=100'); setRows(result.data || []); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const openEdit = (row) => { setSelected(row); setForm({ name: row.name || '', phone: row.phone || '', role: row.role, isActive: row.isActive !== false }); };
  const save = async (event) => { event.preventDefault(); try { const result = await request('put', `/users/${selected._id}`, form); if (String(selected._id) === String(user?._id || user?.id)) onUserUpdated(result.data); setSelected(null); await load(); } catch (err) { setError(err.message); } };
  const remove = async (row) => { if (!await confirm({ title: 'Delete account?', message: `Delete ${row.name}? This action cannot be undone.` })) return; try { await request('delete', `/users/${row._id}`); await load(); } catch (err) { setError(err.message); } };
  const filtered = (rows || []).filter((row) => `${row.name} ${row.email} ${row.role}`.toLowerCase().includes(query.toLowerCase()));
  if (error) return <LoadError message={error} retry={load} />;
  return <><div className="page-intro"><div><p className="eyebrow">Access / users</p><h1>Account directory</h1><p className="muted">Review roles and account status.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div><section className="panel table-panel"><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts" /></div></div>{!rows ? <Loading /> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th>Actions</th></tr></thead><tbody>{filtered.map((row) => <tr key={row._id}><td><strong>{row.name}</strong></td><td>{row.email}</td><td><span className="role-label">{row.role.replace('_', ' ')}</span></td><td><span className={row.isActive === false ? 'pill muted-pill' : 'pill'}>{row.isActive === false ? 'Inactive' : 'Active'}</span></td><td>{row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never'}</td><td><button className="text-button" onClick={() => openEdit(row)}><Pencil size={14} /> Update</button>{row.role !== 'SUPER_ADMIN' && <button className="text-button action-delete" onClick={() => remove(row)}><Trash2 size={14} /> Delete</button>}</td></tr>)}</tbody></table></div>}</section>{selected && <div className="modal-backdrop"><section className="task-modal"><div className="modal-heading"><div><p className="eyebrow">Account update</p><h3>Edit {selected.name}</h3></div><button className="icon-button" onClick={() => setSelected(null)}><X size={19} /></button></div><form className="task-form" onSubmit={save}><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>STUDENT</option><option>TEACHER</option><option>ADMIN</option><option>SUPER_ADMIN</option></select></label><label className="checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active account</label><button className="primary-button compact-button">Save changes</button></form></section></div>}</>;
}

function AdminOperations({ type, user }) {
  const confirm = useConfirmation();
  const [rows, setRows] = useState(null); const [batches, setBatches] = useState([]); const [students, setStudents] = useState([]); const [internships, setInternships] = useState([]); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', batchId: '', scheduledStartTime: '', scheduledEndTime: '', meetingLink: '', platform: 'GoogleMeet', category: 'StudyMaterial', fileUrl: '' });
  const [paymentForm, setPaymentForm] = useState({ studentId: '', internshipId: '', batchId: '', amount: '', paymentMethod: 'Online' });
  const load = async () => { try { setError(''); const result = await request('get', type === 'meetings' ? '/meetings?limit=100' : type === 'resources' ? '/documents?limit=100' : '/payments?limit=100'); setRows(result.data || []); if (type === 'meetings' || type === 'payments') { const batchResult = await request('get', '/batches?limit=100'); setBatches(batchResult.data || []); } if (type === 'payments') { const [studentResult, internshipResult] = await Promise.all([request('get', '/students?limit=100'), request('get', '/internships?limit=100')]); setStudents(studentResult.data || []); setInternships(internshipResult.data || []); } } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, [type]);
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const saveMeeting = async (event) => { event.preventDefault(); setSaving(true); try { await request('post', '/meetings', { title: form.title, description: form.description, batchId: form.batchId, scheduledStartTime: new Date(form.scheduledStartTime).toISOString(), scheduledEndTime: new Date(form.scheduledEndTime).toISOString(), meetingLink: form.meetingLink, platform: form.platform, meetingType: 'Mentorship' }); setForm({ ...form, title: '', description: '', scheduledStartTime: '', scheduledEndTime: '', meetingLink: '' }); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const saveResource = async (event) => { event.preventDefault(); setSaving(true); try { await request('post', '/documents', { title: form.title, category: form.category, fileUrl: form.fileUrl, isPublicToStudents: true }); setForm({ ...form, title: '', fileUrl: '' }); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const remove = async (id) => { if (!await confirm({ title: 'Delete resource?', message: 'Delete this learning resource? This action cannot be undone.' })) return; try { await request('delete', `/documents/${id}`); await load(); } catch (err) { setError(err.message); } };
  const updateStatus = async (row, status) => { try { await request('put', `/payments/${row._id}/status`, { status }); await load(); } catch (err) { setError(err.message); } };
  const savePayment = async (event) => { event.preventDefault(); setSaving(true); try { await request('post', '/payments', { ...paymentForm, amount: Number(paymentForm.amount) }); setPaymentForm({ studentId: '', internshipId: '', batchId: '', amount: '', paymentMethod: 'Online' }); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  if (error && !rows) return <LoadError message={error} retry={load} />;
  const labels = { meetings: ['Mentorship / schedule', 'Live mentorship sessions'], resources: ['Learning / resources', 'Study resources'], payments: ['Finance / invoices', 'Fee and invoice records'] };
  return <><div className="page-intro"><div><p className="eyebrow">{labels[type][0]}</p><h1>{labels[type][1]}</h1><p className="muted">Changes here appear in the student portal.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16} /> Refresh</button></div>{error && <div className="alert error page-alert task-alert">{error}</div>}{type === 'meetings' && <section className="panel" style={{ marginBottom: 18 }}><form className="task-form" onSubmit={saveMeeting}><div className="form-grid"><label>Title<input value={form.title} onChange={update('title')} required /></label><label>Batch<select value={form.batchId} onChange={update('batchId')} required><option value="">Select batch</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.title}</option>)}</select></label><label>Start<input type="datetime-local" value={form.scheduledStartTime} onChange={update('scheduledStartTime')} required /></label><label>End<input type="datetime-local" value={form.scheduledEndTime} onChange={update('scheduledEndTime')} required /></label></div><label>Meeting link<input type="url" value={form.meetingLink} onChange={update('meetingLink')} placeholder="https://meet.google.com/..." required /></label><button className="primary-button compact-button" disabled={saving}><Plus size={16} /> Schedule session</button></form></section>}{type === 'resources' && <section className="panel" style={{ marginBottom: 18 }}><form className="task-form" onSubmit={saveResource}><div className="form-grid"><label>Resource title<input value={form.title} onChange={update('title')} required /></label><label>Category<select value={form.category} onChange={update('category')}><option>StudyMaterial</option><option>Policy</option><option>Template</option><option>AssignmentBrief</option></select></label></div><label>File URL<input type="url" value={form.fileUrl} onChange={update('fileUrl')} placeholder="https://..." required /></label><button className="primary-button compact-button" disabled={saving}><Plus size={16} /> Publish resource</button></form></section>}{type === 'payments' && <section className="panel" style={{ marginBottom: 18 }}><form className="task-form" onSubmit={savePayment}><div className="form-grid"><label>Student<select value={paymentForm.studentId} onChange={(event) => setPaymentForm({ ...paymentForm, studentId: event.target.value })} required><option value="">Select student</option>{students.map((student) => <option key={student.userId?._id || student.userId} value={student.userId?._id || student.userId}>{student.userId?.name} ({student.studentId})</option>)}</select></label><label>Internship<select value={paymentForm.internshipId} onChange={(event) => setPaymentForm({ ...paymentForm, internshipId: event.target.value, amount: internships.find((item) => item._id === event.target.value)?.fee || '' })} required><option value="">Select internship</option>{internships.map((internship) => <option key={internship._id} value={internship._id}>{internship.title}</option>)}</select></label><label>Batch<select value={paymentForm.batchId} onChange={(event) => setPaymentForm({ ...paymentForm, batchId: event.target.value })}><option value="">Optional batch</option>{batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.title}</option>)}</select></label><label>Amount<input type="number" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} required /></label></div><label>Payment method<select value={paymentForm.paymentMethod} onChange={(event) => setPaymentForm({ ...paymentForm, paymentMethod: event.target.value })}><option>Online</option><option>UPI</option><option>BankTransfer</option><option>Cash</option></select></label><button className="primary-button compact-button" disabled={saving}><CreditCard size={16} /> Record payment</button></form></section>}<section className="panel table-panel">{!rows ? <Loading /> : !rows.length ? <Empty text="No records found." /> : <div className="table-wrap"><table><thead><tr>{type === 'meetings' ? <><th>Title</th><th>Batch</th><th>Schedule</th><th>Link</th></> : type === 'resources' ? <><th>Title</th><th>Category</th><th>Scope</th><th>Action</th></> : <><th>Invoice</th><th>Student</th><th>Amount</th><th>Status</th><th>Action</th></>}</tr></thead><tbody>{rows.map((row) => type === 'meetings' ? <tr key={row._id}><td><strong>{row.title}</strong></td><td>{row.batchId?.title || '—'}</td><td>{new Date(row.scheduledStartTime).toLocaleString()}</td><td><a className="text-button" href={row.meetingLink} target="_blank" rel="noreferrer">Open</a></td></tr> : type === 'resources' ? <tr key={row._id}><td><strong>{row.title}</strong></td><td>{row.category}</td><td>{row.batchId?.title || row.internshipId?.title || 'Everyone'}</td><td>{['ADMIN', 'SUPER_ADMIN'].includes(user.role) && <button className="text-button" onClick={() => remove(row._id)}>Delete</button>}</td></tr> : <tr key={row._id}><td><strong>{row.invoiceNumber}</strong></td><td>{row.studentId?.name || '—'}</td><td>{row.currency} {row.amount}</td><td><span className="pill">{row.status}</span></td><td>{['Pending', 'Failed'].includes(row.status) && <button className="text-button" onClick={() => updateStatus(row, 'Completed')}>Mark paid</button>}</td></tr>)}</tbody></table></div>}</section></>;
}

const Metric = ({ label, value, accent }) => <div className={`metric-card ${accent || ''}`}><span>{label}</span><strong>{value ?? '—'}</strong><small>Compared with current records</small></div>;
const Loading = () => <div className="loading">Loading workspace...</div>;
const Empty = ({ text }) => <div className="empty">{text}</div>;
const LoadError = ({ message, retry }) => <div className="alert error page-alert">{message}<button className="text-button" onClick={retry}>Try again</button></div>;

createRoot(document.getElementById('root')).render(<React.StrictMode><ConfirmationProvider><App /><ToastContainer position="top-right" autoClose={3500} theme="colored" newestOnTop closeOnClick pauseOnHover pauseOnFocusLoss draggable limit={4} /></ConfirmationProvider></React.StrictMode>);
