# TeamWorship — Claude Code 협업 가이드

> 교회 찬양팀 운영 관리 플랫폼 (스케줄, 출석, 악보, 채팅, 기도요청)

## 프로젝트 개요

- **앱**: Expo 54 + React Native 0.81 + TypeScript 5.9 (모바일/웹 크로스플랫폼)
- **랜딩**: `web/` 디렉토리 (정적 HTML/CSS/JS)
- **상태**: MVP/프로토타입 단계 — 백엔드 미연동, MockData 기반
- **언어**: UI 텍스트 및 커밋 메시지 모두 한국어

## 기술 스택

| 계층 | 기술 |
|------|------|
| 프레임워크 | Expo ~54 / React Native 0.81 / React 19 |
| 라우팅 | Expo Router ~6 (파일 기반) |
| 상태관리 | React Context (`ScheduleContext`) |
| 스타일링 | React Native StyleSheet + 중앙 테마 (`Colors.ts`) |
| 아이콘 | `@expo/vector-icons/FontAwesome` |
| 애니메이션 | React Native Reanimated ~4 |
| 타입 | TypeScript strict mode, 경로 별칭 `@/*` |

## 디렉토리 구조

```
TeamWorship/
├── CLAUDE.md              # ← 이 파일 (Claude 가이드)
├── AGENTS.md              # 팀 에이전트별 가이드
├── FEATURES.md            # 전체 서비스 기능 명세
├── app/                   # Expo React Native 앱
│   ├── app/               # 스크린 (Expo Router 파일 기반 라우팅)
│   │   ├── (tabs)/        # 탭 네비게이션 (schedule, chat, music, attendance, mypage)
│   │   ├── chat/[id].tsx  # 동적 라우트
│   │   ├── music-room/[id].tsx
│   │   └── *.tsx          # 독립 스크린 (member-manage, prayer, 등)
│   ├── components/        # 재사용 컴포넌트
│   │   └── ui/            # 디자인 시스템 (Avatar, Badge, Card, SectionHeader)
│   ├── constants/         # 설정, 타입, 상태, 목데이터
│   │   ├── Types.ts       # 모든 TypeScript 인터페이스/타입
│   │   ├── Colors.ts      # 브랜드 컬러 + 라이트/다크 테마
│   │   ├── ScheduleContext.tsx  # 전역 상태관리 (Context + Provider)
│   │   └── MockData.ts    # 샘플 데이터 (향후 API로 대체)
│   └── assets/            # 이미지, 폰트
└── web/                   # 랜딩 페이지 + 웹 데모
    ├── index.html
    └── demo/              # Expo 웹 빌드 export
```

## 코딩 컨벤션

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| UI 컴포넌트 | PascalCase | `Avatar.tsx`, `Card.tsx` |
| 스크린/페이지 | kebab-case | `member-manage.tsx`, `my-unavailable.tsx` |
| 훅 | camelCase + `use` 접두사 | `useColorScheme.ts` |
| 타입/상수 | PascalCase | `Types.ts`, `Colors.ts`, `MockData.ts` |
| 플랫폼별 | `.web.ts` 접미사 | `useColorScheme.web.ts` |

### 컴포넌트 작성 규칙

```tsx
// 1. 함수형 컴포넌트만 사용 (class 컴포넌트 금지)
// 2. UI 컴포넌트: named export / 스크린: default export
// 3. Props는 interface로 정의
// 4. 스타일은 파일 하단 StyleSheet.create()

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
});
```

### 임포트 순서

```tsx
// 1. React Native 코어
import { StyleSheet, View, Text, Pressable } from 'react-native';
// 2. React 훅
import { useState, useMemo, useCallback } from 'react';
// 3. Expo / 서드파티
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
// 4. 프로젝트 내부 (@/ 절대경로)
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { useSchedule } from '@/constants/ScheduleContext';
import type { MonthlyScheduleRow } from '@/constants/Types';
```

### 스타일링 규칙

- **인라인 스타일 금지** — `StyleSheet.create()` 사용
- 테마 색상은 반드시 `Colors[colorScheme]`에서 가져옴
- 브랜드 색상은 `Brand` 객체 사용 (`Brand.primary`, `Brand.accent` 등)
- 다크 모드 기본값: `useColorScheme() ?? 'dark'`
- 플랫폼별 분기: `Platform.OS === 'ios'`

### 타입 시스템

