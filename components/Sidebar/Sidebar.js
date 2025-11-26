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
  Settings,
  ChevronLeft,
  ChevronRight
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
  Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 shrink-0 overflow-y-auto transition-all duration-300 cursor-pointer`}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <nav className="p-4">
        <ul className="space-y-1" onClick={(e) => e.stopPropagation()}>
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.path;
            
            const linkContent = (
              <Link
                href={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
            
            return (
              <li key={item.name} >
                {isCollapsed ? (
                  <Tooltip content={item.name} placement="right" delay={0}
                  className='border px-2 border-gray-500 bg-white rounded-md shadow-md' 
                  >
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}