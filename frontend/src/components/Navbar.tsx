import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { LogOut, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Beche<span className="text-indigo-600">din</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Browse
          </Link>

          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </span>
              </div>
              <Link
                to="/post-ad"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} /> Post Ad
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors p-2"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link
                to="/post-ad"
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} /> Post Ad
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
            Browse
          </Link>
          {user ? (
            <>
              <div className="py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />}
                {user.displayName || user.email}
              </div>
              <Link to="/post-ad" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-indigo-600">
                + Post Ad
              </Link>
              <button onClick={handleLogout} className="block py-2 text-sm text-red-600">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
                Sign In
              </Link>
              <Link to="/post-ad" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-indigo-600">
                + Post Ad
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
