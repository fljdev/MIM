import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { API_BASE_URL } from '../Config';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasAccessibilityProfile, setHasAccessibilityProfile] = useState<boolean | null>(null);
  const [checkingAccessibility, setCheckingAccessibility] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check accessibility profile when user is authenticated
  useEffect(() => {
    const checkAccessibilityProfile = async () => {
      if (!user) {
        setHasAccessibilityProfile(null);
        return;
      }

      setCheckingAccessibility(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHasAccessibilityProfile(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/accessibility-profile/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setHasAccessibilityProfile(true);
        } else if (response.status === 404) {
          setHasAccessibilityProfile(false);
        } else {
          // Other error - assume no profile for now
          setHasAccessibilityProfile(false);
        }
      } catch (error) {
        console.error('Error checking accessibility profile:', error);
        setHasAccessibilityProfile(false);
      } finally {
        setCheckingAccessibility(false);
      }
    };

    checkAccessibilityProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-brand-turquoise sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            {/* Logo - links to home */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <span className="text-xl font-bold text-gray-800">MiM</span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive('/')
                  ? 'text-brand-turquoise'
                  : 'text-gray-600 hover:text-brand-turquoise'
              }`}
            >
              Home
            </Link>
            {/* TODO: Temporarily hidden for MiM Town focus */}
            {/* <Link
              to="/journey-planner"
              className={`font-medium transition-colors ${
                isActive('/journey-planner')
                  ? 'text-brand-turquoise'
                  : 'text-gray-600 hover:text-brand-turquoise'
              }`}
            >
              Journey Planner
            </Link> */}
            {/* TODO: Temporarily hidden for MiM Town focus */}
            {/* <Link
              to="/browse-venues"
              className={`font-medium transition-colors ${
                isActive('/browse-venues')
                  ? 'text-brand-turquoise'
                  : 'text-gray-600 hover:text-brand-turquoise'
              }`}
            >
              Browse Venues
            </Link> */}
            <Link
              to="/mim-town/dashboard"
              className={`font-medium transition-colors ${
                isActive('/mim-town/dashboard') || location.pathname.startsWith('/mim-town')
                  ? 'text-brand-turquoise'
                  : 'text-gray-600 hover:text-brand-turquoise'
              }`}
            >
              MiM Town
            </Link>
          </div>

          {/* Right: Auth State */}
          <div className="relative" ref={menuRef}>
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-turquoise"></div>
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            ) : user ? (
              // Authenticated: Avatar with dropdown
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {/* Avatar with orange dot indicator */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    {/* Orange dot for missing accessibility profile */}
                    {hasAccessibilityProfile === false && !checkingAccessibility && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                    )}
                    {checkingAccessibility && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium hidden md:block">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </Link>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Unauthenticated: Login and Sign Up buttons
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-brand-turquoise transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/login?signup=true"
                  className="px-4 py-2 bg-brand-turquoise text-white rounded-lg font-medium hover:bg-brand-turquoise-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;