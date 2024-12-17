import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, User, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Header({ sidebarOpen, setSidebarOpen, setCurrentPage }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInitials, setUserInitials] = useState('');
  const [userName, setUserName] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      // Create initials from name
      const initials = storedName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
      setUserInitials(initials);
    }
  }, []);

  // Handle click outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        // Handle logout from other tabs
        handleLogoutCleanup();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Separate cleanup function
  const handleLogoutCleanup = () => {
    localStorage.clear();
    setUserName('');
    setUserInitials('');
    setShowDropdown(false);
    navigate('/login', { replace: true });
  };

  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just clean up and redirect
        handleLogoutCleanup();
        return;
      }

      // Proceed with logout if we have a session
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Logout API call failed:', error.message);
      }
      
      // Clean up regardless of API success
      handleLogoutCleanup();
      
    } catch (error) {
      console.error('Error during logout:', error.message);
      // Fallback: clean up even if everything fails
      handleLogoutCleanup();
    }
  };

  // Add a keyboard shortcut for logout (optional)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showDropdown]);

  return (
    <header className="bg-white shadow-md border-b border-blue-100 fixed top-0 right-0 left-0 md:left-64 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-800 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-blue-600 after:transition-transform hover:after:scale-x-100 hover:bg-transparent"
              onClick={() => setCurrentPage('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-800 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-blue-600 after:transition-transform hover:after:scale-x-100 hover:bg-transparent"
              onClick={() => setCurrentPage('tasks')}
            >
              Tasks
            </Button>
          </nav>
        </div>
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8 rounded-full bg-blue-100"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="text-sm font-medium">{userInitials}</span>
          </Button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  Welcome, {userName}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}