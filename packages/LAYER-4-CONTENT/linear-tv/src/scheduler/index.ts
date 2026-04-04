export interface ScheduleBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  videoId: string;
  daysOfWeek: number[];
  isActive: boolean;
}

export function getCurrentBlock(schedule: ScheduleBlock[]): ScheduleBlock | null {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${mins}`;
  const dayOfWeek = now.getDay();

  const activeBlock = schedule.find(block => {
    const isToday = block.daysOfWeek.includes(dayOfWeek);
    const isActive = block.isActive;
    const isInTimeRange = block.startTime <= currentTime && currentTime < block.endTime;
    return isToday && isActive && isInTimeRange;
  });

  return activeBlock || null;
}
