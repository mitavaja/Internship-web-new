import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { taskAPI, submissionAPI } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckSquare,
  Clock,
  ExternalLink,
  Github,
  Upload,
  Send,
  CheckCircle2,
  FileCode,
  AlertCircle,
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loadError, setLoadError] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadTasks = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await taskAPI.getMyTasks();
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      setLoadError(err.message || 'Unable to load assigned tasks.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    setSubmitSuccess('');
    setSubmitError('');
    if (task.submission) {
      setValue('githubUrl', task.submission.githubUrl || '');
      setValue('liveUrl', task.submission.liveUrl || '');
      setValue('notes', task.submission.notes || '');
    } else {
      reset();
    }
  };

  const onSubmitSolution = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError('');
      const res = await submissionAPI.submitTask({
        taskId: selectedTask._id,
        githubUrl: formData.githubUrl,
        liveUrl: formData.liveUrl,
        notes: formData.notes,
      });

      if (res.success) {
        setSubmitSuccess('Solution submitted successfully!');
        setTimeout(() => {
          setSelectedTask(null);
          loadTasks();
        }, 1200);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.submissionStatus === filter;
  });

  if (loading) {
    return <LoadingSpinner message="Loading assigned tasks..." size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tasks & Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete milestones, submit your GitHub repositories, and review mentor feedback
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
        >
          Refresh Tasks
        </button>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-white rounded-xl border border-slate-200 self-start">
          {['All', 'Pending', 'Submitted', 'Reviewed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadTasks} className="font-bold underline">Try again</button>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tasks in this category</h3>
          <p className="text-xs text-slate-400 mt-1">Check back later or select another filter view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            const isLate = new Date() > new Date(task.dueDate) && !task.submission;
            return (
              <div
                key={task._id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {task.taskCode || 'TASK'}
                      </span>
                      <Badge variant="primary">{task.taskType}</Badge>
                      <Badge variant={task.priority === 'High' ? 'danger' : 'warning'}>
                        {task.priority} Priority
                      </Badge>
                      <Badge>{task.submissionStatus}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{task.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Max Score</span>
                    <span className="text-lg font-black text-slate-800">{task.maxScore} pts</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>

                {/* Due Date & Attachments */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`flex items-center space-x-1 font-semibold ${
                        isLate ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {isLate && <span className="font-bold text-rose-600">(Past Due)</span>}
                    </span>

                    {task.attachments?.length > 0 && (
                      <span className="flex items-center space-x-1 text-slate-500 font-medium">
                        <FileCode className="w-3.5 h-3.5 text-blue-500" />
                        <span>{task.attachments.length} attachment(s)</span>
                      </span>
                    )}
                  </div>

                  {/* Submission Action */}
                  <button
                    onClick={() => openSubmitModal(task)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      task.submissionStatus === 'Reviewed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : task.submission
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {task.submissionStatus === 'Reviewed'
                        ? 'View Grade & Submission'
                        : task.submission
                        ? 'Update Submission'
                        : 'Submit Assignment'}
                    </span>
                  </button>
                </div>

                {/* Review Feedback Banner if graded */}
                {task.submission?.status === 'Reviewed' && (
                  <div className="mt-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Teacher Evaluation & Review</span>
                      </div>
                      <span className="text-sm font-black text-emerald-700">
                        Score: {task.submission.score} / {task.submission.maxScore}
                      </span>
                    </div>
                    {task.submission.feedback && (
                      <p className="text-xs text-emerald-900 mt-2 font-medium">
                        Feedback: {task.submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Submit: ${selectedTask.title}`}
        >
          <div className="space-y-4">
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitSolution)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    {...register('githubUrl')}
                    placeholder="https://github.com/your-username/repo-name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Live Hosted URL (Optional)
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    {...register('liveUrl')}
                    placeholder="https://your-demo.vercel.app"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Submission Notes & Documentation
                </label>
                <textarea
                  rows={4}
                  {...register('notes')}
                  placeholder="Provide an overview of features built, architecture decisions, and setup instructions..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Turn In Solution'}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
