# TeamWorship — 팀 에이전트 가이드

> 각 팀원의 Claude 에이전트가 코드를 생성할 때 참고하는 실전 가이드

## 공��� 규칙 (모든 에이전트 필수)

### 1. 코드 생성 전 확인 사항

- [ ] `CLAUDE.md`를 먼저 읽어 프로젝트 컨벤션 파악
- [ ] 수정할 파일을 먼저 읽고 기존 패턴 파악
- [ ] `constants/Types.ts`에서 관련 타입 확인
- [ ] `constants/Colors.ts`에서 테마 색상 확인
- [ ] 기존 UI 컴포넌트 (`components/ui/`) 재사용 가능한지 확인

### 2. 새 파일 생성 체크리스트

**새 스크린 추가:**
```
1. app/app/ 하위��� 파일 생성 (kebab-case.tsx)
2. app/app/_layout.tsx에 Stack.Screen 등록
3. 필요시 (tabs)/_layout.tsx에 탭 추���
```

**새 UI 컴포넌트 추가:**
```
1. components/ui/ 하위에 파일 생성 (PascalCase.tsx)
2. named export 사용
3. Props interface 정의
4. 다크/라이트 테마 지원
5. StyleSheet.create() 사용
```

**새 타입 추가:**
```
1. constants/Types.ts에 인터페이스/타입 추가
2. 관련 MockData.ts 샘플 데이터 추가
3. ScheduleContext에 전역 상태 필요하면 추가
```

### 3. 코드 템플릿

#### 스크린 템플릿

```tsx
import { StyleSheet, ScrollView, View, Text, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { useSchedule } from '@/constants/ScheduleContext';

export default function NewScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { scheduleData } = useSchedule();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* 콘텐츠 */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});
```

#### UI 컴포넌트 템플릿

```tsx
import { StyleSheet, View, Text, ViewProps } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface NewComponentProps extends ViewProps {
  title: string;
}

export function NewComponent({ title, style, ...props }: NewComponentProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]} {...props}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: 12 },
  title: { fontSize: 16, fontWeight: '600' },
});
```

#### Context 확장 템플릿

```tsx
// 1. ScheduleContext.tsx의 ScheduleContextType에 추가
interface ScheduleContextType {
  // ... 기존 필드
  newFeatureData: NewType[];
  addNewFeature: (item: NewType) => void;
}

// 2. Provider에 state + callback 추가
const [newFeatureData, setNewFeatureData] = useState<NewType[]>([]);
const addNewFeature = useCallback((item: NewType) => {
  setNewFeatureData(prev => [...prev, item]);
}, []);

// 3. Provider value에 추가
<ScheduleContext.Provider value={{ ...기존, newFeatureData, addNewFeature }}>

// 4. 기본값에 추가
const ScheduleContext = createContext<ScheduleContextType>({
  // ... 기존
  newFeatureData: [],
  addNewFeature: () => {},
});
```

---

## 기능별 수정 가이드

### 스케줄 관련 수정

```
수정 파일:
├── app/(tabs)/schedule.tsx       # 주간/월간 뷰, 자동생성
├── constants/Types.ts            # MonthlyScheduleRow, ServiceAssignment
├── constants/ScheduleContext.tsx  # scheduleData 상태
└── constants/MockData.ts         # monthlySchedule 샘플
```

### 출석 관련 수정

```
수정 파일:
├── app/(tabs)/attendance.tsx     # 출석 체크 UI
├── app/attendance-report.tsx     # 출석 리포트
├── constants/ScheduleContext.tsx  # attendanceMap, checkIn, cancelCheckIn
└── constants/Types.ts            # AttendanceRecord
```

### 채팅 관련 수정

```
수정 파일:
├── app/(tabs)/chat.tsx           # 채팅방 목록
├── app/chat/[id].tsx             # 채팅방 상세
├── constants/Types.ts            # ChatRoom
└── constants/MockData.ts         # chatRooms
```

### 악보 관련 수정

