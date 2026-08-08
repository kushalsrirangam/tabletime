import { Employee, Shift, StaffRequest } from './types';

export const employees: Employee[] = [
  { id: 'e1', name: 'Jordan Lee', initials: 'JL', role: 'General Manager', color: '#286B50', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 31.5 },
  { id: 'e2', name: 'Maya Brooks', initials: 'MB', role: 'Server', color: '#D8793D', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 27 },
  { id: 'e3', name: 'Ethan Rivera', initials: 'ER', role: 'Line Cook', color: '#497B9B', status: 'break', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 34.5 },
  { id: 'e4', name: 'Nora Patel', initials: 'NP', role: 'Bartender', color: '#9C6AA2', status: 'clocked-in', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 22 },
  { id: 'e5', name: 'Liam Chen', initials: 'LC', role: 'Host', color: '#A56B47', status: 'off', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 18.5 },
  { id: 'e6', name: 'Sofia Martinez', initials: 'SM', role: 'Prep Cook', color: '#617C52', status: 'off', employmentStatus: 'active', primaryLocationId: 'demo-main', primaryLocationName: 'The Juniper Room', weeklyHours: 29 },
];

export const shifts: Shift[] = [
  { id: 's1', employeeId: 'e1', day: 'Today', date: 'Aug 7', start: '9:00 AM', end: '5:00 PM', role: 'Manager', published: true },
  { id: 's2', employeeId: 'e2', day: 'Today', date: 'Aug 7', start: '11:00 AM', end: '7:00 PM', role: 'Server', published: true },
  { id: 's3', employeeId: 'e3', day: 'Today', date: 'Aug 7', start: '10:00 AM', end: '6:00 PM', role: 'Line Cook', published: true },
  { id: 's4', employeeId: 'e4', day: 'Tomorrow', date: 'Aug 8', start: '4:00 PM', end: '11:00 PM', role: 'Bartender', published: true },
  { id: 's5', employeeId: 'e5', day: 'Tomorrow', date: 'Aug 8', start: '3:00 PM', end: '9:00 PM', role: 'Host', published: true },
  { id: 's6', employeeId: 'e6', day: 'Sunday', date: 'Aug 9', start: '8:00 AM', end: '4:00 PM', role: 'Prep Cook', published: false },
  { id: 's7', employeeId: 'e2', day: 'Monday', date: 'Aug 10', start: '11:00 AM', end: '7:00 PM', role: 'Server', published: false },
  { id: 's8', employeeId: 'e3', day: 'Monday', date: 'Aug 10', start: '2:00 PM', end: '10:00 PM', role: 'Line Cook', published: false },
];

export const initialRequests: StaffRequest[] = [
  { id: 'r1', employeeId: 'e2', type: 'Time off', detail: 'Aug 14 · All day', createdAt: '2 hours ago', status: 'pending' },
  { id: 'r2', employeeId: 'e4', type: 'Shift swap', detail: 'Saturday, 4:00–11:00 PM', createdAt: 'Yesterday', status: 'pending' },
  { id: 'r3', employeeId: 'e3', type: 'Missed punch', detail: 'Tuesday · Clock-out at 10:14 PM', createdAt: 'Aug 5', status: 'approved' },
];
