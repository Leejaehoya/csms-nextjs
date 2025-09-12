'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  Zap, 
  Monitor, 
  Plug, 
  Power, 
  Battery, 
  MapPin as Location, 
  LogOut,
  Menu
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useSidebar();

  const navigationItems = [
    { 
      icon: Monitor, 
      label: '통합정보화면', 
      path: '/dashboard',
      isActive: pathname === '/dashboard'
    },
    { 
      icon: Plug, 
      label: 'EVSE 가용성', 
      path: '/availability',
      isActive: pathname === '/availability'
    },
    { 
      icon: Power, 
      label: '충전소 제어', 
      path: '/control',
      isActive: pathname === '/control'
    },
    { 
      icon: Battery, 
      label: '충전소 ESS 확인', 
      path: '/ess',
      isActive: pathname === '/ess'
    },
    { 
      icon: Location, 
      label: '충전소 현황', 
      path: '/status',
      isActive: pathname === '/status'
    }
  ];

  return (
    <div 
      className={`hidden lg:flex bg-white shadow-lg border-r border-gray-200 flex-col fixed left-0 h-screen z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        top: '64px', // TopNavbar 높이만큼 아래로 이동
        height: 'calc(100vh - 64px)' // 전체 높이에서 TopNavbar 높이만큼 빼기
      }}
    >
      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4 pt-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  sidebarCollapsed ? 'justify-center' : 'gap-2'
                } ${
                  item.isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate text-xs lg:text-sm">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

        {/* 하단 축소 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={toggleSidebar}
            className={`w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm ${
              sidebarCollapsed ? 'justify-center' : 'gap-2'
            }`}
            title={sidebarCollapsed ? "사이드바 확장" : "사이드바 축소"}
          >
            <Menu className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate text-xs lg:text-sm">사이드바 축소</span>}
          </button>
        </div>
    </div>
  );
}
