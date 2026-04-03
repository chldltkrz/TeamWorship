# TeamWorship

예배팀을 위한 토탈 솔루션

## 소개

TeamWorship은 예배팀 운영에 필요한 모든 기능을 하나의 플랫폼에서 제공합니다.
카카오톡, 엑셀, 드라이브 사이를 오가지 마세요.

## 주요 기능

- **일정 관리 & 스케줄** — 드래그 앤 드롭으로 주간/월간 스케줄 작성, 자동 리마인더
- **출석 체크** — QR코드/원터치 출석, 월별 통계 및 출석률 자동 집계
- **팀 채팅** — 요일별/파트별 채팅방, 공지사항 고정, 파일 공유
- **악보 공유** — PDF/이미지 업로드, 키 변환(트랜스포즈), 셋리스트 구성
- **합주 & 리허설 관리** — 리허설 일정, 참석 사전 확인, 연습 노트
- **리포트 & 통계** — 멤버 참여도 대시보드, 곡 사용 히스토리
- **기도 요청 & 나눔** — 기도 게시판, 익명 요청, 응답 나눔
- **알림 & 공지** — 푸시/카카오톡/이메일 알림, 읽음 확인

## 기술 스택

| 영역 | 기술 |
|---|---|
| 앱 (iOS/Android/Web) | Expo (React Native), TypeScript |
| 라우팅 | Expo Router (파일 기반) |
| 랜딩페이지 | HTML, CSS, JavaScript |

## 프로젝트 구조

```
TeamWorship/
├── web/                  # 랜딩페이지 (마케팅)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── demo/             # 앱 웹 데모 (정적 빌드)
└── app/                  # Expo 앱 (iOS/Android/Web)
    ├── app/              # 파일 기반 라우팅
    │   └── (tabs)/       # 탭 네비게이션
    │       ├── schedule  # 스케줄
    │       ├── chat      # 채팅
    │       ├── music     # 악보
    │       ├── attendance# 출석
    │       └── mypage    # 마이페이지
    ├── components/       # 공통 컴포넌트
    └── constants/        # 테마, 타입, 목업 데이터
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

## 라이선스

Copyright (c) 2026 TeamWorship. All Rights Reserved.

이 소프트웨어의 복사, 수정, 배포, 상업적 사용은 저작권자의 서면 허가 없이 금지됩니다.
자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
