'use client';

import { useState, useEffect, Suspense } from 'react';
import { Laptop, Settings, Ticket, BarChart3, ArrowRight, CheckCircle2, Zap, Lock, Users, TrendingUp, Shield, Smartphone, Tablet, Monitor, Package, Sun, Moon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/app/context/AuthContext';
import { authenticateWithGoogle, updateUserReferrer } from '@/app/services/authService';
import toast from 'react-hot-toast';
import { LayoutGroup, motion } from 'motion/react';
import WordListSwap from '@/app/components/WordListSwap';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Device items with icons and text
  const deviceItems = [
    { text: "Laptop", icon: Laptop },
    { text: "Mobile", icon: Smartphone },
    { text: "Tablet", icon: Tablet },
    { text: "Device", icon: Monitor },
    { text: "Asset", icon: Package },
  ];

  // Role-based landing pages
  const rolesLandingPages = {
    volunteer: '/batch',
    admin: '/partners',
    partner: '/partners',
    default: '/dashboard',
  };

  // Amazon pathway ID for special redirection
  const amazonPathwayId = '99';

  useEffect(() => {
    setIsLoaded(true);
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Toggle theme and save preference
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated && user) {
      handleRedirect();
    }
  }, [isAuthenticated, user]);

  const handleRedirect = () => {
    const rolesList = user?.rolesList || [];
    const partnerId = user?.partner_id;
    const referrer = searchParams.get('referrer');
    
    // Handle referrer-based redirection
    if (referrer) {
      if (referrer.includes('amazon')) {
        router.push(`/pathway/${amazonPathwayId}`);
        return;
      }
    }

    // Handle Amazon ACB students (partner_id 932)
    if (
      partnerId == 932 &&
      !rolesList.includes('partner') &&
      !rolesList.includes('admin')
    ) {
      router.push(`/pathway/${amazonPathwayId}`);
      return;
    }

    // Handle volunteer application flow
    const fromVolunteer = sessionStorage.getItem('fromVolunteer');
    if (fromVolunteer) {
      sessionStorage.removeItem('fromVolunteer');
      if (rolesList.includes('volunteer')) {
        router.push('/batch');
        return;
      } else {
        router.push('/volunteer-form');
        return;
      }
    }

    // Check for protected route redirection
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
      return;
    }

    // Default role-based redirection
    const primaryRole = rolesList[0];
    const landingPage = rolesLandingPages[primaryRole] || rolesLandingPages.default;
    router.push(landingPage);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        toast.error('Failed to get authentication token');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Authenticating...');

      // Send idToken to backend
      const result = await authenticateWithGoogle(idToken);

      toast.dismiss(loadingToast);

      if (result.success) {
        const { token, user } = result.data;

        // Prepare user data for context
        const userData = {
          token: token,
          user: user,
        };

        // Save to auth context (which also saves to localStorage)
        login(userData);

        // Handle referrer if present
        const referrer = searchParams.get('referrer');
        if (referrer && token) {
          await updateUserReferrer(token, referrer);
        }

        toast.success(`Welcome, ${user.firstName}!`);

        // Redirect will be handled by useEffect
      } else {
        // Handle error
        const errorMessage = result.error?.message || 'Authentication failed';
        toast.error(errorMessage);
        console.error('Authentication error:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    toast.error('Google login failed. Please try again.');
  };

  const features = [
    {
      icon: <Laptop className="w-12 h-12" />,
      title: "Asset Allocation",
      description: "Seamlessly assign laptops, mobiles, and tablets to students and employees with instant tracking"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "User Management",
      description: "Manage student and employee profiles, track their assigned devices, and monitor usage patterns"
    },
    {
      icon: <Ticket className="w-12 h-12" />,
      title: "Request Handling",
      description: "Streamlined system for asset requests, approvals, and returns with automated workflows"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Real-time Analytics",
      description: "Get instant insights on asset distribution, availability, and utilization across your organization"
    },
    {
      icon: <Settings className="w-12 h-12" />,
      title: "Device Specifications",
      description: "Track detailed hardware specs including RAM, storage, processor, and maintain service history"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Audit & Tracking",
      description: "Complete audit trail of all asset movements, assignments, and status changes for accountability"
    }
  ];

  const stats = [
    { number: "850+", label: "Assets Tracked", delay: 0 },
    { number: "300+", label: "Active Users", delay: 100 },
    { number: "99.5%", label: "Allocation Success", delay: 200 },
    { number: "24/7", label: "Asset Monitoring", delay: 300 }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-600' : 'border-blue-500'} mx-auto`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'}`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'} overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 opacity-40 z-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'} rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-30`}></div>
        <div className={`absolute top-1/3 right-1/4 w-96 h-96 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'} rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-30 animation-delay-2000`}></div>
        <div className={`absolute bottom-0 left-1/2 w-96 h-96 ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-400'} rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-30 animation-delay-4000`}></div>
      </div>

      {/* Navigation */}
      {/* <nav className={`relative z-20 flex justify-between items-center p-6 px-12 ${isDarkMode ? 'bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-xl border-white/5' : 'bg-gradient-to-b from-white/80 to-transparent backdrop-blur-xl'} transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
      
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Laptop className="w-6 h-6 text-white font-bold" />
        </div>
        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Asset Tracker</div>
      </div>

      
      <div className="flex items-center gap-4">
        
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all duration-300 border ${isDarkMode ? 'border-white/10' : 'border-gray-300'}`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Enterprise Solutions</div>
        </div>
      </div>
      </nav> */}

      <div className="relative z-10 min-h-screen flex items-start justify-center overflow-hidden pt-20">
        {/* Animated Grid Background */}
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-5' : 'opacity-10'}`}>
          <div 
            className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-blue-500/20 to-transparent' : 'bg-gradient-to-b from-blue-400/30 to-transparent'}`}
            style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)'
                : 'linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="max-w-6xl px-6 w-full relative z-10">
          <div className="grid grid-cols-1 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              {/* Badge */}
              <div>
                <span className={`inline-flex items-center gap-3 px-6 py-4 mb-6 ${isDarkMode ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-blue-100 border-blue-300 text-blue-700'} border rounded-full text-2xl font-semibold transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <button
                    onClick={toggleTheme}
                    className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-yellow-300' : 'hover:bg-gray-200 text-gray-700'} transition-all duration-300`}
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                  Asset Tracking Dashboard
                </span>
              </div>

              {/* Heading */}
              <h1 
                className={`text-6xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 leading-tight transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: '100ms' }}
              >
                <LayoutGroup>
                  <motion.span className="flex flex-wrap items-center gap-3 whitespace-pre" layout={true}>
                    <motion.span
                      layout={true}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    >
                      Track Every
                    </motion.span>
                    <WordListSwap
                      items={deviceItems}
                      mainClassName="px-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg overflow-hidden inline-flex justify-center items-center font-bold"
                      staggerFrom={"last"}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.02}
                      splitLevelClassName="overflow-hidden"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                      rotationInterval={2500}
                    />
                    <motion.span
                      layout={true}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    >
                      Assigned to Your Team
                    </motion.span>
                  </motion.span>
                </LayoutGroup>
              </h1>

              {/* Description */}
              <p 
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 leading-relaxed transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: '200ms' }}
              >
                Complete asset tracking solution for your organization. Seamlessly allocate laptops, mobiles, and tablets to students and employees. Monitor device status, manage assignments, handle requests, and maintain full visibility of all organizational assets in one powerful dashboard.
              </p>

              {/* CTA Buttons */}
              <div 
                className={`flex gap-4 flex-wrap transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="flex justify-center items-stretch gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg">
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                        text="signin_with"
                        shape="pill"
                        size="large"
                        theme="filled_blue"
                        logo_alignment="left"
                        width="230"
                      />
                    </div>
                  </div> 
                </div>
              </div>
            </div>
 
          </div>
        </div>
      </div>

      {/* Three Cards Section - Horizontally Aligned */}
      <div className="relative z-10 mt-8 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Total Assets */}
            <div className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-blue-900/60 to-blue-800/40 border-blue-500/50 shadow-blue-500/30 hover:shadow-blue-500/50' : 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 shadow-blue-200/50 hover:shadow-blue-300/70'} rounded-2xl border backdrop-blur-xl p-8 shadow-2xl animate-float transition-all duration-500 transform hover:scale-105 hover:-rotate-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '500ms', animationDelay: '0s'}}>
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0' : 'bg-gradient-to-r from-blue-300/0 via-blue-300/20 to-blue-300/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-blue-500/30 border-blue-400/50' : 'bg-blue-200/50 border-blue-400'} rounded-lg flex items-center justify-center border group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Laptop className={`w-6 h-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Total Assets</span>
                </div>
                <div className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 group-hover:scale-110 transition-transform duration-300`}>842</div>
                <div className={`${isDarkMode ? 'text-blue-300' : 'text-blue-600'} text-sm`}>Laptops, Mobiles & Tablets</div>
              </div>
            </div>

            {/* Card 2 - Active Assignments */}
            <div className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-purple-900/60 to-purple-800/40 border-purple-500/50 shadow-purple-500/30 hover:shadow-purple-500/50' : 'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300 shadow-purple-200/50 hover:shadow-purple-300/70'} rounded-2xl border backdrop-blur-xl p-8 shadow-2xl animate-float transition-all duration-500 transform hover:scale-105 hover:-rotate-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '600ms', animationDelay: '1s'}}>
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0' : 'bg-gradient-to-r from-purple-300/0 via-purple-300/20 to-purple-300/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-500/30 border-purple-400/50' : 'bg-purple-200/50 border-purple-400'} rounded-lg flex items-center justify-center border group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Users className={`w-6 h-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                  </div>
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Active Assignments</span>
                </div>
                <div className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 group-hover:scale-110 transition-transform duration-300`}>567</div>
                <div className={`${isDarkMode ? 'text-purple-300' : 'text-purple-600'} text-sm`}>To students & employees</div>
              </div>
            </div>

            {/* Card 3 - Pending Requests */}
            <div className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-cyan-900/60 to-cyan-800/40 border-cyan-500/50 shadow-cyan-500/30 hover:shadow-cyan-500/50' : 'bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-300 shadow-cyan-200/50 hover:shadow-cyan-300/70'} rounded-2xl border backdrop-blur-xl p-8 shadow-2xl animate-float transition-all duration-500 transform hover:scale-105 hover:-rotate-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '700ms', animationDelay: '2s'}}>
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0' : 'bg-gradient-to-r from-cyan-300/0 via-cyan-300/20 to-cyan-300/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`}></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-cyan-500/30 border-cyan-400/50' : 'bg-cyan-200/50 border-cyan-400'} rounded-lg flex items-center justify-center border group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Ticket className={`w-6 h-6 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`} />
                  </div>
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Pending Requests</span>
                </div>
                <div className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 group-hover:scale-110 transition-transform duration-300`}>18</div>
                <div className={`${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'} text-sm`}>Awaiting approval</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`relative z-10 py-10 px-6 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-slate-950/50 to-transparent border-white/5' : 'bg-gradient-to-b from-transparent via-blue-50/50 to-transparen'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 transform ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{transitionDelay: `${stat.delay}ms`}}
              >
                <div className="inline-block mb-2">
                  <div className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} bg-clip-text text-transparent animate-count`}>
                    {stat.number}
                  </div>
                </div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className={`text-center mb-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '500ms'}}>
          <h2 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Everything You Need to <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} bg-clip-text text-transparent`}>Track Assets</span>
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>Powerful features designed for seamless asset allocation and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative ${isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-cyan-500/50 hover:shadow-cyan-500/20' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-cyan-400/50 hover:shadow-cyan-300/30'} backdrop-blur-xl rounded-2xl p-8 border transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{transitionDelay: `${600 + index * 80}ms`}}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : 'bg-gradient-to-br from-cyan-400 to-blue-400'} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0`}></div>
              
              <div className="relative z-10">
                <div className={`${isDarkMode ? 'text-cyan-400 group-hover:text-blue-300' : 'text-cyan-600 group-hover:text-blue-600'} mb-4 transform group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className={`${isDarkMode ? 'text-white group-hover:text-cyan-300' : 'text-gray-900 group-hover:text-cyan-600'} font-bold text-lg mb-3 transition-colors duration-300`}>{feature.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'} text-sm leading-relaxed transition-colors duration-300`}>{feature.description}</p>
                
                <div className={`mt-6 flex items-center ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300`}>
                  <span className="text-sm font-semibold">Explore feature</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 py-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '1200ms'}}>
        <div className={`relative overflow-hidden rounded-3xl ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 border-white/20 shadow-blue-500/30' : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 border-blue-300 shadow-blue-400/40'} p-12 md:p-16 border shadow-2xl`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
          </div>

          <div className="relative z-10 text-center">
            <Zap className="w-16 h-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Take Control of Your Assets?</h2>
            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">Start tracking and managing all your organizational devices efficiently. Sign in to get started!</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                  text="signin_with"
                  shape="pill"
                  size="large"
                  theme="filled_black"
                  logo_alignment="left"
                />
              </div>
            </div>

            <p className="text-white/70 text-sm mt-8">Secure authentication • Instant access • Complete asset visibility</p>
          </div>
        </div>
      </div>

      {/* Footer - Fixed Vertical Order */}
      <footer className={`relative z-10 ${isDarkMode ? 'border-white/10 bg-slate-950' : 'border-gray-200 bg-white'} border-t py-16 px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-white" />
                </div>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg`}>Asset Tracker</span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm leading-relaxed`}>Enterprise asset management solutions for modern organizations</p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-6`}>Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Features</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Pricing</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Security</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-6`}>Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>About</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Blog</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Careers</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg mb-6`}>Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Privacy</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Terms</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition duration-300`}>Contact</a></li>
              </ul>
            </div>
          </div>

          <div className={`${isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-600'} border-t mt-12 pt-8 text-center text-sm`}>
            <p>&copy; 2026 AssetHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes count {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  return (
    <Suspense fallback={
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-600' : 'border-blue-500'} mx-auto`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
