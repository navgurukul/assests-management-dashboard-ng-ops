'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@nextui-org/react';
import {
  LayoutDashboard,
  Package,
  Component,
  Share2,
  Ticket,
  Archive,
  FileText,
  User,
  Users,
} from 'lucide-react';
import { menuItems } from '@/dummyJson/dummyJson';

const iconMap = {
  LayoutDashboard,
  Package,
  Component,
  Share2,
  Ticket,
  Archive,
  FileText,
  Users,
};

function TooltipWrapper({ show, content, children }) {
  if (!show) return children;
  return (
    <Tooltip
      content={content}
      placement="right"
      delay={0}
      className="border px-2 border-gray-500 bg-white rounded-md shadow-md"
    >
      {children}
    </Tooltip>
  );
}

export default function Sidebar({ isMobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={[
        'bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 flex flex-col shrink-0',
        // Mobile: fixed drawer overlay
        'fixed inset-y-0 left-0 z-40 w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static inline, collapsible width
        'md:static md:inset-auto md:z-auto md:translate-x-0',
        isCollapsed ? 'md:w-20' : 'md:w-64',
      ].join(' ')}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <nav className="p-4 flex-1">
        <ul className="space-y-1" onClick={(e) => e.stopPropagation()}>
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.path;

            const linkContent = (
              <Link
                href={item.path}
                onClick={onMobileClose}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isCollapsed ? 'md:justify-center' : '',
                  isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {/* Always show text on mobile; hide on desktop when collapsed */}
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>
              </Link>
            );

            return (
              <li key={item.name}>
                <TooltipWrapper show={isCollapsed} content={item.name}>
                  {linkContent}
                </TooltipWrapper>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
        <TooltipWrapper show={isCollapsed} content="User Profile">
          <Link
            href="/userprofile"
            onClick={onMobileClose}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isCollapsed ? 'md:justify-center' : '',
              pathname === '/userprofile'
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>User Profile</span>
          </Link>
        </TooltipWrapper>
      </div>
    </aside>
  );
}