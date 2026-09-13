import { Habit, HabitCompletion } from "./db";
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  isSameDay, 
  parseISO, 
  isAfter, 
  isBefore, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  subWeeks,
  isSameWeek,
  format
} from "date-fns";

export type HabitStatus = "completed" | "pending" | "missed" | "inactive" | "future";

export function getHabitStatusForDate(habit: Habit, completions: HabitCompletion[], date: Date): HabitStatus {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  
  if (isAfter(checkDate, today)) {
    return "future";
  }

  // Check if habit existed on this date
  const createdAt = startOfDay(new Date(habit.createdAt));
  if (isBefore(checkDate, createdAt)) {
    return "inactive";
  }

  // Find completion for this exact date
  const dateStr = format(checkDate, 'yyyy-MM-dd');
  const completion = completions.find(c => c.date === dateStr);

  if (habit.type === "weekly") {
    // For weekly habits on a specific day, we just show if they did anything that day. 
    // The real evaluation is at the week level. But for calendar dots:
    return completion ? "completed" : "pending";
  }

  if (habit.type === "numeric" || habit.type === "duration") {
    if (completion && completion.value !== undefined && habit.target !== undefined) {
      if (Number(completion.value) >= Number(habit.target)) return "completed";
      return "pending"; // partial
    }
    if (isBefore(checkDate, today)) return "missed";
    return "pending";
  }

  if (habit.type === "avoid") {
    // Avoid is inverted: completed means you DID do the bad thing (so you broke the streak).
    // Wait, let's say "completion" means you recorded a failure. 
    // If you DID NOT record anything, you succeeded (status: completed the goal).
    if (completion) return "missed"; 
    
    // If no record, and it's a past day, you succeeded!
    if (isBefore(checkDate, today)) return "completed";
    return "pending"; // Today is pending until tomorrow, technically, or completed implicitly. Let's show as pending/success based on UI.
  }

  // Daily logic
  // Check active days (0 = Sun, 6 = Sat)
  const dayOfWeek = checkDate.getDay();
  if (habit.activeDays && habit.activeDays.length > 0 && !habit.activeDays.includes(dayOfWeek)) {
    return "inactive";
  }

  if (completion) return "completed";
  
  if (isBefore(checkDate, today)) {
    return habit.paused ? "inactive" : "missed";
  }
  
  return "pending";
}

export function calculateStreak(habit: Habit, completions: HabitCompletion[]): { current: number, longest: number } {
  const today = startOfDay(new Date());
  const createdAt = startOfDay(new Date(habit.createdAt));
  
  let current = 0;
  let longest = 0;
  let running = 0;

  if (habit.type === "weekly") {
    // Calculate weekly streaks
    const weeksToCheck = [];
    let d = startOfWeek(today, { weekStartsOn: 1 });
    while (d >= startOfWeek(createdAt, { weekStartsOn: 1 })) {
      weeksToCheck.push(d);
      d = subWeeks(d, 1);
    }
    
    for (let i = 0; i < weeksToCheck.length; i++) {
      const weekStart = weeksToCheck[i];
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekCompletions = completions.filter(c => {
        const d = parseISO(c.date);
        return d >= weekStart && d <= weekEnd;
      });

      // For weekly habits, we just count completions
      const success = weekCompletions.length >= (habit.target || 1);

      if (success) {
        running++;
        if (i === 0) current = running;
        else if (current > 0 && i === current) current = running; // continuous from today
      } else {
        if (i > 0) { // If we miss a past week, streak is broken
           longest = Math.max(longest, running);
           running = 0;
        } else {
          // It's the current week, maybe they just haven't finished it yet, so we don't break the historical streak immediately, 
          // but current streak is 0 unless they already finished it. Actually, if they haven't finished this week, 
          // their streak from LAST week carries over as current.
          running = 0;
          // We need to look at last week to see if current is alive
        }
      }
      longest = Math.max(longest, running);
    }
    
    // Fix current streak for weekly if this week isn't done but last week was
    if (weeksToCheck.length > 1) {
      let tempCurrent = 0;
      for (let i = 1; i < weeksToCheck.length; i++) {
         const weekStart = weeksToCheck[i];
         const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
         const weekCompletions = completions.filter(c => {
           const d = parseISO(c.date);
           return d >= weekStart && d <= weekEnd;
         });
         const success = weekCompletions.length >= (habit.target || 1);
         if (success) tempCurrent++;
         else break;
      }
      if (current === 0) current = tempCurrent; 
      else current = tempCurrent + 1; // they already finished this week
    }
    
    return { current, longest };
  }

  // Daily, Numeric, Duration, Avoid
  const daysToCheck = eachDayOfInterval({ start: createdAt, end: today }).reverse();

  for (let i = 0; i < daysToCheck.length; i++) {
    const date = daysToCheck[i];
    const status = getHabitStatusForDate(habit, completions, date);

    if (status === "completed") {
      running++;
      if (i === 0 || running === i + 1) current = running; // continuous from today
    } else if (status === "inactive" || status === "future") {
      // skip, doesn't break streak
      if (i === 0 || running === i) {
         // if today is inactive, current streak carries over from yesterday
         // running count stays same, but indices offset
      }
    } else if (status === "missed") {
      longest = Math.max(longest, running);
      running = 0;
    }
    longest = Math.max(longest, running);
  }

  // Adjust for today being pending
  const todayStatus = getHabitStatusForDate(habit, completions, today);
  if (todayStatus === "pending") {
    // Current streak is based on yesterday
    let tempCurrent = 0;
    let offset = 1; // skip today
    while(offset < daysToCheck.length) {
      const s = getHabitStatusForDate(habit, completions, daysToCheck[offset]);
      if (s === "completed") tempCurrent++;
      else if (s !== "inactive") break;
      offset++;
    }
    current = tempCurrent;
  }

  return { current, longest };
}

export function getTodayProgress(habits: Habit[], completions: HabitCompletion[]) {
  if (habits.length === 0) return { completed: 0, total: 0, percentage: 0 };

  const today = new Date();
  
  let total = 0;
  let completed = 0;

  habits.forEach(habit => {
    if (habit.paused) return;

    const status = getHabitStatusForDate(habit, completions, today);
    if (status !== "inactive") {
      total++;
      if (status === "completed") completed++;
    }
  });

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { completed, total, percentage };
}
