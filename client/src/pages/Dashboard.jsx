import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI } from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckSquare,
  CalendarCheck,
  Award,
  Video,
  ExternalLink,
  Clock,
  Sparkles,
  Megaphone,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);
      const res = await attendanceAPI.checkIn();
      if (res.success) {
        setCheckInDone(true);
        loadDashboard();
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your student overview..." size="large" />;
  }

  const kpis = data?.kpis || {};
  const batch = profile?.batchId;
  const internship = profile?.internshipId;
  const meetings = data?.upcomingMeetings || [];
  const announcements = data?.recentAnnouncements || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-lg shadow-blue-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Welcome back, {user?.name.split(' ')[0]}!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            {internship?.title || 'MAINDOT Internship Program'}
          </h1>
          <p className="text-sm text-blue-100/90 mt-2">
            Batch: <span className="font-semibold">{batch?.title || 'Assigned Cohort'}</span> ({batch?.batchCode || 'N/A'})
            • ID: <span className="font-mono font-semibold">{profile?.studentId || 'MD-STU'}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={handleCheckIn}
              disabled={checkInLoading || checkInDone}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:bg-emerald-400 disabled:opacity-80"
            >
              <UserCheck className="w-4 h-4" />
              <span>{checkInDone ? 'Checked-In Today' : checkInLoading ? 'Marking...' : 'Mark Daily Check-In'}</span>
            </button>
            <Link
              to="/tasks"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20"
            >
              View My Tasks
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${kpis.attendanceRate || 100}%`}
          subtitle="Target: ≥ 80% to graduate"
          icon={CalendarCheck}
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          value={kpis.pendingTasks || 0}
          subtitle={`Out of ${kpis.totalTasks || 0} assigned tasks`}
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title="Live Sessions"
          value={meetings.length}
          subtitle="Upcoming this week"
          icon={Video}
          color="blue"
        />
        <StatCard
          title="Certification"
          value={kpis.certificateIssued ? 'Issued 🎓' : 'In Progress'}
          subtitle={kpis.certificateIssued ? 'Ready for download' : 'Complete track to unlock'}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Grid: Upcoming Sessions & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Sessions & Mentor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Mentorship Sessions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Upcoming Live Mentorship Sessions</h3>
              </div>
              <Link to="/meetings" className="text-xs font-bold text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No meetings scheduled for this week.
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((m) => (
                  <div
                    key={m._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm">{m.title}</span>
                        <Badge variant="primary">{m.meetingType}</Badge>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(m.scheduledStartTime).toLocaleString()}</span>
                        </span>
                        <span>•</span>
                        <span>Platform: {m.platform}</span>
                      </div>
                    </div>
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition space-x-1.5 shrink-0"
                    >
                      <span>Join Call</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Schedule Details */}
          {batch?.scheduleDetails && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3 text-sm">Batch Schedule & Timings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Mode</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{batch.scheduleDetails.mode}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Days</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {batch.scheduleDetails.daysOfWeek?.join(', ') || 'Mon, Wed, Fri'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Timing</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{batch.scheduleDetails.timing}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Assigned Mentor & Announcements */}
        <div className="space-y-6">
          {/* Assigned Mentor Card */}
          {batch?.teachers && batch.teachers.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm">Assigned Mentor / Instructor</h3>
              <div className="flex items-center space-x-3.5">
                <img
                  src={
                    batch.teachers[0].avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(batch.teachers[0].name)}`
                  }
                  alt={batch.teachers[0].name}
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{batch.teachers[0].name}</h4>
                  <p className="text-xs text-slate-500">{batch.teachers[0].email}</p>
                </div>
              </div>
              <Link
                to={`/messages`}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>Message Mentor</span>
              </Link>
            </div>
          )}

          {/* Announcements */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Batch Announcements</h3>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No announcements posted.</div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-xs">{a.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
