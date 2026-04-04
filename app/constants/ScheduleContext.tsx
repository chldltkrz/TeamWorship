import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { monthlySchedule as defaultSchedule } from './MockData';
import type { MonthlyScheduleRow } from './Types';

interface ScheduleContextType {
  scheduleData: MonthlyScheduleRow[];
  setScheduleData: (data: MonthlyScheduleRow[]) => void;
  updateScheduleData: (data: MonthlyScheduleRow[]) => void;
}

const ScheduleContext = createContext<ScheduleContextType>({
  scheduleData: defaultSchedule,
  setScheduleData: () => {},
  updateScheduleData: () => {},
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [scheduleData, setScheduleData] = useState<MonthlyScheduleRow[]>(defaultSchedule);

  const updateScheduleData = useCallback((data: MonthlyScheduleRow[]) => {
    setScheduleData(data);
  }, []);

  return (
    <ScheduleContext.Provider value={{ scheduleData, setScheduleData, updateScheduleData }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
