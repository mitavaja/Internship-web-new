import React, { useState, useEffect } from 'react';
import { resultAPI } from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Award, CheckCircle2, TrendingUp } from 'lucide-react';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const res = await resultAPI.getMyResults();
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your evaluations & results..." size="large" />;
  }

  // Calculate average percentage
  const avgPercentage =
    results.length > 0
      ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Evaluations & Results</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your milestone evaluations, exam scores, and performance assessments
        </p>
      </div>

      {/* Overview Metric Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Overall Performance</span>
          <h2 className="text-3xl font-black mt-1">Average Score: {avgPercentage}%</h2>
          <p className="text-xs text-blue-100 mt-1">Based on {results.length} published assessment(s)</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 self-start sm:self-center">
          <Award className="w-6 h-6 text-amber-300" />
          <span className="font-extrabold text-sm">Status: Good Standing</span>
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-xs text-slate-400">
            No evaluations published yet. Check back after milestone tests.
          </div>
        ) : (
          results.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="primary">{res.evaluationType}</Badge>
                  <h3 className="font-bold text-slate-800 text-base mt-2">{res.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Batch: {res.batchId?.batchCode || 'Cohort'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xl border border-blue-100">
                    {res.grade}
                  </div>
                </div>
              </div>

              {/* Score Breakdown Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Marks Obtained</span>
                  <span className="text-slate-800">
                    {res.marksObtained} / {res.totalMarks} ({res.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, res.percentage)}%` }}
                  />
                </div>
              </div>

              {res.remarks && (
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <strong className="text-slate-800 font-semibold block mb-0.5">Mentor Evaluation:</strong>
                  {res.remarks}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Results;
