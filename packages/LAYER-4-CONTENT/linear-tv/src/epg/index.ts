import type { ScheduleBlock } from '../scheduler';

export interface EPGEntry {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  genre: string;
  isLive: boolean;
}

export function generateEPG(schedule: ScheduleBlock[], date: Date): EPGEntry[] {
  const dayOfWeek = date.getDay();
  
  const todaySchedule = schedule
    .filter(block => block.daysOfWeek.includes(dayOfWeek) && block.isActive)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return todaySchedule.map(block => ({
    title: block.name,
    description: `Watch ${block.name} on Mood TV`,
    startTime: block.startTime,
    endTime: block.endTime,
    duration: 60,
    genre: 'Mood TV',
    isLive: true,
  }));
}
