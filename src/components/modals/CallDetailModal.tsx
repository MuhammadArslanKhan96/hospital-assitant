'use client';

import { X, Play, FileText, Clock, DollarSign, Activity, Phone, Calendar } from 'lucide-react';
import { useState } from 'react';
import { formatTimezoneWithStates } from '@/lib/timezone';

export default function CallDetailModal({ call, onClose, tenantTimezone = 'UTC' }: { call: any, onClose: () => void, tenantTimezone?: string }) {
  if (!call) return null;

  const safeTZ = (tz: string) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch (e) {
      return 'UTC';
    }
  };

  const tz = safeTZ(tenantTimezone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Call Details</h2>
            <p className="text-sm text-slate-500">
              {new Date(call.createdAt).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(call.createdAt).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}
              <span className="text-slate-400 ml-1">({formatTimezoneWithStates(tenantTimezone)})</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-500 mb-1">
                <Activity className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
              </div>
              <p className={`text-lg font-bold capitalize ${call.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {call.status}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-500 mb-1">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {Math.floor(call.duration / 60)}m {(call.duration % 60).toString().padStart(2, '0')}s
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-500 mb-1">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cost</span>
              </div>
              <p className="text-lg font-bold text-slate-900">${call.billedCost.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center text-slate-500 mb-1">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Caller</span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {call.customerNumber || 'Private'}
              </p>
            </div>
          </div>

          {/* End Reason */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center text-slate-500 mb-1">
              <X className="w-4 h-4 mr-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">End Reason / Disengagement</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {call.disconnectionReason ? (
                <span className="capitalize">{call.disconnectionReason.replace(/-/g, ' ')}</span>
              ) : (
                <span className="text-slate-400 italic font-normal">Not recorded</span>
              )}
              {call.transferTarget && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">Transferred to {call.transferTarget}</span>
              )}
            </p>
          </div>

          {/* Outcome Badge */}
          {call.outcome && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Action Captured
              </h3>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${call.outcome.includes('BOOKED') ? 'bg-purple-200 text-purple-800' : 'bg-orange-200 text-orange-800'}`}>
                    {call.outcome.includes('BOOKED') ? 'Appointment Booked' : 'Lead Captured'}
                  </span>
                </div>
                <div className="mt-3 text-indigo-900 font-medium">
                  {(() => {
                    try {
                      const parsed = JSON.parse(call.outcome);
                      if (parsed.data) {
                          const date = parsed.data.startTime || parsed.data.time || parsed.data.date;
                          const name = parsed.data.customerName || parsed.data.name;
                          const phone = parsed.data.phone || parsed.data.customerPhone;
                          const email = parsed.data.email;
                          const purpose = parsed.data.purpose;
                          const apptTz = parsed.data.timezone || tenantTimezone || 'UTC';
                          const safeTz = safeTZ(apptTz);
                          if (date) {
                              const dateObj = new Date(date);
                              return (
                                  <div className="space-y-2.5 pt-2 border-t border-indigo-200">
                                      {name && <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Customer Name</span><span className="font-bold">{name}</span></div>}
                                      {phone && <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Phone</span><span className="font-bold font-mono">{phone}</span></div>}
                                      {email && <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Email</span><span className="font-medium">{email}</span></div>}
                                      <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Scheduled Time</span>
                                        <span className="font-bold flex items-center">
                                          <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                                          {dateObj.toLocaleDateString('en-US', { timeZone: safeTz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                          {' at '}
                                          {dateObj.toLocaleTimeString('en-US', { timeZone: safeTz, hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Time Zone</span>
                                        <span className="font-medium">{formatTimezoneWithStates(apptTz)}</span>
                                      </div>
                                      {purpose && <div><span className="opacity-70 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Purpose</span><span className="font-medium">{purpose}</span></div>}
                                  </div>
                              );
                          }
                          return <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap mt-2">{JSON.stringify(parsed.data, null, 2)}</pre>;
                      }
                      return call.outcome;
                    } catch(e) { return <span className="opacity-80">{call.outcome}</span>; }
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Summary</h3>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-sm leading-relaxed">
              {call.summary || "No summary generated for this call."}
            </div>
          </div>

          {/* Recording Player */}
          {call.recordingUrl && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recording</h3>
              <audio controls className="w-full">
                <source src={call.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Transcript */}
          <div>
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transcript</h3>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-60 overflow-y-auto font-mono text-sm text-slate-700 whitespace-pre-wrap">
              {call.transcript || "Transcript not available."}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
