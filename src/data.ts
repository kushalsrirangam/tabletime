import { Employee, Shift, StaffRequest } from './types';

const demoTimeZone = 'America/Chicago';

function demoCalendarDay(offset: number) {
  const baseParts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: demoTimeZone,
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(baseParts.find((part) => part.type === type)?.value);
  const anchor = new Date(Date.UTC(value('year'), value('month') - 1, value('day') + offset, 12));
  const dateIso = anchor.toISOString().slice(0, 10);
  return {
    day: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: demoTimeZone }).format(anchor),
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: demoTimeZone }).format(anchor),
    dateIso,
  };
}

function clockMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) throw new Error(`Invalid demo shift time: ${value}`);
  const hour = (Number(match[1]) % 12) + (match[3] === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function demoShift(id: string, employeeId: string, dayOffset: number, start: string, end: string, role: string, published: boolean): Shift {
  const calendarDay = demoCalendarDay(dayOffset);
  const startsAt = new Date(`${calendarDay.dateIso}T00:00:00.000Z`);
  const endsAt = new Date(startsAt);
  startsAt.setUTCMinutes(clockMinutes(start));
  endsAt.setUTCMinutes(clockMinutes(end));
  if (endsAt <= startsAt) endsAt.setUTCDate(endsAt.getUTCDate() + 1);
  return { id, employeeId, day: calendarDay.day, date: calendarDay.date, start, end, role, published, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

export const employees: Employee[] = [
  { id: 'e1', name: 'Jordan Lee', initials: 'JL', role: 'General Manager', color: '#286B50', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 31.5 },
  { id: 'e2', name: 'Maya Brooks', initials: 'MB', role: 'Server', color: '#D8793D', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 27 },
  { id: 'e3', name: 'Ethan Rivera', initials: 'ER', role: 'Line Cook', color: '#497B9B', status: 'break', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 34.5 },
  { id: 'e4', name: 'Nora Patel', initials: 'NP', role: 'Bartender', color: '#9C6AA2', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 22 },
  { id: 'e5', name: 'Liam Chen', initials: 'LC', role: 'Host', color: '#A56B47', status: 'off', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 18.5 },
  { id: 'e6', name: 'Sofia Martinez', initials: 'SM', role: 'Prep Cook', color: '#617C52', status: 'off', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 29 },
];

export const shifts: Shift[] = [
  demoShift('s1', 'e1', 0, '9:00 AM', '5:00 PM', 'Manager', true),
  demoShift('s2', 'e2', 0, '11:00 AM', '7:00 PM', 'Server', true),
  demoShift('s3', 'e3', 0, '10:00 AM', '6:00 PM', 'Line Cook', true),
  demoShift('s4', 'e4', 1, '4:00 PM', '11:00 PM', 'Bartender', true),
  demoShift('s5', 'e5', 1, '3:00 PM', '9:00 PM', 'Host', true),
  demoShift('s6', 'e6', 2, '8:00 AM', '4:00 PM', 'Prep Cook', false),
  demoShift('s7', 'e2', 3, '11:00 AM', '7:00 PM', 'Server', false),
  demoShift('s8', 'e3', 3, '2:00 PM', '10:00 PM', 'Line Cook', false),
];

export const initialRequests: StaffRequest[] = [
  { id: 'r1', employeeId: 'e2', type: 'Time off', detail: 'Aug 14 · All day', createdAt: '2 hours ago', status: 'pending' },
  { id: 'r2', employeeId: 'e4', type: 'Shift swap', detail: 'Saturday, 4:00–11:00 PM', createdAt: 'Yesterday', status: 'pending' },
  { id: 'r3', employeeId: 'e3', type: 'Missed punch', detail: 'Tuesday · Clock-out at 10:14 PM', createdAt: 'Aug 5', status: 'approved' },
];
