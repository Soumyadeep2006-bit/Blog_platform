import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
 

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed')
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-red-600">
            BlogLyfe
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/create" className="text-gray-700 hover:text-red-600 font-medium">
                  Write
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-red-600 font-medium">
                  Dashboard
                </Link>
                
                <Link to={`/profile/${user?.username}`} className="text-gray-700 hover:text-red-600 font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-red-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link to="/create" className="block text-gray-700 hover:text-red-600 font-medium py-2">
                  Write
                </Link>
                <Link to="/dashboard" className="block text-gray-700 hover:text-red-600 font-medium py-2">
                  Dashboard
                </Link>
                <Link to={`/profile/${user?.username}`} className="block text-gray-700 hover:text-red-600 font-medium py-2">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-red-600 font-medium py-2">
                  Login
                </Link>
                <Link to="/register" className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

