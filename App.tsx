

import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_HABIT_CONFIGS } from './constants';
import { getDayType, getInitialEntry } from './utils';
import type { HabitConfigurations, Entries, DayType, Entry, Habit } from './types';
import Header from './components/Header';
import Scorecard from './components/Scorecard';
import Diary from './components/Diary';
import HabitEditorModal from './components/HabitEditorModal';
import ReportingModal from './components/ReportingModal';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habitConfigs, setHabitConfigs] = useLocalStorage<HabitConfigurations>('habitConfigs', INITIAL_HABIT_CONFIGS);
  const [entries, setEntries] = useLocalStorage<Entries>('journalEntries', {});

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isReportingOpen, setIsReportingOpen] = useState(false);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const dayType = getDayType(selectedDate);
  
  const habitsForSelectedDay = useMemo(() => habitConfigs[dayType], [habitConfigs, dayType]);

  const currentEntry = useMemo(() => {
    return entries[selectedDateKey] || getInitialEntry(selectedDateKey, habitsForSelectedDay);
  }, [entries, selectedDateKey, habitsForSelectedDay]);

  const handleEntryChange = useCallback((updatedEntry: Partial<Entry>) => {
    setEntries(prevEntries => ({
      ...prevEntries,
      [selectedDateKey]: {
        ...currentEntry,
        ...updatedEntry,
      },
    }));
  }, [setEntries, selectedDateKey, currentEntry]);

  const handleHabitConfigSave = (updatedConfigs: HabitConfigurations) => {
    setHabitConfigs(updatedConfigs);
    setIsEditorOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-light-gray text-navy font-sans antialiased">
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenReporting={() => setIsReportingOpen(true)}
      />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Scorecard
            entry={currentEntry}
            habits={habitsForSelectedDay}
            onEntryChange={handleEntryChange}
            dayType={dayType}
          />
          <Diary
            entry={currentEntry}
            onEntryChange={handleEntryChange}
          />
        </div>
      </main>

      <HabitEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentConfigs={habitConfigs}
        onSave={handleHabitConfigSave}
      />
      
      <ReportingModal
        isOpen={isReportingOpen}
        onClose={() => setIsReportingOpen(false)}
        entries={entries}
        habitConfigs={habitConfigs}
      />
    </div>
  );
}