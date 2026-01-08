'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="border-b border-gray-300 h-14 font-bold flex items-center justify-between px-4 bg-white z-10">
      <span>Assets Management Dashboard</span>
      
      {isAuthenticated && user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <span className="text-sm font-normal text-gray-700">{user.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-normal text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
