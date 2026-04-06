# TeamWorship

예배팀을 위한 토탈 솔루션

## 소개

TeamWorship은 예배팀 운영에 필요한 모든 기능을 하나의 플랫폼에서 제공합니다.
카카오톡, 엑셀, 드라이브 사이를 오가지 마세요.

## 주요 기능

- **일정 관리 & 스케줄** — 드래그 앤 드롭으로 주간/월간 스케줄 작성, 자동 리마인더
- **��석 체크** — QR코드/원터치 출석, 월별 통계 및 출석률 자동 집계
- **팀 채팅** — 요일별/파트별 채팅방, 공지사항 고정, 파일 공유
- **악보 공유** — PDF/이미지 업로드, 키 변환(트랜스포즈), 셋리스트 구성
- **합주 & 리허설 관리** — 리허설 일정, 참석 사전 확인, 연습 노트
- **리포트 & 통계** — 멤버 참여도 대시보드, 곡 사용 히스토리
- **기도 요청 & 나눔** — 기도 게시판, 익명 요청, 응답 나눔
- **���림 & 공지** — 푸시/카카오톡/이메일 알림, 읽음 확인

## 기술 스��

| 영역 | 기술 |
|------|------|
| 앱 (iOS/Android/Web) | Expo 54, React Native 0.81, TypeScript 5.9 |
| 라우팅 | Expo Router 6 (파일 기반) |
| 상태관리 | React Context (ScheduleContext) |
| 스타일링 | React Native StyleSheet + 중앙 테마 |
| 랜딩페이지 | HTML, CSS, JavaScript |

## 프로젝트 구조

```
TeamWorship/
├── app/                    # Expo 앱 (iOS/Android/Web)
│   ├── app/                # 파일 기반 라우팅 (Expo Router)
│   │   └── (tabs)/         # 탭: 스케줄, 채팅, 악보, 출석, 더보기
│   ├── components/ui/      # 디자인 시스템 (Avatar, Badge, Card, SectionHeader)
│   ├── constants/          # 타입, 테마, 상태관리, 목데이터
│   └── assets/             # 이미지, 폰트
├── web/                    # 랜딩페이지 + 웹 데모
│   └── demo/               # Expo 웹 빌드 export
├── CLAUDE.md               # Claude Code 협업 가이드 (컨벤션, 가드레일)
├── AGENTS.md               # 팀 에이전트 가이드 (템플릿, 수정 맵, 충돌 방지)
└── FEATURES.md             # 서비스 기능 상세 명세
```

## 실행 방법

```bash
# 앱 실행
cd app
npm install

npm run web        # 웹 브라우저
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터

# 랜딩페이지 로컬 확인
cd web
npx serve
```

## Claude Code 팀 협업

이 프로젝트는 Claude Code를 활용한 팀 협업을 지원합니다.
레포를 클론하면 Claude Code가 자동으로 `CLAUDE.md`를 읽어 프로젝트 컨벤션을 적용합니다.

### 제공 문서

| 문서 | 설명 |
|------|------|
| `CLAUDE.md` | 기술 스택, 코딩 컨벤션, 가드레일, 모듈 경계 |
| `AGENTS.md` | 코드 템플릿, 기능별 수정 가이드, 충돌 방지, 비즈니스 로직 참조 |
| `FEATURES.md` | 전체 서비스 기능 명세 (스크린별 상세 UI/인터랙션/데이터) |

### 시작하기

```bash
git clone <repo-url> && cd TeamWorship
cd app && npm install
claude   # Claude Code 실행 — CLAUDE.md 자동 로딩
```

### OMC 확장 (선택)

멀티 에이전트 병렬 실행이 필요한 경우 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)를 추가 설정할 수 있습니다.
자세한 안내는 `AGENTS.md` 하단을 참고하세요.

## 라이선스

Copyright (c) 2026 TeamWorship. All Rights Reserved.

이 소프트웨어의 복사, 수정, 배포, 상업적 사용은 저작권자의 서면 허가 없이 금지됩니다.
자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
