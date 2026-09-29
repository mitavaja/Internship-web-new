import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarOff, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Leaves = () => {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      leaveType: 'Casual',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getMyLeaves();
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const onApply = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const batchId = profile?.batchId?._id || profile?.batchId;
      const res = await leaveAPI.applyLeave({ ...formData, batchId });
      if (res.success) {
        setSuccessMsg('Leave application submitted successfully!');
        reset();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg('');
          loadLeaves();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading leave applications..." size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit formal leave requests for academic exams, sickness, or personal emergencies
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leaves List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Applications History</h3>
          <span className="text-xs text-slate-400 font-medium">{leaves.length} applications</span>
        </div>

        <div className="divide-y divide-slate-100">
          {leaves.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <CalendarOff className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <span>No leave requests submitted yet.</span>
            </div>
          ) : (
            leaves.map((leave) => (
              <div key={leave._id} className="p-6 hover:bg-slate-50/50 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-sm">{leave.leaveType} Leave</span>
                    <Badge>{leave.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-normal">
                  <strong className="text-slate-700">Reason:</strong> {leave.reason}
                </p>

                {leave.reviewRemarks && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mt-2 border border-slate-100">
                    <strong className="text-slate-700">Mentor Remarks:</strong> {leave.reviewRemarks}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave">
        <div className="space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onApply)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Leave Type
              </label>
              <select
                {...register('leaveType', { required: true })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Academic">Academic / College Exam</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Leave
              </label>
              <textarea
                rows={3}
                {...register('reason', { required: 'Reason is required' })}
                placeholder="Explain the reason for taking leave..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Leaves;
