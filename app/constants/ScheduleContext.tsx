import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { monthlySchedule as defaultSchedule } from './MockData';
import type { MonthlyScheduleRow } from './Types';

export type AttendanceStatus = 'present' | 'late';

export interface AttendanceEntry {
  memberName: string;
  checkedAt: string;
  checkedAtRaw: number;
  roomId: string;
  roomName: string;
  date: string;
  status: AttendanceStatus;
}

interface ScheduleContextType {
  scheduleData: MonthlyScheduleRow[];
  setScheduleData: (data: MonthlyScheduleRow[]) => void;
  updateScheduleData: (data: MonthlyScheduleRow[]) => void;
  attendanceMap: Record<string, AttendanceEntry>;
  checkIn: (entry: Omit<AttendanceEntry, 'status'>) => void;
  cancelCheckIn: (key: string) => void;
  isCheckedIn: (memberName: string, roomId: string) => boolean;
  getAttendanceByDate: (date: string) => AttendanceEntry[];
  getAttendanceEntry: (memberName: string, roomId: string) => AttendanceEntry | undefined;
  meetingTimes: Record<string, number>;
  setMeetingTime: (roomId: string, minutes: number) => void;
  getMeetingTime: (roomId: string) => number | undefined;
}

const ScheduleContext = createContext<ScheduleContextType>({
  scheduleData: defaultSchedule,
  setScheduleData: () => {},
  updateScheduleData: () => {},
  attendanceMap: {},
  checkIn: () => {},
  cancelCheckIn: () => {},
  isCheckedIn: () => false,
  getAttendanceByDate: () => [],
  getAttendanceEntry: () => undefined,
  meetingTimes: {},
  setMeetingTime: () => {},
  getMeetingTime: () => undefined,
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleData, setScheduleData] = useState<MonthlyScheduleRow[]>(defaultSchedule);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});
  const [meetingTimes, setMeetingTimesState] = useState<Record<string, number>>({});
  const meetingTimesRef = useRef(meetingTimes);
  meetingTimesRef.current = meetingTimes;

  const updateScheduleData = useCallback((data: MonthlyScheduleRow[]) => {
    setScheduleData(data);
  }, []);

  const checkIn = useCallback((entry: Omit<AttendanceEntry, 'status'>) => {
    const key = `${entry.memberName}-${entry.roomId}`;
    const mt = meetingTimesRef.current[entry.roomId];
    const status: AttendanceStatus =
      mt != null && entry.checkedAtRaw > mt ? 'late' : 'present';
    setAttendanceMap((prev) => ({ ...prev, [key]: { ...entry, status } }));
  }, []);

  const cancelCheckIn = useCallback((key: string) => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const isCheckedIn = (memberName: string, roomId: string) => {
    return !!attendanceMap[`${memberName}-${roomId}`];
  };

  const getAttendanceEntry = (memberName: string, roomId: string) => {
    return attendanceMap[`${memberName}-${roomId}`];
  };

  const getAttendanceByDate = (date: string) => {
    return Object.values(attendanceMap).filter((e) => e.date === date);
  };

  const setMeetingTime = useCallback((roomId: string, minutes: number) => {
    setMeetingTimesState((prev) => ({ ...prev, [roomId]: minutes }));
  }, []);

  const getMeetingTime = (roomId: string) => {
    return meetingTimes[roomId];
  };

  return (
    <ScheduleContext.Provider value={{
      scheduleData, setScheduleData, updateScheduleData,
      attendanceMap, checkIn, cancelCheckIn, isCheckedIn, getAttendanceByDate, getAttendanceEntry,
      meetingTimes, setMeetingTime, getMeetingTime,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
