'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DateRangePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [startDate, setStartDate] = useState(searchParams.get('start') || '');
    const [endDate, setEndDate] = useState(searchParams.get('end') || '');

    // Keep state in sync if URL changes
    useEffect(() => {
        setStartDate(searchParams.get('start') || '');
        setEndDate(searchParams.get('end') || '');
    }, [searchParams]);

    const updateUrl = (start: string, end: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (start) {
            params.set('start', start);
        } else {
            params.delete('start');
        }

        if (end) {
            params.set('end', end);
        } else {
            params.delete('end');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartDate(value);
        updateUrl(value, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEndDate(value);
        updateUrl(startDate, value);
    };

    const clearDates = () => {
        setStartDate('');
        setEndDate('');
        updateUrl('', '');
    };

    return (
        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <span className="pl-3 pr-2 py-2 text-slate-500 bg-slate-50 border-r border-slate-200 text-sm font-medium flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" /> Range
            </span>
            <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="pl-2 pr-2 py-2 border-none bg-transparent text-xs font-medium focus:ring-0"
            />
            <span className="px-1 text-slate-400 text-xs text-xs">to</span>
            <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="pl-2 pr-2 py-2 border-none bg-transparent text-xs font-medium focus:ring-0"
            />
            {(startDate || endDate) && (
                <button
                    onClick={clearDates}
                    className="pr-3 pl-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
