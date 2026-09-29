import React, { useState, useEffect } from 'react';
import { certificateAPI } from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Award, Download, Printer, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        const res = await certificateAPI.getMyCertificates();
        if (res.success) {
          setCertificates(res.data);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Checking issued certificates..." size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Internship Certificates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official completion credentials verified on the MAINDOT verification portal
          </p>
        </div>

        {certificates.length > 0 && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm self-start"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Certificate In Progress</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your certificate will be issued by the MAINDOT Academic Directorate upon successful completion
            of all milestones and meeting the mandatory 80% attendance requirement.
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Cryptographically verifiable upon issuance</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {certificates.map((cert) => (
            <div key={cert._id} className="space-y-4">
              {/* Certificate Canvas / Card */}
              <div className="bg-white rounded-3xl border-4 border-double border-slate-200 p-8 sm:p-12 shadow-xl relative overflow-hidden print:m-0 print:border-2">
                {/* Decorative Seal / Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-full pointer-events-none" />

                <div className="text-center max-w-2xl mx-auto space-y-4">
                  {/* Brand */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow">
                      M
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900">MAINDOT</span>
                  </div>

                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    Certificate of Internship Completion
                  </p>

                  <div className="py-2">
                    <p className="text-xs text-slate-400 italic">This is proudly presented to</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                      {cert.templateData?.studentName || 'Student Name'}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
                    for successfully completing the rigorous industry training and project capstone in{' '}
                    <strong className="text-slate-900">{cert.internshipId?.title}</strong>, demonstrating
                    exceptional proficiency and collaborative engineering skills.
                  </p>

                  <div className="flex items-center justify-center space-x-6 pt-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade</span>
                      <span className="text-lg font-black text-blue-600">{cert.grade}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued On</span>
                      <span className="font-bold text-slate-800">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Certificate No</span>
                      <span className="font-mono font-bold text-slate-800">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-100 text-xs text-slate-500">
                    <div className="text-center">
                      <div className="font-script text-base text-slate-800 font-bold mb-1">Devon Reed</div>
                      <div className="border-t border-slate-300 pt-1 text-[11px] font-semibold text-slate-600">
                        Lead Instructor
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-script text-base text-slate-800 font-bold mb-1">
                        MAINDOT Directorate
                      </div>
                      <div className="border-t border-slate-300 pt-1 text-[11px] font-semibold text-slate-600">
                        Academic Affairs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Footer Banner */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Verify authenticity online with code:{' '}
                      <strong className="text-slate-700 font-mono">{cert.verificationCode}</strong>
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5174/verify/${cert.verificationCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Public Verification Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
