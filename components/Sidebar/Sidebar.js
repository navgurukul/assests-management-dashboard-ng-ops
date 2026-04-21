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
  PanelLeftOpen,
  PanelLeftClose,
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
  const isStudentOrEmployee = userRole === 'STUDENT' || userRole === 'EMPLOYEE';

  const filteredMenuItems = menuItems.filter(
    (item) => {
      if (userRole === 'STUDENT' && item.path === '/ticketforapproval') {
        return false;
      }
      return isStudentOrEmployee ? item.studentOnly : !item.studentOnly;
    }
  );

  return (
    <aside
      className={[
        'bg-(--sidebar-bg) border-r border-gray-200 overflow-y-auto transition-all duration-300 flex flex-col shrink-0',
        // Mobile: fixed drawer overlay
        'fixed inset-y-0 left-0 z-40 w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static inline, collapsible width
        'md:static md:inset-auto md:z-auto md:translate-x-0',
        isCollapsed ? 'md:w-24' : 'md:w-64',
      ].join(' ')}
    >
      <nav className="p-4 flex-1">
        {isCollapsed && (
          <div className="hidden md:flex justify-center mb-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg text-(--sidebar-item-fg) hover:bg-(--sidebar-item-hover-bg) hover:text-(--sidebar-item-hover-fg) transition-colors"
              aria-label="Open sidebar"
            >
              <PanelLeftOpen className="w-6 h-6" />
            </button>
          </div>
        )}
        <ul className="space-y-1">
          {filteredMenuItems.map((item, index) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.path;

            const linkContent = (
              <div className={!isCollapsed && index === 0 ? 'hidden md:flex items-center gap-2' : ''}>
                <Link
                  href={item.path}
                  onClick={onMobileClose}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold flex-1',
                    isCollapsed ? 'md:justify-center' : '',
                    isActive
                      ? 'bg-(--sidebar-item-active-bg) text-(--sidebar-item-active-fg)'
                      : 'text-(--sidebar-item-fg) hover:bg-(--sidebar-item-hover-bg) hover:text-(--sidebar-item-hover-fg)',
                  ].join(' ')}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  {/* Always show text on mobile; hide on desktop when collapsed */}
                  <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>
                </Link>
                {!isCollapsed && index === 0 && (
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="hidden md:block p-2 rounded-lg text-(--sidebar-item-fg) hover:bg-(--sidebar-item-hover-bg) hover:text-(--sidebar-item-hover-fg) transition-colors shrink-0"
                    aria-label="Close sidebar"
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </button>
                )}
              </div>
            );

            /* Show first item without wrapper div on mobile when expanded */
            if (!isCollapsed && index === 0) {
              return (
                <li key={item.name}>
                  {/* Mobile: just the link, Desktop: link + close button */}
                  <Link
                    href={item.path}
                    onClick={onMobileClose}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold md:hidden',
                      isActive
                        ? 'bg-(--sidebar-item-active-bg) text-(--sidebar-item-active-fg)'
                        : 'text-(--sidebar-item-fg) hover:bg-(--sidebar-item-hover-bg) hover:text-(--sidebar-item-hover-fg)',
                    ].join(' ')}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                  {linkContent}
                </li>
              );
            }

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
        <div className="p-4 border-t border-gray-200">
          <TooltipWrapper show={isCollapsed} content="User Profile">
            <Link
              href="/userprofile"
              onClick={onMobileClose}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-semibold',
                isCollapsed ? 'md:justify-center' : '',
                pathname === '/userprofile'
                  ? 'bg-(--sidebar-profile-active-bg) text-(--sidebar-profile-active-fg)'
                  : 'text-(--sidebar-item-fg) hover:bg-(--sidebar-item-hover-bg) hover:text-(--sidebar-item-hover-fg)',
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