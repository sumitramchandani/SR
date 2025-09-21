
import React, { useMemo } from 'react';
import type { Entries, HabitConfigurations } from '../types';
import { getDayType } from '../utils';
import { DayType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entries;
  habitConfigs: HabitConfigurations;
}

const ReportingModal: React.FC<ReportingModalProps> = ({ isOpen, onClose, entries, habitConfigs }) => {
  const analytics = useMemo(() => {
    const allEntries = Object.values(entries);
    if (allEntries.length === 0) {
      return {
        overallAverage: 0,
        weekdayAverage: 0,
        weekendAverage: 0,
        byHabit: [],
      };
    }

    const groupedByDayType = allEntries.reduce((acc, entry) => {
      const dayType = getDayType(new Date(entry.date));
      const key = (dayType === DayType.Weekday || dayType === DayType.Friday) ? 'weekday' : 'weekend';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry.totalScore);
      return acc;
    }, { weekday: [] as number[], weekend: [] as number[] });
    
    const weekdayScores = groupedByDayType.weekday;
    const weekendScores = groupedByDayType.weekend;

    const weekdayAverage = weekdayScores.length > 0 ? weekdayScores.reduce((a, b) => a + b, 0) / weekdayScores.length : 0;
    const weekendAverage = weekendScores.length > 0 ? weekendScores.reduce((a, b) => a + b, 0) / weekendScores.length : 0;

    const overallAverage = allEntries.reduce((sum, entry) => sum + entry.totalScore, 0) / allEntries.length;

    const habitScores: { [habitId: string]: { scores: number[], count: number } } = {};
    for (const entry of allEntries) {
        const dayType = getDayType(new Date(entry.date));
        const habitsForDay = habitConfigs[dayType];
        for (const habit of habitsForDay) {
            if (!habitScores[habit.id]) {
                habitScores[habit.id] = { scores: [], count: 0 };
            }
            if (entry.scores[habit.id] !== undefined) {
                habitScores[habit.id].scores.push(entry.scores[habit.id]);
                habitScores[habit.id].count++;
            }
        }
    }
    
    const byHabit = Object.keys(habitConfigs[DayType.Weekday]).map(idx => {
        const habitInfo = habitConfigs[DayType.Weekday][parseInt(idx)];
        const data = habitScores[habitInfo.id];
        const average = data && data.count > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.count : 0;
        return {
            name: habitInfo.name,
            'Average Score': parseFloat(average.toFixed(2)),
        };
    });

    return {
      overallAverage: parseFloat(overallAverage.toFixed(2)),
      weekdayAverage: parseFloat(weekdayAverage.toFixed(2)),
      weekendAverage: parseFloat(weekendAverage.toFixed(2)),
      byHabit,
    };
  }, [entries, habitConfigs]);
  
  const comparisonData = [
    { name: 'Weekday Average', score: analytics.weekdayAverage },
    { name: 'Weekend Average', score: analytics.weekendAverage },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-navy">Analytics Dashboard</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-light-gray p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-600">Overall Average</h3>
                    <p className="text-4xl font-bold text-navy">{analytics.overallAverage}</p>
                </div>
                <div className="bg-light-gray p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-600">Weekday Average</h3>
                    <p className="text-4xl font-bold text-navy">{analytics.weekdayAverage}</p>
                </div>
                <div className="bg-light-gray p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-600">Weekend Average</h3>
                    <p className="text-4xl font-bold text-red">{analytics.weekendAverage}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-inner">
                <h3 className="text-xl font-bold text-navy mb-4">Average Score by Habit</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.byHabit} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Average Score" fill="#1D3557" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default ReportingModal;