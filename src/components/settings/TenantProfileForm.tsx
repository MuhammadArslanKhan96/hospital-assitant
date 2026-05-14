'use client';

import { useState } from 'react';
import { User, Bell, Shield, Key, Globe, Loader2, CheckCircle } from 'lucide-react';

export default function TenantProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [timezone, setTimezone] = useState(user.tenant?.timezone || 'UTC');

  const timezones = [
    { label: '(GMT-11:00) Midway Island, Samoa', value: 'Pacific/Midway' },
    { label: '(GMT-10:00) Hawaii', value: 'Pacific/Honolulu' },
    { label: '(GMT-09:00) Alaska Time - AK', value: 'America/Anchorage' },
    { label: '(GMT-08:00) Pacific Time (CA, WA, NV, etc.)', value: 'America/Los_Angeles' },
    { label: '(GMT-07:00) Mountain Time no DST (AZ)', value: 'America/Phoenix' },
    { label: '(GMT-07:00) Mountain Time (CO, UT, MT, etc.)', value: 'America/Denver' },
    { label: '(GMT-06:00) Central Time (IL, TX, MN, etc.)', value: 'America/Chicago' },
    { label: '(GMT-05:00) Eastern Time (NY, PA, FL, etc.)', value: 'America/New_York' },
    { label: '(GMT-04:00) Atlantic Time (Canada)', value: 'America/Halifax' },
    { label: '(GMT-03:30) Newfoundland', value: 'America/St_Johns' },
    { label: '(GMT-03:00) Brazil, Buenos Aires, Georgetown', value: 'America/Sao_Paulo' },
    { label: '(GMT-02:00) Mid-Atlantic', value: 'Atlantic/South_Georgia' },
    { label: '(GMT-01:00) Azores, Cape Verde Islands', value: 'Atlantic/Azores' },
    { label: '(GMT+00:00) Western Europe Time, London, Lisbon, Casablanca', value: 'UTC' },
    { label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', value: 'Europe/Paris' },
    { label: '(GMT+02:00) Kaliningrad, South Africa', value: 'Africa/Johannesburg' },
    { label: '(GMT+03:00) Baghdad, Riyadh, Moscow, St. Petersburg', value: 'Europe/Moscow' },
    { label: '(GMT+03:30) Tehran', value: 'Asia/Tehran' },
    { label: '(GMT+04:00) Abu Dhabi, Muscat, Baku, Tbilisi', value: 'Asia/Dubai' },
    { label: '(GMT+04:30) Kabul', value: 'Asia/Kabul' },
    { label: '(GMT+05:00) Ekaterinburg, Islamabad, Karachi, Tashkent', value: 'Asia/Karachi' },
    { label: '(GMT+05:30) Bombay, Calcutta, Madras, New Delhi', value: 'Asia/Kolkata' },
    { label: '(GMT+05:45) Kathmandu', value: 'Asia/Kathmandu' },
    { label: '(GMT+06:00) Almaty, Dhaka, Colombo', value: 'Asia/Dhaka' },
    { label: '(GMT+07:00) Bangkok, Hanoi, Jakarta', value: 'Asia/Bangkok' },
    { label: '(GMT+08:00) Beijing, Perth, Singapore, Hong Kong', value: 'Asia/Singapore' },
    { label: '(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk', value: 'Asia/Tokyo' },
    { label: '(GMT+09:30) Adelaide, Darwin', value: 'Australia/Adelaide' },
    { label: '(GMT+10:00) Eastern Australia, Guam, Vladivostok', value: 'Australia/Sydney' },
    { label: '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', value: 'Pacific/Noumea' },
    { label: '(GMT+12:00) Auckland, Wellington, Fiji, Kamchatka', value: 'Pacific/Auckland' },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
        const res = await fetch('/api/tenants/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timezone })
        });
        if (res.ok) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    } catch (e) {
        alert("Failed to save settings");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input type="text" disabled value={user.tenant?.name || ''} className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" disabled value={user.email} className="mt-1 w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-500" />
            </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <Globe className="w-5 h-5 text-vc-green mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
            </div>
            <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saveSuccess ? <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> : null}
                {saveSuccess ? 'Saved!' : 'Save Changes'}
            </button>
        </div>
        <div className="max-w-md">
            <label className="block text-sm font-bold text-slate-700 mb-1">Default Timezone</label>
            <p className="text-xs text-slate-500 mb-3">This timezone will be used as a fallback if the AI agent cannot determine the caller's location, and for all dashboard displays.</p>
            <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
            >
                {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Notifications (Mock) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
            <Bell className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Missed Call Alerts</p>
                    <p className="text-xs text-gray-500">Receive an email when a call is missed.</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Weekly Report</p>
                    <p className="text-xs text-gray-500">Receive a summary of call volume and spend.</p>
                </div>
                <input type="checkbox" className="toggle" />
            </div>
        </div>
      </div>

      {/* Developer Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
            <Key className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Developer Access</h3>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
            <div className="mt-1 flex gap-2">
                <code className="flex-1 bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">{user.tenant?.id}</code>
                <button className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">Copy</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Use this ID for API integrations.</p>
        </div>
      </div>
    </div>
  );
}
