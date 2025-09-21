
import { getDay } from 'date-fns';
import { DayType, type Habit, type Entry } from './types';

export const getDayType = (date: Date): DayType => {
  const dayOfWeek = getDay(date); // Sunday is 0, Monday is 1, ...
  if (dayOfWeek === 5) {
    return DayType.Friday;
  }
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    return DayType.Weekend;
  }
  return DayType.Weekday;
};

export const getInitialEntry = (dateKey: string, habits: Habit[]): Entry => {
  const initialScores = habits.reduce((acc, habit) => {
    acc[habit.id] = 5; // Default score
    return acc;
  }, {} as { [key: string]: number });
  
  const initialTotalScore = calculateTotalScore(initialScores, habits);

  return {
    date: dateKey,
    scores: initialScores,
    journal: {
      good: '',
      improve: '',
      notes: '',
    },
    totalScore: initialTotalScore,
  };
};


export const calculateTotalScore = (scores: { [habitId: string]: number }, habits: Habit[]): number => {
  if (!habits || habits.length === 0) return 0;

  const totalScore = habits.reduce((acc, habit) => {
    const score = scores[habit.id] || 0;
    const weightedScore = (score / 10) * habit.weight;
    return acc + weightedScore;
  }, 0);
  
  return parseFloat(totalScore.toFixed(2));
};
