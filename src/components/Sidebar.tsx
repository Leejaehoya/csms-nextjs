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
  Menu,
  FileText
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useSidebar();

  const navigationItems = [
    { 
      icon: Monitor, 
      label: 'Monitoring', 
      path: '/monitoring',
      isActive: pathname === '/monitoring'
    },
    { 
      icon: Plug, 
      label: 'Availability', 
      path: '/availability',
      isActive: pathname === '/availability'
    },
    { 
      icon: Power, 
      label: 'Configuration', 
      path: '/configuration',
      isActive: pathname === '/configuration'
    },
    { 
      icon: FileText, 
      label: 'Logs', 
      path: '/logs',
      isActive: pathname === '/logs'
    },
    { 
      icon: Battery, 
      label: 'ESS', 
      path: '/ess',
      isActive: pathname === '/ess'
    },
    { 
      icon: Location, 
      label: 'Utility', 
      path: '/utility',
      isActive: pathname === '/utility'
    }
  ];

  return (
    <div 
      className={`hidden lg:flex bg-blue-50 shadow-lg border-r border-blue-100 flex-col fixed left-0 h-screen z-30 transition-all duration-300 ${
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
        <div className="p-4 border-t border-blue-100">
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
