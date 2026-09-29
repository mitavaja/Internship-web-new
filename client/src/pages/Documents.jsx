import React, { useEffect, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { documentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Documents = () => {
  const [documents, setDocuments] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { try { setLoading(true); setError(''); const result = await documentAPI.getDocuments(); setDocuments(result.data || []); } catch (err) { setError(err.message || 'Unable to load study resources.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const filtered = documents.filter((doc) => `${doc.title} ${doc.category}`.toLowerCase().includes(query.toLowerCase()));
  if (loading) return <LoadingSpinner message="Loading study resources..." size="large" />;
  return <div className="space-y-6"><header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-900">Study Resources</h1><p className="text-xs text-slate-500 mt-1">Materials shared by your internship team.</p></div><button onClick={load} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">Refresh</button></header>{error && <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">{error}</div>}<div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" /></div>{!filtered.length ? <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-xs text-slate-400">No resources available.</div> : <div className="grid md:grid-cols-2 gap-4">{filtered.map((doc) => <article key={doc._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-4"><div className="flex gap-3"><FileText className="w-5 h-5 text-blue-600 mt-0.5" /><div><h2 className="font-bold text-sm text-slate-900">{doc.title}</h2><p className="text-xs text-slate-500 mt-1">{doc.category} · {doc.fileType}</p><p className="text-[11px] text-slate-400 mt-2">{doc.batchId?.title || doc.internshipId?.title || 'General resource'}</p></div></div><a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-blue-50 text-blue-700" title="Download resource"><Download className="w-4 h-4" /></a></article>)}</div>}</div>;
};
export default Documents;
