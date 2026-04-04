import { Member, ScheduleItem, ChatRoom, SheetMusic, AttendanceRecord, MusicRoom, PartPool, MonthlyScheduleRow } from './Types';
import { Brand } from './Colors';

export const members: Member[] = [
  { id: '1', name: '김지영', role: '찬양인도', color: Brand.primary },
  { id: '2', name: '이하은', role: '보컬', color: Brand.pink },
  { id: '3', name: '박성호', role: '건반', color: Brand.accent },
  { id: '4', name: '최민수', role: '기타', color: Brand.orange },
  { id: '5', name: '정유진', role: '드럼', color: '#E84393' },
  { id: '6', name: '한세준', role: '베이스', color: '#0984E3' },
  { id: '7', name: '송예린', role: '보컬', color: '#FD79A8' },
  { id: '8', name: '윤태호', role: '음향', color: '#00B894' },
];

export const schedules: ScheduleItem[] = [
  {
    id: '1',
    title: '주일 1부 예배',
    date: '2026-04-05',
    time: '09:00',
    members: [members[0], members[2], members[3], members[4]],
    status: 'confirmed',
  },
  {
    id: '2',
    title: '주일 2부 예배',
    date: '2026-04-05',
    time: '11:00',
    members: [members[1], members[2], members[5], members[7]],
    status: 'confirmed',
  },
  {
    id: '3',
    title: '주일 3부 예배',
    date: '2026-04-05',
    time: '14:00',
    members: [members[0], members[6], members[3], members[4]],
    status: 'pending',
  },
  {
    id: '4',
    title: '수요 예배',
    date: '2026-04-08',
    time: '19:30',
    members: [members[1], members[3], members[5]],
    status: 'confirmed',
  },
  {
    id: '5',
    title: '금요 기도회',
    date: '2026-04-10',
    time: '20:00',
    members: [members[0], members[2]],
    status: 'pending',
  },
  {
    id: '6',
    title: '토요 리허설',
    date: '2026-04-11',
    time: '15:00',
    members: [members[0], members[1], members[2], members[3], members[4], members[5]],
    status: 'confirmed',
  },
];

export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '주일팀 전체',
    type: 'general',
    lastMessage: '이번 주 셋리스트 확인해주세요!',
    lastMessageTime: '오후 3:24',
    unreadCount: 5,
    memberCount: 8,
  },
  {
    id: '2',
    name: '주일 1부',
    type: 'day',
    lastMessage: '리허설 시간 변경됐어요',
    lastMessageTime: '오후 1:10',
    unreadCount: 2,
    memberCount: 4,
  },
  {
    id: '3',
    name: '주일 2부',
    type: 'day',
    lastMessage: '악보 업로드했습니다',
    lastMessageTime: '오전 11:32',
    unreadCount: 0,
    memberCount: 4,
  },
  {
    id: '4',
    name: '보컬팀',
    type: 'part',
    lastMessage: '화음 파트 나눠봤어요',
    lastMessageTime: '어제',
    unreadCount: 0,
    memberCount: 3,
  },
  {
    id: '5',
    name: '밴드팀',
    type: 'part',
    lastMessage: '드럼 리듬 패턴 공유합니다',
    lastMessageTime: '어제',
    unreadCount: 3,
    memberCount: 4,
  },
  {
    id: '6',
    name: '수요 예배팀',
    type: 'day',
    lastMessage: '이번주 곡 정했어요',
    lastMessageTime: '월요일',
    unreadCount: 0,
    memberCount: 3,
  },
];

