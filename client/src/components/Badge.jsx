import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const statusMap = {
    // Attendance
    Present: variants.success,
    Absent: variants.danger,
    Late: variants.warning,
    Excused: variants.primary,

    // Task & Submission
    Pending: variants.warning,
    Submitted: variants.primary,
    Reviewed: variants.success,
    Resubmitted: variants.purple,

    // Leaves
    Approved: variants.success,
    Rejected: variants.danger,

    // Status
    Active: variants.success,
    Completed: variants.purple,
    Enrolled: variants.primary,
    Applied: variants.default,
  };

  const style = statusMap[children] || variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
