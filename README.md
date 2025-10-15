# CSMS - Charging Station Management System

전기차 충전소 관리 시스템 (Charging Station Management System)

## 프로젝트 개요

CSMS는 전기차 충전소의 효율적인 운영과 관리를 위한 통합 플랫폼입니다. Next.js 15와 React를 기반으로 구축되었으며, 현대적인 UI/UX를 제공합니다.

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn


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
