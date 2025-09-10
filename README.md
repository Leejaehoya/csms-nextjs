# CSMS - Charging Station Management System

전기차 충전소 관리 시스템 (Charging Station Management System)

## 🚀 프로젝트 개요

CSMS는 전기차 충전소의 효율적인 운영과 관리를 위한 통합 플랫폼입니다. Next.js 15와 React를 기반으로 구축되었으며, 현대적인 UI/UX를 제공합니다.

## ✨ 주요 기능

### 📊 통합정보화면 (Dashboard)
- 실시간 충전소 현황 모니터링
- 충전소 상태 및 통계 정보
- 지도 기반 충전소 위치 표시
- 알림 및 로그 관리

### ⚡ 충전소 제어 (Control)
- OCPP 프로토콜 기반 충전소 제어
- 실시간 충전소 상태 모니터링
- 기능별 설정 및 관리
- Transaction Meter Values & Clock-Aligned Meter Values 관리

### 🔧 주요 기술 스택
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Turbopack

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# 또는
yarn install
```

### 개발 서버 실행
```bash
# 개발 서버 시작 (Turbopack 사용)
npm run dev

# 또는
yarn dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 통합정보화면
│   ├── control/           # 충전소 제어
│   ├── login/             # 로그인 페이지
│   ├── globals.css        # 전역 스타일
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── Sidebar.tsx        # 사이드바 컴포넌트
│   └── TopNavbar.tsx      # 상단 네비게이션
└── contexts/              # React Context
    └── SidebarContext.tsx # 사이드바 상태 관리
```

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크/라이트 테마**: 사용자 선호도에 따른 테마 전환
- **모던한 디자인**: Glassmorphism과 그라데이션 효과
- **직관적인 네비게이션**: 사이드바와 상단 네비게이션
- **실시간 업데이트**: 동적 상태 관리

## 🔒 보안

이 프로젝트는 보안을 고려하여 다음과 같은 파일들이 제외됩니다:
- 환경 변수 파일 (`.env*`)
- 인증서 및 키 파일 (`*.key`, `*.pem`, `*.crt` 등)
- 설정 파일의 민감한 정보
- 로그 파일 및 캐시 파일

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**CSMS** - 전기차 충전소 관리의 새로운 표준