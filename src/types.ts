export type UserRole = 'manager' | 'employee';
export type TabKey = 'home' | 'schedule' | 'clock' | 'team' | 'requests';
export type EmploymentStatus = 'invited' | 'active' | 'inactive';

export type WorkLocation = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  initials: string;
  role: string;
  color: string;
  status: 'clocked-in' | 'break' | 'off';
  employmentStatus: EmploymentStatus;
  primaryLocationId?: string;
  primaryLocationName?: string;
  hourlyRateCents?: number;
  userId?: string;
  weeklyHours: number;
};

export type Shift = {
  id: string;
  employeeId: string;
  day: string;
  date: string;
  start: string;
  end: string;
  role: string;
  published: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type StaffRequest = {
  id: string;
  employeeId: string;
  type: 'Time off' | 'Shift swap' | 'Missed punch';
  detail: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
};

export type ClockEntry = {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
};

export type NewShiftInput = Pick<Shift, 'employeeId' | 'day' | 'date' | 'start' | 'end' | 'role' | 'startsAt' | 'endsAt'>;
export type NewTimeOffInput = { startsOn: string; endsOn: string; reason: string };
export type SaveEmployeeInput = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  primaryLocationId?: string;
  hourlyRateCents?: number;
  employmentStatus: EmploymentStatus;
};
