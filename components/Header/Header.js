import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { LogOut, User, ChevronDown, Menu, Sun, Moon } from 'lucide-react';

const Header = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/userprofile');
  };

  return (
    <header className="w-full border-b border-[var(--border)] h-14 flex items-center justify-between px-4 bg-[var(--background)] z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden md:inline font-bold text-[var(--foreground)]">Assets Management Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        {/* <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark' ? 'header-btn-dark' : 'header-btn-light'
          }`}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button> */}

        {isAuthenticated && user && (
          <div className="relative" ref={dropdownRef}>
            <button
              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors ${
                theme === 'dark' ? 'header-btn-dark' : 'header-btn-light'
              }`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="hidden sm:block text-sm font-normal inherit-color">
                Hi, {user.firstName || user.name}
              </span>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'header-icon-bg-dark text-gray-300' : 'header-icon-bg-light text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
              </div>

              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 border rounded-md shadow-lg py-1 z-50 ${
                  theme === 'dark' ? 'header-dropdown-dark' : 'header-dropdown-light'
                }`}
              >
                <button
                  onClick={handleProfileClick}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-normal transition-colors ${
                    theme === 'dark' ? 'header-btn-dark' : 'header-btn-light'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>User Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-normal transition-colors ${
                    theme === 'dark' ? 'header-btn-dark' : 'header-btn-light'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
