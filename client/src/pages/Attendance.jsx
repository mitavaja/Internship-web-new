import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Attendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getMyAttendance();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const res = await attendanceAPI.checkIn();
      if (res.success) {
        setCheckInMsg(res.message);
        loadAttendance();
      }
    } catch (err) {
      setCheckInMsg(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading attendance records..." size="large" />;
  }

  const summary = data?.summary || { totalDays: 0, present: 0, absent: 0, late: 0, attendanceRate: 100 };
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Record</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your daily participation and maintain the mandatory 80% completion threshold
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/leaves"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
          >
            Apply for Leave
          </Link>
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4" />
            <span>{checkingIn ? 'Checking in...' : 'Daily Check-in'}</span>
          </button>
        </div>
      </div>

      {checkInMsg && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold">
          {checkInMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary.attendanceRate}%`}
          subtitle={summary.attendanceRate >= 80 ? 'Eligible for certificate' : 'Below 80% threshold'}
          icon={CalendarCheck}
          color={summary.attendanceRate >= 80 ? 'green' : 'amber'}
        />
        <StatCard
          title="Days Present"
          value={summary.present}
          subtitle={`Total tracked: ${summary.totalDays}`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Days Late"
          value={summary.late}
          subtitle="Late check-ins"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Days Absent"
          value={summary.absent}
          subtitle="Unexcused leaves"
          icon={XCircle}
          color="blue"
        />
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Attendance History Log</h3>
          <span className="text-xs text-slate-400 font-medium">{records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Check-in Timestamp</th>
                <th className="py-3.5 px-6">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No attendance records found yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {new Date(r.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge>{r.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">{r.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
