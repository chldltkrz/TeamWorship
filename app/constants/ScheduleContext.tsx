import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { monthlySchedule as defaultSchedule } from './MockData';
import type { MonthlyScheduleRow } from './Types';

export type AttendanceStatus = 'present' | 'late';

export interface UnavailAlert {
  id: string;
  memberName: string;
  date: string;
  dayLabel: string;
  role: string;        // 해당 멤버의 배정 파트
  roomId: string;      // worship-{date}-{si}
  roomName: string;
  suggestions: string[]; // 대체 가능 멤버
  resolved: boolean;
}

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
  // 종료된 방
  closedRooms: Set<string>;
  closeRoom: (roomId: string) => void;
  isRoomClosed: (roomId: string) => boolean;
  // 불가일 알림
  unavailAlerts: UnavailAlert[];
  addUnavailAlerts: (alerts: UnavailAlert[]) => void;
  resolveAlert: (alertId: string) => void;
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
  closedRooms: new Set(),
  closeRoom: () => {},
  isRoomClosed: () => false,
  unavailAlerts: [],
  addUnavailAlerts: () => {},
  resolveAlert: () => {},
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleData, setScheduleData] = useState<MonthlyScheduleRow[]>(defaultSchedule);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});
  const [meetingTimes, setMeetingTimesState] = useState<Record<string, number>>({});
  const [closedRooms, setClosedRooms] = useState<Set<string>>(new Set());
  const [unavailAlerts, setUnavailAlerts] = useState<UnavailAlert[]>([]);
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

  const closeRoom = useCallback((roomId: string) => {
    setClosedRooms((prev) => new Set(prev).add(roomId));
  }, []);

  const isRoomClosed = (roomId: string) => {
    return closedRooms.has(roomId);
  };

  const addUnavailAlerts = useCallback((alerts: UnavailAlert[]) => {
    setUnavailAlerts((prev) => [...alerts, ...prev]);
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setUnavailAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, resolved: true } : a));
  }, []);

  return (
    <ScheduleContext.Provider value={{
      scheduleData, setScheduleData, updateScheduleData,
      attendanceMap, checkIn, cancelCheckIn, isCheckedIn, getAttendanceByDate, getAttendanceEntry,
      meetingTimes, setMeetingTime, getMeetingTime,
      closedRooms, closeRoom, isRoomClosed,
      unavailAlerts, addUnavailAlerts, resolveAlert,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
