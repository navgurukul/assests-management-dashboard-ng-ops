'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUserRole } from '@/app/store/slices/appSlice';
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
  Building2,
  TicketCheck,
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
  User,
  Building2,
  TicketCheck,
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

  // Selector for userRole from Redux store
  const userRole = useSelector(selectUserRole);
  const isStudentOrEmployee = userRole === 'Student' || userRole === 'Employee';

  const filteredMenuItems = menuItems.filter(
    (item) => (isStudentOrEmployee ? item.studentOnly : !item.studentOnly)
  );

  return (
    <aside
      className={[
        'bg-[var(--sidebar-bg)] border-r border-gray-200 overflow-y-auto transition-all duration-300 flex flex-col shrink-0',
        // Mobile: fixed drawer overlay
        'fixed inset-y-0 left-0 z-40 w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static inline, collapsible width
        'md:static md:inset-auto md:z-auto md:translate-x-0',
        isCollapsed ? 'md:w-24' : 'md:w-64',
      ].join(' ')}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <nav className="p-4 flex-1">
        <ul className="space-y-1" onClick={(e) => e.stopPropagation()}>
          {filteredMenuItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.path;

            const linkContent = (
              <Link
                href={item.path}
                onClick={onMobileClose}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isCollapsed ? 'md:justify-center' : '',
                  isActive
                    ? 'bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active-fg)] font-medium'
                    : 'text-[var(--sidebar-item-fg)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--sidebar-item-hover-fg)]',
                ].join(' ')}
              >
                <Icon className="w-6 h-6 shrink-0" />
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
      {userRole !== 'Student' && (
        <div className="p-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          <TooltipWrapper show={isCollapsed} content="User Profile">
            <Link
              href="/userprofile"
              onClick={onMobileClose}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isCollapsed ? 'md:justify-center' : '',
                pathname === '/userprofile'
                  ? 'bg-[var(--sidebar-profile-active-bg)] text-[var(--sidebar-profile-active-fg)] font-medium'
                  : 'text-[var(--sidebar-item-fg)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--sidebar-item-hover-fg)]',
              ].join(' ')}
            >
              <User className="w-6 h-6 shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>User Profile</span>
            </Link>
          </TooltipWrapper>
        </div>
      )}
    </aside>
  );
}