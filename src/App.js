import React, { useState, useEffect } from 'react';
import { Search, Upload, Crown, Check, Shield, Code, Trash2, Copy, Eye, EyeOff, Menu, X, LogOut, Loader } from 'lucide-react';

// ============= FIREBASE SETUP =============
// Paste Firebase SDK imports di sini saat production
const firebaseConfig = {
  apiKey: "AIzaSyCKaETqrLZA3Psrs7Ql5UJJwBaJNCi1gRo",
  authDomain: "revolt-script-hub.firebaseapp.com",
  projectId: "revolt-script-hub",
  storageBucket: "revolt-script-hub.firebasestorage.app",
  messagingSenderId: "630136477089",
  appId: "1:630136477089:web:94d883639ac89d65c027e0",
  measurementId: "G-BZVT58B44G"
};

// Mock Firebase functions untuk demo di Claude
// Di production, ganti dengan real Firebase imports
const mockFirebase = {
  auth: {
    signInWithEmailAndPassword: async (email, password) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { user: { uid: 'mock-uid', email } };
    },
    createUserWithEmailAndPassword: async (email, password) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { user: { uid: 'mock-uid-' + Date.now(), email } };
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },
  firestore: {
    collection: (name) => ({
      add: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { id: 'doc-' + Date.now() };
      },
      doc: (id) => ({
        get: async () => ({ exists: true, data: () => ({}) }),
        set: async (data) => {},
        delete: async () => {}
      }),
      where: () => ({
        get: async () => ({ docs: [] })
      }),
      get: async () => ({ docs: [] })
    })
  }
};