export const sheetMusic: SheetMusic[] = [
  { id: '1', title: '주의 이름 높이며', artist: '마커스', key: 'G', bpm: 72, tags: ['찬양', '느린'], addedAt: '2026-03-28', usedCount: 12 },
  { id: '2', title: '은혜 (Grace)', artist: '나운영', key: 'D', bpm: 68, tags: ['찬양', '느린'], addedAt: '2026-03-25', usedCount: 8 },
  { id: '3', title: '살아계신 주', artist: '어노인팅', key: 'A', bpm: 130, tags: ['찬양', '빠른'], addedAt: '2026-03-20', usedCount: 15 },
  { id: '4', title: '여호와 이레', artist: '마커스', key: 'E', bpm: 78, tags: ['경배', '느린'], addedAt: '2026-03-18', usedCount: 6 },
  { id: '5', title: '주님은 좋은 분', artist: '제이어스', key: 'B', bpm: 120, tags: ['찬양', '빠른'], addedAt: '2026-03-15', usedCount: 20 },
  { id: '6', title: '날 향한 약속', artist: '어노인팅', key: 'C', bpm: 65, tags: ['경배', '느린'], addedAt: '2026-03-10', usedCount: 10 },
  { id: '7', title: '예수 우리 왕이여', artist: 'Hillsong', key: 'G', bpm: 140, tags: ['찬양', '빠른'], addedAt: '2026-03-05', usedCount: 18 },
  { id: '8', title: '하나님의 은혜', artist: '마커스', key: 'F', bpm: 70, tags: ['경배', '느린'], addedAt: '2026-03-01', usedCount: 9 },
];

// 파트별 후보자 풀
export const partPools: PartPool[] = [
  { role: '예배인도', candidates: [
    { memberId: 'p1', name: '김강래', color: '#6C63FF', unavailableDates: ['2026-04-08'] },
    { memberId: 'p2', name: '최기현', color: '#5A52D5', unavailableDates: [] },
    { memberId: 'p3', name: '심재원', color: '#A5A0FF', unavailableDates: ['2026-04-05'] },
    { memberId: 'p4', name: '임한', color: '#7B73FF', unavailableDates: ['2026-04-01'] },
    { memberId: 'p5', name: '이지웅', color: '#8B83FF', unavailableDates: [] },
  ]},
  { role: '기타', candidates: [
    { memberId: 'g1', name: '최이삭', color: '#43B89C', unavailableDates: [] },
    { memberId: 'g2', name: '임성수', color: '#2FA882', unavailableDates: ['2026-04-05'] },
    { memberId: 'g3', name: '조은', color: '#5CC8AC', unavailableDates: [] },
    { memberId: 'g4', name: '양민정', color: '#37C09A', unavailableDates: ['2026-04-01', '2026-04-08'] },
  ]},
  { role: '건반', candidates: [
    { memberId: 'k1', name: '임성수', color: '#F5A623', unavailableDates: [] },
    { memberId: 'k2', name: '정병혁', color: '#E09620', unavailableDates: ['2026-04-01', '2026-04-08'] },
    { memberId: 'k3', name: '최이삭', color: '#D4901A', unavailableDates: [] },
    { memberId: 'k4', name: '조은', color: '#C8860F', unavailableDates: [] },
  ]},
  { role: '일렉', candidates: [
    { memberId: 'e1', name: '정병혁', color: '#FF6584', unavailableDates: [] },
    { memberId: 'e2', name: '김강래', color: '#E8557A', unavailableDates: ['2026-04-08'] },
  ]},
  { role: '베이스', candidates: [
    { memberId: 'b1', name: '소유진', color: '#0984E3', unavailableDates: [] },
    { memberId: 'b2', name: '손상민', color: '#0B73C5', unavailableDates: ['2026-04-01'] },
  ]},
  { role: '드럼', candidates: [
    { memberId: 'd1', name: '이승완', color: '#E84393', unavailableDates: [] },
    { memberId: 'd2', name: '최이삭', color: '#D63584', unavailableDates: [] },
    { memberId: 'd3', name: '소유빈', color: '#F060A8', unavailableDates: ['2026-04-01'] },
    { memberId: 'd4', name: '김종윤', color: '#C82878', unavailableDates: [] },
  ]},
  { role: '싱어', candidates: [
    { memberId: 's1', name: '장은지', color: '#FD79A8', unavailableDates: [] },
    { memberId: 's2', name: '양진아', color: '#E86FA0', unavailableDates: ['2026-04-05'] },
    { memberId: 's3', name: '최주영', color: '#F56B9F', unavailableDates: [] },
    { memberId: 's4', name: '공미성', color: '#FF85B3', unavailableDates: [] },
    { memberId: 's5', name: '이일권', color: '#D45D8A', unavailableDates: ['2026-04-08'] },
    { memberId: 's6', name: '김지연', color: '#E76B9B', unavailableDates: [] },
    { memberId: 's7', name: '양나영', color: '#F07DAD', unavailableDates: [] },
    { memberId: 's8', name: '나혜정', color: '#C94F7A', unavailableDates: [] },
    { memberId: 's9', name: '배우리', color: '#E26393', unavailableDates: [] },
    { memberId: 's10', name: '조수인', color: '#D5578A', unavailableDates: [] },
    { memberId: 's11', name: '이장관', color: '#CD4D80', unavailableDates: [] },
    { memberId: 's12', name: '임현', color: '#DA5F90', unavailableDates: ['2026-04-01'] },
  ]},
  { role: '음향', candidates: [
    { memberId: 'a1', name: '채수길', color: '#00B894', unavailableDates: [] },
    { memberId: 'a2', name: '박명훈', color: '#00A381', unavailableDates: [] },
    { memberId: 'a3', name: '김영찬', color: '#00CC99', unavailableDates: ['2026-04-01'] },
    { memberId: 'a4', name: '이현진', color: '#009E76', unavailableDates: [] },
    { memberId: 'a5', name: '임보을', color: '#00B389', unavailableDates: [] },
    { memberId: 'a6', name: '고지훈', color: '#00C28E', unavailableDates: [] },
    { memberId: 'a7', name: '장형진', color: '#008F6B', unavailableDates: [] },
    { memberId: 'a8', name: '양필영', color: '#00A87F', unavailableDates: [] },
    { memberId: 'a9', name: '조은(지후)', color: '#00BD8A', unavailableDates: ['2026-04-08'] },
    { memberId: 'a10', name: '박지후', color: '#009A73', unavailableDates: [] },
    { memberId: 'a11', name: '김예경', color: '#00AE83', unavailableDates: [] },
    { memberId: 'a12', name: '차도성', color: '#00C594', unavailableDates: [] },
    { memberId: 'a13', name: '정예경', color: '#008768', unavailableDates: [] },
  ]},
  { role: '온라인', candidates: [
    { memberId: 'o1', name: '이동현', color: '#636E72', unavailableDates: [] },
    { memberId: 'o2', name: '조성화', color: '#747D81', unavailableDates: ['2026-04-05'] },
    { memberId: 'o3', name: '추창성', color: '#545D61', unavailableDates: [] },
    { memberId: 'o4', name: '김은미', color: '#6B7478', unavailableDates: ['2026-04-01'] },
    { memberId: 'o5', name: '동현(민정)', color: '#5C6569', unavailableDates: [] },
  ]},
];