```
수정 파일:
├── app/(tabs)/music.tsx          # 악보 라이브러리
├── app/music-room/[id].tsx       # 악보 협업방
├── constants/Types.ts            # SheetMusic, MusicRoom
└── constants/MockData.ts         # sheetMusic, musicRooms
```

### 멤버 관리 관련 수정

```
수정 파일:
├── app/member-manage.tsx         # 멤버 추가/삭제/역할변경
├── constants/Types.ts            # Member, PartPool, PartCandidate
└── constants/MockData.ts         # partPools, members
```

---

## 충돌 방지 가이드

### 동시 작업 시 주의 파일

| 파일 | 위험도 | 이유 |
|------|--------|------|
| `constants/Types.ts` | 🔴 높음 | 모든 타입 중앙 관리 |
| `constants/ScheduleContext.tsx` | 🔴 높음 | 전역 상태 공유 |
| `constants/MockData.ts` | 🟡 중간 | 여러 기능 데이터 |
| `app/_layout.tsx` | 🟡 중간 | 라우트 등록 |
| `(tabs)/_layout.tsx` | 🟡 중간 | 탭 설정 |
| `constants/Colors.ts` | 🟢 낮음 | 변경 빈도 낮음 |

### 충돌 최소화 전략

1. **Types.ts**: 타입을 파일 끝에 추가 (기존 타입 수정 최소화)
2. **ScheduleContext.tsx**: 새 상태는 Provider 끝에 추가
3. **MockData.ts**: 새 데이터 세트는 파일 끝에 추가
4. **기능별 로직은 스크린 파일에 격리** (공유 파일 수정 최소화)

---

## 주요 비즈니스 로직 참조

### 스케줄 자동생성 알고리즘

**위치:** `app/(tabs)/schedule.tsx` → `autoGenerate()` 함수

```
1. 날짜별 → 부별 → 파트별 순회
2. 후보 필터: 불가일 제외 + 같은 부 중복 제외
3. 정렬 (우선순위):
   ① 해당 파트 서빙 횟수 적은 사람
   ② 같은 날짜 배정 적은 사람
   ③ 전체 서빙 횟수 적은 사람
4. 인원: 싱어/음향 = 2명, 나머지 = 1명
```

### 출석 판정 로직

**위치:** `constants/ScheduleContext.tsx` → `checkIn()` / `chat/[id].tsx`

```
- 출석 키: ${memberName}-${roomId}
- 시간 비교: checkedAtRaw(분) vs meetingTime(분)
- 모임시간 이전 체크인 = present, 이후 = late
```

### 불가일 알림 생성

**위치:** `app/my-unavailable.tsx` → 저장 시

```
- 이미 배정된 스케줄과 충돌 검사
- 같은 PartPool에서 대체 가능 멤버 3명까지 추천
- UnavailAlert 생성 → 해당 예배방 채팅에 표시
```

---

## 향후 개발 참조

### Phase 1: 백엔드 통합

```
현재: MockData.ts → ScheduleContext (useState) → Screens
목표: Firebase → services/*.ts → ScheduleContext → Screens (변경 최소화)

신규 디렉토리:
  app/config/firebase.ts      # Firebase 초기화
  app/services/*.ts           # CRUD 서비스 레이어
  app/hooks/use*.ts           # 데이터 커스텀 훅
```

### Phase 2: 품질

```
- ESLint + Prettier 설정
- Jest + React Native Testing Library
- 우선 테스트: autoGenerate(), ScheduleContext 상태 로직
```

---

## OMC(oh-my-claudecode) 확장 (선택)

멀티 에이전트 팀 협업이 필요한 경우 OMC를 추가로 설정할 수 있습니다.

```bash
# Claude Code 안에서:
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/oh-my-claudecode:omc-setup --local
```

OMC 사용 시 `.claude/CLAUDE.md`와 `.omc/skills/` 디렉토리가 추가됩니다.
자세한 내용은 [OMC 공식 문서](https://github.com/Yeachan-Heo/oh-my-claudecode)를 참고하세요.
