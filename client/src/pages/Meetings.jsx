import React, { useEffect, useState } from 'react';
import { ExternalLink, Video, CalendarDays } from 'lucide-react';
import { meetingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setLoading(true); setError(''); const result = await meetingAPI.getMeetings(); setMeetings(result.data || []); }
    catch (err) { setError(err.message || 'Unable to load mentorship sessions.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading live mentorship sessions..." size="large" />;
  return <div className="space-y-6">
    <header className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-900">Live Mentorship</h1><p className="text-xs text-slate-500 mt-1">Join sessions scheduled for your batch.</p></div><button onClick={load} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">Refresh</button></header>
    {error && <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">{error}</div>}
    {!meetings.length ? <Empty text="No mentorship sessions have been scheduled for your batch." /> : <div className="grid gap-4">{meetings.map((meeting) => <article key={meeting._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><Video className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-slate-900">{meeting.title}</h2><Badge variant="primary">{meeting.meetingType}</Badge></div><p className="text-xs text-slate-500 mt-2">{meeting.description || 'Live mentor-led session'}</p><div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500"><span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{new Date(meeting.scheduledStartTime).toLocaleString()}</span><span>{meeting.platform}</span><span>{meeting.status}</span></div></div><a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Join session <ExternalLink className="w-3.5 h-3.5" /></a></article>)}</div>}
  </div>;
};
const Empty = ({ text }) => <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-xs text-slate-400">{text}</div>;
export default Meetings;