const ScriptHub = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [scripts, setScripts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', description: '', code: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize with mock data (for demo)
  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    const savedUser = localStorage.getItem('scriptHubUser');
    const savedScripts = localStorage.getItem('scriptHubScripts');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedScripts) setScripts(JSON.parse(savedScripts));

    // Create admin account if not exists
    const adminExists = localStorage.getItem('adminCreated');
    if (!adminExists) {
      const adminUser = {
        id: 'admin-revolt',
        username: 'Revolt',
        email: 'admin@revolt.com',
        password: 'Namakuhacker88',
        tier: 'admin',
        uploadCount: 0,
        maxUploads: Infinity,
        createdAt: new Date().toISOString()
      };
      const users = [adminUser];
      localStorage.setItem('scriptHubUsers', JSON.stringify(users));
      localStorage.setItem('adminCreated', 'true');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const pricingPlans = [
    {
      name: 'Free',
      price: 'Rp 0',
      period: '/bulan',
      uploads: '25 uploads',
      features: ['Basic Support', 'Public Scripts', 'Standard Speed', 'Community Access'],
      badge: null,
      color: 'gray'
    },
    {
      name: 'Premium',
      price: 'Rp 50.000',
      period: '/bulan',
      uploads: '200 uploads',
      features: ['Priority Support', 'Private Scripts', 'Fast Speed', 'Blue Verification ✓', 'Ad-Free Experience'],
      badge: 'verified',
      color: 'blue',
      popular: true
    },
    {
      name: 'Ultimate',
      price: 'Rp 150.000',
      period: '/bulan',
      uploads: 'Unlimited',
      features: ['24/7 VIP Support', 'All Features', 'Ultra Speed', 'Gold Crown 👑', 'Custom Badge', 'Early Access'],
      badge: 'gold',
      color: 'yellow'
    }
  ];

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem('scriptHubUsers') || '[]');

      if (authMode === 'login') {
        const foundUser = users.find(u => 
          u.username === authForm.username && u.password === authForm.password
        );
        
        if (foundUser) {
          // Update last login
          foundUser.lastLogin = new Date().toISOString();
          const updatedUsers = users.map(u => u.id === foundUser.id ? foundUser : u);
          localStorage.setItem('scriptHubUsers', JSON.stringify(updatedUsers));
          
          setUser(foundUser);
          localStorage.setItem('scriptHubUser', JSON.stringify(foundUser));
          setShowAuthModal(false);
          setAuthForm({ username: '', password: '', email: '' });
          showNotification(`Welcome back, ${foundUser.username}!`);
        } else {
          showNotification('Invalid credentials!', 'error');
        }
      } else {
        // Register
        if (users.find(u => u.username === authForm.username)) {
          showNotification('Username already exists!', 'error');
          setLoading(false);
          return;
        }

        if (users.find(u => u.email === authForm.email)) {
          showNotification('Email already registered!', 'error');
          setLoading(false);
          return;
        }

        const newUser = {
          id: 'user-' + Date.now(),
          username: authForm.username,
          password: authForm.password,
          email: authForm.email,
          tier: 'free',
          uploadCount: 0,
          maxUploads: 25,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('scriptHubUsers', JSON.stringify(updatedUsers));
        setUser(newUser);
        localStorage.setItem('scriptHubUser', JSON.stringify(newUser));
        setShowAuthModal(false);
        setAuthForm({ username: '', password: '', email: '' });
        showNotification('Account created successfully!');
      }
    } catch (error) {
      showNotification('An error occurred!', 'error');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scriptHubUser');
    setCurrentPage('home');
    showNotification('Logged out successfully!');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('Please login first!', 'error');
      return;
    }

    setLoading(true);

    try {
      // Check upload limit
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const userUploadThisMonth = scripts.filter(s => {
        const uploadDate = new Date(s.uploadedAt);
        return s.userId === user.id && 
               uploadDate.getMonth() === currentMonth &&
               uploadDate.getFullYear() === currentYear;
      }).length;

      if (user.tier !== 'admin' && userUploadThisMonth >= user.maxUploads) {
        showNotification('Upload limit reached this month! Upgrade to Premium.', 'error');
        setLoading(false);
        return;
      }

      // Generate unique script ID and URL
      const scriptId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      const loadstringUrl = `https://cdn.revolt-hub.xyz/s/${scriptId}`;
      
      const newScript = {
        id: scriptId,
        name: uploadForm.name,
        description: uploadForm.description,
        code: uploadForm.code,
        loadstring: `loadstring(game:HttpGet("${loadstringUrl}"))()`,
        url: loadstringUrl,
        userId: user.id,
        username: user.username,
        userTier: user.tier,
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        views: 0,
        status: 'active'
      };

      const updatedScripts = [...scripts, newScript];
      setScripts(updatedScripts);
      localStorage.setItem('scriptHubScripts', JSON.stringify(updatedScripts));

      // Update user stats
      const updatedUser = { ...user, uploadCount: (user.uploadCount || 0) + 1 };
      setUser(updatedUser);
      localStorage.setItem('scriptHubUser', JSON.stringify(updatedUser));

      setUploadModalOpen(false);
      setUploadForm({ name: '', description: '', code: '' });
      showNotification('Script uploaded successfully! 🎉');
      setCurrentPage('myScripts');
    } catch (error) {
      showNotification('Upload failed!', 'error');
    }

    setLoading(false);
  };

  const deleteScript = async (scriptId) => {
    if (!window.confirm('Are you sure you want to delete this script?')) return;

    setLoading(true);

    try {
      const updatedScripts = scripts.filter(s => s.id !== scriptId);
      setScripts(updatedScripts);
      localStorage.setItem('scriptHubScripts', JSON.stringify(updatedScripts));
      showNotification('Script deleted successfully!');
    } catch (error) {
      showNotification('Delete failed!', 'error');
    }

    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard! 📋');
  };

  const getBadge = (tier) => {
    if (tier === 'admin') return <Crown className="w-4 h-4 text-yellow-400" />;
    if (tier === 'ultimate') return <Crown className="w-4 h-4 text-yellow-400" />;
    if (tier === 'premium') return <Check className="w-4 h-4 text-blue-400" />;
    return null;
  };

  const getUploadStats = () => {
    if (!user) return { used: 0, total: 0, percentage: 0 };
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const used = scripts.filter(s => {
      const uploadDate = new Date(s.uploadedAt);
      return s.userId === user.id && 
             uploadDate.getMonth() === currentMonth &&
             uploadDate.getFullYear() === currentYear;
    }).length;
    
    const total = user.tier === 'admin' ? '∞' : user.maxUploads;
    const percentage = user.tier === 'admin' ? 100 : (used / user.maxUploads) * 100;
    
    return { used, total, percentage };
  };

  const filteredScripts = scripts
    .filter(s => s.status === 'active')
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const myScripts = user 
    ? scripts.filter(s => s.userId === user.id).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg backdrop-blur-md border animate-slide-in ${
          notification.type === 'error' 
            ? 'bg-red-500/90 border-red-400' 
            : 'bg-green-500/90 border-green-400'
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
            <span className="font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Shield className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Revolt Script Hub
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setCurrentPage('home')} 
                className={`hover:text-blue-400 transition font-medium ${currentPage === 'home' ? 'text-blue-400' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('scripts')} 
                className={`hover:text-blue-400 transition font-medium ${currentPage === 'scripts' ? 'text-blue-400' : ''}`}
              >
                Scripts
              </button>
              <button 
                onClick={() => setCurrentPage('pricing')} 
                className={`hover:text-blue-400 transition font-medium ${currentPage === 'pricing' ? 'text-blue-400' : ''}`}
              >
                Pricing
              </button>
              {user && (
                <button 
                  onClick={() => setCurrentPage('myScripts')} 
                  className={`hover:text-blue-400 transition font-medium ${currentPage === 'myScripts' ? 'text-blue-400' : ''}`}
                >
                  My Scripts
                </button>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
                    <span className="font-medium">{user.username}</span>
                    {getBadge(user.tier)}
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }} 
                  className="hidden md:block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                >
                  Login
                </button>
              )}
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4 animate-fade-in">
              <nav className="flex flex-col gap-3">
                <button 
                  onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} 
                  className="text-left py-2 hover:text-blue-400 font-medium"
                >
                  Home
                </button>
                <button 
                  onClick={() => { setCurrentPage('scripts'); setMobileMenuOpen(false); }} 
                  className="text-left py-2 hover:text-blue-400 font-medium"
                >
                  Scripts
                </button>
                <button 
                  onClick={() => { setCurrentPage('pricing'); setMobileMenuOpen(false); }} 
                  className="text-left py-2 hover:text-blue-400 font-medium"
                >
                  Pricing
                </button>
                {user && (
                  <button 
                    onClick={() => { setCurrentPage('myScripts'); setMobileMenuOpen(false); }} 
                    className="text-left py-2 hover:text-blue-400 font-medium"
                  >
                    My Scripts
                  </button>
                )}
                {user ? (
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-2 py-2">
                      <span className="font-medium">{user.username}</span>
                      {getBadge(user.tier)}
                    </div>
                    <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                      className="text-left text-red-400 hover:text-red-300 py-2"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setShowAuthModal(true); setAuthMode('login'); setMobileMenuOpen(false); }} 
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium mt-2"
                  >
                    Login
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome to Revolt Script Hub
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Premium Roblox script hosting with executor-only protection. Upload, manage, and share your scripts securely.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition transform hover:scale-105">
                <Shield className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Secure Protection</h3>
                <p className="text-gray-400">Advanced URL protection prevents unauthorized access to your scripts. Only executors can access.</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition transform hover:scale-105">
                <Code className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Easy Integration</h3>
                <p className="text-gray-400">Simple loadstring format for quick script execution. Copy and paste ready.</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-pink-500 transition transform hover:scale-105">
                <Crown className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Premium Features</h3>
                <p className="text-gray-400">Unlock unlimited uploads and exclusive verification badges.</p>
              </div>
            </div>

            {user ? (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Upload?</h3>
                <p className="text-gray-100 mb-6">Share your amazing scripts with the community</p>
                <button 
                  onClick={() => setUploadModalOpen(true)} 
                  className="px-8 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition inline-flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Script Now
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8 text-center border border-gray-600">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Community</h3>
                <p className="text-gray-300 mb-6">Create an account to start uploading and managing your scripts</p>
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('register'); }} 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                >
                  Get Started Free
                </button>
              </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-blue-400 mb-2">{scripts.length}</div>
                <div className="text-gray-400">Total Scripts</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                <div className="text-gray-400">Secure</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-green-400 mb-2">Free</div>
                <div className="text-gray-400">To Start</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-pink-400 mb-2">24/7</div>
                <div className="text-gray-400">Available</div>
              </div>
            </div>
          </div>
        )}

        {/* Scripts Page */}
        {currentPage === 'scripts' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Browse Scripts</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search scripts by name, description, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {filteredScripts.length > 0 && (
              <p className="text-gray-400 mb-6">{filteredScripts.length} script{filteredScripts.length !== 1 ? 's' : ''} found</p>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScripts.map(script => (
                <div key={script.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition transform hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{script.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>by {script.username}</span>
                        {getBadge(script.userTier)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-4 line-clamp-3 text-sm">{script.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span>{new Date(script.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(script.loadstring)} 
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Loadstring
                  </button>
                </div>
              ))}
            </div>

            {filteredScripts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Code className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">No scripts found</p>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
        )}

        {/* My Scripts Page */}
        {currentPage === 'myScripts' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">My Scripts</h2>
                <div className="flex items-center gap-4">
                  <p className="text-gray-400">
                    This month: <span className="font-bold text-blue-400">{getUploadStats().used}</span> / {getUploadStats().total} uploads
                  </p>
                  {user?.tier === 'free' && (
                    <button 
                      onClick={() => setCurrentPage('pricing')}
                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
                {/* Progress bar */}
                {user?.tier !== 'admin' && (
                  <div className="mt-3 w-full max-w-xs bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getUploadStats().percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <button 
                onClick={() => setUploadModalOpen(true)} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center gap-2 justify-center"
              >
                <Upload className="w-5 h-5" />
                Upload New
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myScripts.map(script => (
                <div key={script.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold line-clamp-1 flex-1">{script.name}</h3>
                    <button 
                      onClick={() => deleteScript(script.id)} 
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 ml-2"
                      title="Delete script"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 mb-4 line-clamp-2 text-sm">{script.description}</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => copyToClipboard(script.loadstring)} 
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Loadstring
                    </button>
                    <button 
                      onClick={() => copyToClipboard(script.url)} 
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy URL
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Uploaded: {new Date(script.uploadedAt).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>

            {myScripts.length === 0 && (
              <div className="text-center py-16 text-gray-400 bg-gray-800/30 rounded-xl border border-gray-700">
                <Upload className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">You haven't uploaded any scripts yet</p>
                <p className="text-sm mb-6">Start sharing your amazing creations with the community</p>
                <button 
                  onClick={() => setUploadModalOpen(true)} 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition inline-flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Your First Script
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pricing Page */}
        {currentPage === 'pricing' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-gray-400 text-lg">Unlock more features and uploads with premium plans</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {pricingPlans.map((plan, idx) => (
                <div key={idx} className={`relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border-2 ${
                  plan.popular ? 'border-blue-500 scale-105 shadow-xl shadow-blue-500/20' : 'border-gray-700'
                } hover:border-blue-400 transition transform hover:scale-105`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end justify-center gap-1 mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400 mb-1">{plan.period}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">{plan.uploads}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-lg font-bold transition ${
                    plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}>
                    {plan.name === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700 text-center">
              <h3 className="text-2xl font-bold mb-4">All Plans Include</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-bold mb-1">Secure Hosting</h4>
                    <p className="text-sm text-gray-400">Executor-only access protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-bold mb-1">Easy Integration</h4>
                    <p className="text-sm text-gray-400">Simple loadstring format</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-bold mb-1">Lifetime Access</h4>
                    <p className="text-sm text-gray-400">Scripts never expire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  placeholder="Enter your username"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="your@email.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  authMode === 'login' ? 'Login' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
                className="text-blue-400 hover:text-blue-300 transition"
              >
                {authMode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
              </button>
            </div>

            {authMode === 'login' && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center mb-2">Demo Admin Account:</p>
                <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
                  <p className="text-gray-400">Username: <span className="text-white font-mono">Revolt</span></p>
                  <p className="text-gray-400">Password: <span className="text-white font-mono">Namakuhacker88</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full border border-gray-700 my-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload New Script</h2>
              <button onClick={() => setUploadModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-lg transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Upload Limit This Month</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {getUploadStats().used} / {getUploadStats().total}
                  </p>
                </div>
                {user?.tier !== 'admin' && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Remaining</p>
                    <p className="text-xl font-bold text-green-400">
                      {user?.maxUploads - getUploadStats().used}
                    </p>
                  </div>
                )}
              </div>
              {user?.tier !== 'admin' && (
                <div className="mt-3 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(getUploadStats().percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Script Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Infinite Yield Admin Commands"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{uploadForm.name.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  placeholder="Describe what your script does, features, compatibility, etc..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none transition"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{uploadForm.description.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Script Code (Lua) *</label>
                <textarea
                  required
                  placeholder="-- Paste your Lua script here&#10;print('Hello from Revolt Script Hub!')"
                  value={uploadForm.code}
                  onChange={(e) => setUploadForm({ ...uploadForm, code: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm resize-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">{uploadForm.code.length} characters</p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-yellow-500">🔒 Security Protection</strong>
                    <p className="text-gray-300 mt-1">
                      Your script will be protected with executor-only access. The generated URL will automatically deny:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                      <li>Web browsers (Chrome, Firefox, etc.)</li>
                      <li>Developer tools & inspectors</li>
                      <li>HTTP sniffers & proxies</li>
                      <li>Web scrapers & bots</li>
                    </ul>
                    <p className="text-gray-300 mt-2">
                      ✅ Only Roblox executors can access your script!
                    </p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Script
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-lg">Revolt Script Hub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Premium Roblox script hosting with advanced security and executor-only protection.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-blue-400 transition">Home</button></li>
                <li><button onClick={() => setCurrentPage('scripts')} className="hover:text-blue-400 transition">Browse Scripts</button></li>
                <li><button onClick={() => setCurrentPage('pricing')} className="hover:text-blue-400 transition">Pricing</button></li>
                {user && <li><button onClick={() => setCurrentPage('myScripts')} className="hover:text-blue-400 transition">My Scripts</button></li>}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Executor-Only Access</li>
                <li>• Firebase Integration</li>
                <li>• GitHub Pages Ready</li>
                <li>• 100% Free Hosting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• React 18</li>
                <li>• Firebase SDK</li>
                <li>• Tailwind CSS</li>
                <li>• Lucide Icons</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Revolt Script Hub. Powered by Firebase & GitHub Pages.</p>
            <p className="mt-2 text-xs">Admin Account: Revolt | All uploads are secured with executor-only protection</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ScriptHub;
