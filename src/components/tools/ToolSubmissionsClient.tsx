'use client';

import { useState } from 'react';
import { Eye, Clock, Phone, Calendar, Inbox, X } from 'lucide-react';

interface ToolSubmission {
  id: string;
  customerNumber: string | null;
  data: string;
  createdAt: Date;
}

interface ToolSubmissionsClientProps {
  toolName: string;
  submissions: ToolSubmission[];
}

export default function ToolSubmissionsClient({ toolName, submissions }: ToolSubmissionsClientProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<ToolSubmission | null>(null);

  const parsedData = selectedSubmission ? JSON.parse(selectedSubmission.data) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-vc-green/10 rounded-2xl text-vc-green">
          <Inbox className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">
            {toolName.replace(/_/g, ' ')} Submissions
          </h1>
          <p className="text-slate-500 font-medium">
            Total of {submissions.length} captured events
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Caller</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Preview</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const subData = JSON.parse(sub.data);
                const preview = Object.entries(subData)
                  .slice(0, 2)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ');

                return (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-slate-900">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5 mr-2 text-slate-300" />
                        {new Date(sub.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                        {sub.customerNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 truncate max-w-md italic">
                        {preview}...
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Inbox className="w-16 h-16 mb-4" />
                      <p className="text-lg font-bold">No submissions yet</p>
                      <p className="text-sm">Captured data will appear here in real-time.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-vc-dark p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Inbox className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-2">Submission Details</h3>
                  <p className="text-slate-400 font-medium text-sm">
                    Captured on {new Date(selectedSubmission.createdAt).toLocaleString('en-US', { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                    onClick={() => setSelectedSubmission(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Caller Number</p>
                    <p className="text-sm font-bold text-slate-900">{selectedSubmission.customerNumber || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submission ID</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">{selectedSubmission.id}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Captured Parameters</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {parsedData && Object.entries(parsedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-vc-green/30 transition-colors">
                        <span className="text-sm font-bold text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-black text-slate-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