- 모든 인터페이스/타입은 `constants/Types.ts`에 중앙 관리
- 컨���스트 관련 타입은 `ScheduleContext.tsx`에 함께 정의
- Props 인터페이스는 컴포넌트 파일 내 로컬 정의
- `interface` → 객체 구조, `type` → 유니온/리터럴

### 상태관리

- 전역 상태: `ScheduleContext` (스케줄, 출석, 모임시간, 종료방, 불가일)
- 로컬 상태: `useState` (폼 입력, 모달, 탭, 필터)
- 비용 높은 계산: `useMemo` 사용
- 콜백 함수: `useCallback` 사용
- Context 접근: `useSchedule()` 훅

## 커밋 메시지 규칙

```
<type>: <description in Korean>

# type: feat, fix, refactor, chore, docs, style, test
# 예시:
feat: 스케줄 전체보기 멤버 다중 선택 지원
fix: 출석 체크인 지각 판정 로직 수정
refactor: 스케줄 자동생성 알고리즘 개선
```

## 핵심 도메인 모델

```
Member ─┐
        ├── PartPool (역할별 후보 풀)
        │     └── PartCandidate (불가일 포함)
        │
        ├── MonthlyScheduleRow (날짜별)
        │     └── ServiceAssignment (예배 부별)
        │           └── slots: { role, members[] }
        │
        ├── AttendanceEntry (출석 기록)
        ├── ChatRoom (채팅방)
        ├── SheetMusic (악보)
        ├── MusicRoom (악보 협업방)
        └── UnavailAlert (불가일 알림)
```

### 역할(PartRole) 목록

`'예배인도' | '기타' | '건반' | '일렉' | '베이스' | '드럼' | '싱어' | '음향' | 'PPT' | '온라인'`

### 권한 모델

- **인도자(Leader)**: 멤버 관리, 스케줄 자동생성, 악보 관리
- **일반 팀원**: 스케줄 조회, 출석 체크, 채팅, 기도요청, 불가일 관리
- 현재 하드코딩: `currentUser = { name: '김강래', role: '예배인도' }`
- 향후 Firebase Auth 등으로 대체 예정

## 브랜드 컬러

| 용도 | 색상 |
|------|------|
| Primary | `#6C63FF` (보라) |
| Accent/Success | `#43B89C` (틸) |
| Danger | `#FF6584` (핑크) |
| Warning | `#F5A623` (오렌지) |

## 개발 명령어

```bash
cd app
npm start          # Expo 개발 서버
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run web        # 웹 브라우저
```

## 가드레일 (절대 지켜야 할 규칙)

### DO (반드시)
- 모든 새 타입은 `constants/Types.ts`에 추가
- 색상은 `Colors.ts` / `Brand` 사용 (하드코딩 금지)
- 다크/라이트 테마 양쪽 지원
- `@/` 절��� 경로 임포트 사용
- StyleSheet.create() 사용
- 한국어 UI 텍스트, 한국어 커밋 메시지
- 새 스크린은 `app/app/` 하위에 파일 생성 (Expo Router)
- 재사용 UI는 `components/ui/` 에 배치
- Context에 새 전역 상태 추가 시 타입 + Provider + 훅까지 함께

### DON'T (금지)
- class 컴포넌트 사용
- 인라인 스타일 (동적 테마 값 제외)
- 상대 경로 임포트 (`../` 대신 `@/` 사용)
- 새로운 전역 상태관리 라이브러리 도입 (Context 유지)
- `web/demo/` 직접 수정 (Expo export로 생성되는 빌드 결과물)
- 영어 UI 텍스트 혼용
- `.env` 파일이나 시크릿을 코드에 포함
- MockData.ts에 영향 주는 타입 변경 시 MockData 동기화 누락

## 모듈 경계 (아키텍처 규칙)

```
┌─────────────────────────────┐
│ Screens (app/app/)          │ ← 비즈니스 로직 + UI 조합
│   uses ↓                    │
├─────────────────────────────┤
│ Components (components/ui/) │ ← 순수 UI, 비즈니스 로직 없음
│   uses ↓                    │
├─────────────────────────────┤
│ Context (ScheduleContext)   │ ← 전역 상태 + 액션
│   uses ↓                    │
├─────────────────────────────┤
│ Types + Colors + MockData   │ ← 데이터 정의 (변경 빈도 낮음)
└─────────────────────────────┘
```

- **UI 컴포넌트 → Context 직접 접근 가능** (Card, Badge 등은 테마용으로만)
- **스크린 → Context 필수 접근** (`useSchedule()`)
- **하위 계층 → 상위 계층 임포트 금지** (Types에서 Screen 임포트 불가)