// 2026년 4월 월간 스케줄 (사진 기반)
export const monthlySchedule: MonthlyScheduleRow[] = [
  {
    date: '2026-04-01', dayLabel: '1일 (수)', services: [{
      slots: [
        { role: '예배인도', members: ['김강래'] },
        { role: '건반', members: ['임성수'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['장은지', '양진아'] },
        { role: '음향', members: ['채수길', '박명훈'] },
        { role: '온라인', members: ['이동현'] },
      ],
    }],
  },
  {
    date: '2026-04-03', dayLabel: '3일 (금)', note: '성 금요일',
    services: [{
      slots: [
        { role: '예배인도', members: ['심재원'] },
        { role: '건반', members: ['최이삭'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['이승완'] },
        { role: '싱어', members: ['최주영', '공미성'] },
        { role: '음향', members: ['고지훈', '조은'] },
        { role: '온라인', members: ['조성화'] },
      ],
    }],
  },
  {
    date: '2026-04-05', dayLabel: '5일 (일)', note: '부활절',
    services: [
      { serviceLabel: '1부', slots: [
        { role: '예배인도', members: ['김강래'] },
        { role: '건반', members: ['최이삭'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['이승완'] },
        { role: '싱어', members: ['이일권', '김지연'] },
        { role: '음향', members: ['김영찬', '이현진'] },
        { role: '온라인', members: ['이동현'] },
      ]},
      { serviceLabel: '2부', slots: [
        { role: '예배인도', members: ['임한'] },
        { role: '건반', members: ['조은'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['손상민'] },
        { role: '드럼', members: ['소유빈'] },
        { role: '싱어', members: ['공미성', '임현'] },
        { role: '음향', members: ['고지훈(은미)', '박명훈'] },
        { role: '온라인', members: ['추창성(지은,민정)'] },
      ]},
    ],
  },
  {
    date: '2026-04-08', dayLabel: '8일 (수)', services: [{
      slots: [
        { role: '예배인도', members: ['최기현'] },
        { role: '건반', members: ['임성수'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['김지연', '양진아'] },
        { role: '음향', members: ['김영찬', '임보을'] },
        { role: '온라인', members: ['이동현'] },
      ],
    }],
  },
  {
    date: '2026-04-10', dayLabel: '10일 (금)', note: '거룩한 성회',
    services: [
      { serviceLabel: '1부', slots: [
        { role: '예배인도', members: ['임한'] },
        { role: '건반', members: ['최이삭'] },
        { role: '일렉', members: ['김강래'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['이승완'] },
        { role: '싱어', members: ['조수인', '양나영'] },
        { role: '음향', members: ['장형진(은미)', '박명훈'] },
        { role: '온라인', members: ['추창성'] },
      ]},
      { serviceLabel: '2부', slots: [
        { role: '건반', members: ['조은'] },
        { role: '온라인', members: ['추창성'] },
      ]},
    ],
  },
  {
    date: '2026-04-12', dayLabel: '12일 (일)',
    services: [
      { serviceLabel: '1부', slots: [
        { role: '예배인도', members: ['최기현'] },
        { role: '건반', members: ['임성수'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['배우리', '양진아'] },
        { role: '음향', members: ['채수길', '양필영'] },
        { role: '온라인', members: ['추창성'] },
      ]},
      { serviceLabel: '2부', slots: [
        { role: '예배인도', members: ['이지웅'] },
        { role: '건반', members: ['최이삭'] },
        { role: '일렉', members: ['김강래'] },
        { role: '베이스', members: ['손상민'] },
        { role: '드럼', members: ['김종윤'] },
        { role: '싱어', members: ['장은지', '양나영'] },
        { role: '음향', members: ['장형진', '조은(지후)'] },
        { role: '온라인', members: ['동현(민정)'] },
      ]},
    ],
  },
  {
    date: '2026-04-15', dayLabel: '15일 (수)', services: [{
      slots: [
        { role: '예배인도', members: ['심재원'] },
        { role: '건반', members: ['임성수'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['장은지', '이일권'] },
        { role: '음향', members: ['채수길', '박지후'] },
        { role: '온라인', members: ['추창성'] },
      ],
    }],
  },
  {
    date: '2026-04-19', dayLabel: '19일 (일)',
    services: [
      { serviceLabel: '1부', slots: [
        { role: '예배인도', members: ['김강래'] },
        { role: '건반', members: ['임성수'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['이승완'] },
        { role: '싱어', members: ['나혜정', '김지연'] },
        { role: '음향', members: ['김영찬', '차도성'] },
        { role: '온라인', members: ['이동현'] },
      ]},
      { serviceLabel: '2부', slots: [
        { role: '예배인도', members: ['심재원'] },
        { role: '건반', members: ['조은'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['손상민'] },
        { role: '드럼', members: ['소유빈'] },
        { role: '싱어', members: ['최주영', '조수인'] },
        { role: '음향', members: ['김은미', '박지후'] },
        { role: '온라인', members: ['창성(민정)'] },
      ]},
    ],
  },
  {
    date: '2026-04-22', dayLabel: '22일 (수)', services: [{
      slots: [
        { role: '예배인도', members: ['최기현'] },
        { role: '건반', members: ['임성수'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['김지연', '나혜정'] },
        { role: '음향', members: ['김영찬', '임보을'] },
        { role: '온라인', members: ['이동현'] },
      ],
    }],
  },
  {
    date: '2026-04-26', dayLabel: '26일 (일)',
    services: [
      { serviceLabel: '1부', slots: [
        { role: '예배인도', members: ['최기현'] },
        { role: '건반', members: ['임성수'] },
        { role: '일렉', members: ['김강래'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['이장관', '나혜정'] },
        { role: '음향', members: ['채수길', '양필영'] },
        { role: '온라인', members: ['추창성'] },
      ]},
      { serviceLabel: '2부', slots: [
        { role: '예배인도', members: ['임한'] },
        { role: '건반', members: ['최이삭'] },
        { role: '일렉', members: ['정병혁'] },
        { role: '베이스', members: ['손상민'] },
        { role: '드럼', members: ['소유빈'] },
        { role: '싱어', members: ['정예경', '양나영'] },
        { role: '음향', members: ['고지훈', '임보을'] },
        { role: '온라인', members: ['동현(지은)'] },
      ]},
    ],
  },
  {
    date: '2026-04-29', dayLabel: '29일 (수)', services: [{
      slots: [
        { role: '예배인도', members: ['심재원'] },
        { role: '건반', members: ['임성수'] },
        { role: '베이스', members: ['소유진'] },
        { role: '드럼', members: ['최이삭'] },
        { role: '싱어', members: ['배우리', '이장관'] },
        { role: '음향', members: ['장형진', '박명훈'] },
        { role: '온라인', members: ['이동현'] },
      ],
    }],
  },
];

// 실시간 악보방 — 실제 스케줄 기반
// room id = "room-svc-{date}-{serviceIdx}" 형태로 스케줄과 매칭
export const musicRooms: MusicRoom[] = [
  {
    // 4/5(일) 1부 — 부활절 예배
    id: 'room-svc-2026-04-05-0',
    name: '5일(일) 1부 예배',
    songTitle: '주의 이름 높이며, 살아계신 주, 예수 우리 왕이여',
    songArtist: '마커스 · 어노인팅 · Hillsong',
    key: 'G',
    activeUsers: [
      { name: '김강래', color: Brand.primary },
      { name: '최이삭', color: Brand.accent },
      { name: '이승완', color: '#E84393' },
    ],
    pageCount: 3,
    currentPage: 1,
    hasAnnotations: true,
    songForm: ['주의 이름 높이며', '살아계신 주', '예수 우리 왕이여'],
    isLive: true,
    createdBy: '김강래',
    lastActivity: '방금 전',
  },
  {
    // 4/1(수) 수요 예배
    id: 'room-svc-2026-04-01-0',
    name: '1일(수) 예배',
    songTitle: '여호와 이레, 하나님의 은혜',
    songArtist: '마커스',
    key: 'E',
    activeUsers: [],
    pageCount: 2,
    currentPage: 1,
    hasAnnotations: true,
    songForm: ['여호와 이레', '하나님의 은혜'],
    isLive: false,
    createdBy: '김강래',
    lastActivity: '4월 1일',
  },
  {
    // 4/8(수) 수요 예배
    id: 'room-svc-2026-04-08-0',
    name: '8일(수) 예배',
    songTitle: '은혜 (Grace), 날 향한 약속',
    songArtist: '나운영 · 어노인팅',
    key: 'D',
    activeUsers: [],
    pageCount: 2,
    currentPage: 1,
    hasAnnotations: false,
    songForm: ['은혜 (Grace)', '날 향한 약속'],
    isLive: false,
    createdBy: '최기현',
    lastActivity: '4월 7일',
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: '1', memberId: '1', memberName: '김지영', memberRole: '찬양인도', memberColor: Brand.primary, date: '2026-03-29', status: 'present' },
  { id: '2', memberId: '2', memberName: '이하은', memberRole: '보컬', memberColor: Brand.pink, date: '2026-03-29', status: 'present' },
  { id: '3', memberId: '3', memberName: '박성호', memberRole: '건반', memberColor: Brand.accent, date: '2026-03-29', status: 'late' },
  { id: '4', memberId: '4', memberName: '최민수', memberRole: '기타', memberColor: Brand.orange, date: '2026-03-29', status: 'present' },
  { id: '5', memberId: '5', memberName: '정유진', memberRole: '드럼', memberColor: '#E84393', date: '2026-03-29', status: 'absent' },
  { id: '6', memberId: '6', memberName: '한세준', memberRole: '베이스', memberColor: '#0984E3', date: '2026-03-29', status: 'present' },
  { id: '7', memberId: '7', memberName: '송예린', memberRole: '보컬', memberColor: '#FD79A8', date: '2026-03-29', status: 'excused' },
  { id: '8', memberId: '8', memberName: '윤태호', memberRole: '음향', memberColor: '#00B894', date: '2026-03-29', status: 'present' },
];
