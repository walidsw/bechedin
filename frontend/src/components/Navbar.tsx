import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, MessageSquare, User, Menu, X, LogOut, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bechedin_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bechedin_token');
    localStorage.removeItem('bechedin_user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Beche</span>
              <span className="text-gray-900">din</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Browse</Link>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 font-medium">{user.phoneNumber}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => navigate('/post-ad')}
                className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Post Ad
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-up">
          <div className="py-3 space-y-1 px-4">
            <Link to="/" className="block py-2.5 text-gray-700 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>Browse</Link>
            <Link to="/post-ad" className="block py-2.5 text-gray-700 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>Post Ad</Link>
            {user ? (
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left py-2.5 text-red-600 font-medium text-sm">
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="block py-2.5 text-primary-600 font-medium text-sm" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
