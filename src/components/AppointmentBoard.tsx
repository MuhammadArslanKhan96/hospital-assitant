'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Loader2, Mail, Info, Search, Filter, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatTimezoneWithStates } from '@/lib/timezone';

export default function AppointmentBoard({ initialAppointments, tenantTimezone = 'UTC' }: { initialAppointments: any[], tenantTimezone?: string }) {
  const safeTZ = (tz: string) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch (e) {
      return 'UTC';
    }
  };

  const [appointments, setAppointments] = useState(initialAppointments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = appt.customerName?.toLowerCase().includes(q);
        const matchesPhone = appt.customerPhone?.toLowerCase().includes(q);
        const matchesEmail = appt.customerEmail?.toLowerCase().includes(q);
        const matchesPurpose = appt.purpose?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesPurpose) return false;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [appointments, searchQuery, statusFilter, dateSort]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
        const res = await fetch(`/api/appointments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
            if (selectedAppt?.id === id) setSelectedAppt({ ...selectedAppt, status: newStatus });
        }
    } catch(e) { alert("Failed to update"); }
    finally { setLoadingId(null); }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
          case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200';
          case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  // Stats
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-yellow-50 rounded-lg text-yellow-600 border border-yellow-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-green-50 rounded-lg text-green-600 border border-green-100">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmed</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{confirmedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-red-50 rounded-lg text-red-600 border border-red-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cancelled</p>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, email, or purpose..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm shadow-inner transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => handleFilterChange(setSearchQuery, '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="pl-2 pr-8 py-2.5 bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">All ({appointments.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="confirmed">Confirmed ({confirmedCount})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="cancelled">Cancelled ({cancelledCount})</option>
            </select>
          </div>

          <button
            onClick={() => setDateSort(dateSort === 'desc' ? 'asc' : 'desc')}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors group"
          >
            <Calendar className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Sort: {dateSort === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-slate-200 min-w-[800px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[14%]">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[22%]">Scheduled Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[14%]">Purpose</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[10%]">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {paginatedAppointments.map((appt) => {
              const tz = safeTZ(appt.timezone || tenantTimezone || 'UTC');

              return (
              <tr key={appt.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
                        <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="ml-2 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{appt.customerName}</div>
                        {appt.customerEmail && (
                            <div className="text-[11px] text-slate-400 truncate">{appt.customerEmail}</div>
                        )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-slate-800">
                        {appt.customerPhone || 'N/A'}
                    </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-bold text-slate-900">
                      {new Date(appt.startTime).toLocaleDateString('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' })}
                      {' '}
                      <span className="font-medium text-slate-600">{new Date(appt.startTime).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{formatTimezoneWithStates(appt.timezone || tenantTimezone || 'UTC')}</div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-600 truncate">
                  {appt.purpose || 'General Inquiry'}
                </td>
                <td className="px-4 py-3">
                   <span className={`px-2 py-0.5 inline-flex text-[11px] font-bold rounded-md border capitalize ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end items-center gap-1">
                    {loadingId === appt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                        <>
                            {appt.status === 'pending' && (
                                <button onClick={() => updateStatus(appt.id, 'confirmed')} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[11px] font-bold hover:bg-green-100 transition-colors" title="Approve">
                                    <CheckCircle className="w-3 h-3 mr-0.5" /> Approve
                                </button>
                            )}
                            {appt.status === 'confirmed' && (
                                <button onClick={() => updateStatus(appt.id, 'completed')} className="inline-flex items-center px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[11px] font-bold hover:bg-slate-100 transition-colors" title="Complete">
                                    <CheckCircle className="w-3 h-3 mr-0.5" /> Done
                                </button>
                            )}
                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                <button onClick={() => updateStatus(appt.id, 'cancelled')} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-bold hover:bg-red-100 transition-colors" title="Cancel">
                                    <XCircle className="w-3 h-3 mr-0.5" /> Cancel
                                </button>
                            )}
                            <button onClick={() => setSelectedAppt(appt)} className="inline-flex items-center px-2 py-1 bg-white text-slate-600 border border-slate-200 rounded text-[11px] font-bold hover:bg-slate-50 transition-colors" title="View Details">
                                <Eye className="w-3 h-3 mr-0.5" /> View
                            </button>
                        </>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {paginatedAppointments.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-500">
                          <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                          <p className="text-lg font-bold text-slate-600">No appointments found</p>
                          <p className="text-sm mt-1">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your filters or search query.'
                              : 'When customers book times, they will appear here.'}
                          </p>
                          {(searchQuery || statusFilter !== 'all') && (
                            <button
                              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }}
                              className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
                            >
                              Clear all filters
                            </button>
                          )}
                       </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {filteredAppointments.length > pageSize && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, filteredAppointments.length)}</span> of <span className="font-bold text-slate-700">{filteredAppointments.length}</span> results
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-bold transition-colors ${page === currentPage ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAppt && (() => {
        const tz = safeTZ(selectedAppt.timezone || tenantTimezone || 'UTC');
        return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppt(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">ID: {selectedAppt.id.slice(0, 8)}...</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Status & Quick Actions */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 text-sm font-bold rounded-lg border capitalize ${getStatusColor(selectedAppt.status)}`}>
                  {selectedAppt.status}
                </span>
                <div className="flex gap-2">
                  {selectedAppt.status === 'pending' && (
                    <button onClick={() => updateStatus(selectedAppt.id, 'confirmed')} className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </button>
                  )}
                  {selectedAppt.status === 'confirmed' && (
                    <button onClick={() => updateStatus(selectedAppt.id, 'completed')} className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
                    </button>
                  )}
                  {selectedAppt.status !== 'cancelled' && selectedAppt.status !== 'completed' && (
                    <button onClick={() => updateStatus(selectedAppt.id, 'cancelled')} className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Customer Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-slate-400"/>{selectedAppt.customerName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400"/>{selectedAppt.customerPhone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400"/>{selectedAppt.customerEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Scheduling Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400"/>
                      {new Date(selectedAppt.startTime).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</label>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400"/>
                      {new Date(selectedAppt.startTime).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(selectedAppt.endTime).toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timezone</label>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{formatTimezoneWithStates(selectedAppt.timezone || tenantTimezone || 'UTC')}</p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose / Notes</label>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1.5 whitespace-pre-wrap leading-relaxed">
                  {selectedAppt.purpose || 'No specific purpose provided.'}
                </p>
              </div>

              {/* Extra Specialized Details */}
              {selectedAppt.extraDetails && (
                  <div>
                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center mb-1.5">
                      <Info className="w-3.5 h-3.5 mr-1" /> Specialized Data
                    </label>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 space-y-2">
                        {(() => {
                            try {
                                const extra = JSON.parse(selectedAppt.extraDetails);
                                return Object.entries(extra).map(([k, v]) => (
                                    <div key={k} className="flex flex-col sm:flex-row sm:justify-between border-b border-purple-100 last:border-0 pb-2 last:pb-0">
                                        <span className="text-xs font-bold text-purple-800 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="text-sm font-medium text-purple-900 break-all">{String(v)}</span>
                                    </div>
                                ));
                            } catch (e) {
                                return <p className="text-sm text-red-500">Failed to parse extra details.</p>;
                            }
                        })()}
                    </div>
                  </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedAppt(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      );
      })()}
    </div>
  );
}
