import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, User, PlusCircle, LogOut, Moon, Sun, Shield, Menu, X, ChevronDown, Building2, Users as UsersIcon, FileText, Facebook, Twitter, Linkedin, Instagram, Youtube, Phone, Mail, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { logout, user, isAdmin, isAuthenticated, adminLogout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu') && !target.closest('.admin-menu')) {
        setUserMenuOpen(false)
        setAdminMenuOpen(false)
      }
    }
    if (userMenuOpen || adminMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen, adminMenuOpen])

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar - Similar to MOHAN Foundation */}
      <div className="bg-gray-800 dark:bg-gray-900 text-white text-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center space-x-6">
              <a href="mailto:campushire078@gmail.com" className="flex items-center space-x-1 hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span>campushire078@gmail.com</span>
              </a>
              <a href="tel:+9118001037100" className="hidden sm:flex items-center space-x-1 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Call: 1800 103 7100</span>
              </a>
              <div className="hidden md:flex items-center space-x-3 ml-4 pl-4 border-l border-gray-700">
                <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-primary-400 transition-colors" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <>
                  <Link to="/auth" className="hover:text-primary-400 transition-colors">
                    Registration
                  </Link>
                  <Link to="/auth" className="hover:text-primary-400 transition-colors">
                    Login
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <span className="text-xs">
                  Welcome, {user?.full_name || user?.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Similar to MOHAN Foundation */}
      <nav className="bg-primary-700 dark:bg-primary-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">CampusHire</span>
                  <p className="text-xs text-primary-200">Interview Preparation & Placement Platform</p>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                <Link
                  to="/"
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  HOME
                </Link>
                
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    DASHBOARD
                  </Link>
                )}
                
                {!isAuthenticated && (
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    ADMIN
                  </Link>
                )}
                
                {isAuthenticated && (
                  <>
                    <div className="relative group">
                      <button
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/dashboard') || isActive('/company')
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        EXPERIENCES
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Browse Companies
                </Link>
                <Link
                  to="/experience/new"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Share Experience
                </Link>
                      </div>
                    </div>

                  </>
                )}

                {isAdmin && (
                  <div className="relative admin-menu group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAdminMenuOpen(!adminMenuOpen)
                      }}
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                      ADMIN
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 ${adminMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-200 z-50`}>
                      <Link
                        to="/admin"
                        onClick={() => setAdminMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        Admin Panel
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setAdminMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <UsersIcon className="w-4 h-4 inline mr-2" />
                        User Profiles
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setAdminMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Experiences Review
                  </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          adminLogout()
                          setAdminMenuOpen(false)
                          navigate('/dashboard')
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Exit Admin Mode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions - Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/auth"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold text-sm transition-colors"
                  >
                    GET STARTED
                  </Link>
                  <Link
                    to="/admin/login"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-sm transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    ADMIN
                  </Link>
                </>
              )}
              {isAuthenticated && !isAdmin && (
                <Link
                  to="/admin/login"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-sm transition-colors flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </Link>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>
              
              {isAuthenticated ? (
                <div className="relative user-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setUserMenuOpen(!userMenuOpen)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.full_name || user?.email}
              </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Home className="w-4 h-4 inline mr-2" />
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Shield className="w-4 h-4 inline mr-2" />
                            Admin Panel
                          </Link>
                          <button
                            onClick={() => {
                              adminLogout()
                              setUserMenuOpen(false)
                              navigate('/dashboard')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4 inline mr-2" />
                            Exit Admin Mode
                          </button>
                        </>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Browse Companies
                    </Link>
                    <Link
                      to="/experience/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Share Experience
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md font-medium"
                  >
                    Login / Sign Up
                  </Link>
                )}
            </div>
          </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
