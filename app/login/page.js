'use client';

import { Laptop, Cpu, Users, ArrowRight, Sun, Moon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/app/context/AuthContext';
import { authenticateWithGoogle, updateUserReferrer } from '@/app/services/authService';
import { useEffect, useState, Suspense } from 'react';
import toast from 'react-hot-toast';
import Shuffle from '@/components/atoms/Shuffle';
import TextType from '@/components/atoms/TextType';
import TiltedCard from '@/components/atoms/TiltedCard'; 

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading, user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Role-based landing pages
  const rolesLandingPages = {
    volunteer: '/batch',
    admin: '/partners',
    partner: '/partners',
    default: '/dashboard',
  };

  // Amazon pathway ID for special redirection
  const amazonPathwayId = '99'; // Update this with actual pathway ID if needed

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Laptop className="text-white" size={28} />,
      title: 'Device Tracking',
      description: 'Real-time monitoring and management of all laptops and electronic devices.',
      details: '• Track device location • Monitor usage patterns • Automated alerts • Warranty tracking',
      bgColor: 'from-emerald-300 to-emerald-400',
      shadowColor: 'hover:shadow-emerald-200/50',
      animationClass: 'card-animate-1',
      borderColor: 'emerald',
    },
    {
      icon: <Cpu className="text-white" size={28} />,
      title: 'Component Control',
      description: 'Efficiently manage and track RAM, SSD, and other hardware components.',
      details: '• Inventory management • Component lifecycle • Compatibility checks • Stock alerts',
      bgColor: 'from-blue-300 to-blue-400',
      shadowColor: 'hover:shadow-blue-200/50',
      animationClass: 'card-animate-2',
      borderColor: 'blue',
    },
    {
      icon: <Users className="text-white" size={28} />,
      title: 'User Management',
      description: 'Streamlined asset allocation to employees with automated approval workflows.',
      details: '• Role-based access • Approval workflows • Allocation history • User analytics',
      bgColor: 'from-orange-300 to-orange-400',
      shadowColor: 'hover:shadow-orange-200/50',
      animationClass: 'card-animate-3',
      borderColor: 'orange',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes glassShine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes iconShine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        .icon-shine-wrapper {
          position: relative;
          overflow: hidden;
        }

        .icon-shine-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: iconShine 8s ease-in-out infinite;
        }

        .gradient-text-dark {
          background: linear-gradient(
            120deg,
            #60a5fa 0%,
            #818cf8 15%,
            #c4b5fd 30%,
            #f0f9ff 45%,
            #ffffff 50%,
            #f0f9ff 55%,
            #c4b5fd 70%,
            #818cf8 85%,
            #60a5fa 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: slideInUp 1s ease-out 0.3s both, glassShine 12s linear infinite;
        }

        .gradient-text-light {
          background: linear-gradient(
            120deg,
            #334155 0%,
            #475569 15%,
            #64748b 30%,
            #e2e8f0 45%,
            #f8fafc 50%,
            #e2e8f0 55%,
            #64748b 70%,
            #475569 85%,
            #334155 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: slideInUp 1s ease-out 0.3s both, glassShine 12s linear infinite;
        }

        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }

        .text-animate {
          animation: slideInUp 0.8s ease-out 0.5s both;
        }

        .card-animate-1 {
          animation: slideInUp 0.6s ease-out 0.8s both;
        }

        .card-animate-2 {
          animation: slideInUp 0.6s ease-out 1s both;
        }

        .card-animate-3 {
          animation: slideInUp 0.6s ease-out 1.2s both;
        }

        .btn-animate {
          animation: bounceIn 0.8s ease-out 1.4s both;
        }

        .feature-animate {
          animation: fadeIn 1s ease-out 1.6s both;
        }
      `}</style>

      <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-linear-to-br from-slate-900 via-slate-800 to-blue-900' : 'bg-linear-to-br from-white via-orange-50/30 to-emerald-50/40'}`}>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-slate-700/80 hover:bg-slate-600/80 text-yellow-400' : 'bg-white/80 hover:bg-gray-100/80 text-slate-700'} backdrop-blur-lg border ${isDarkMode ? 'border-slate-600' : 'border-gray-200'} shadow-lg`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Icons */}
          <div className={`absolute top-20 left-10 floating-icon ${isDarkMode ? 'opacity-10' : 'opacity-5'}`} style={{ animationDelay: '0s' }}>
            <Laptop size={80} className={isDarkMode ? 'text-blue-400' : 'text-slate-400'} />
          </div>
          <div className={`absolute top-32 right-20 floating-icon ${isDarkMode ? 'opacity-10' : 'opacity-5'}`} style={{ animationDelay: '1s' }}>
            <Cpu size={70} className={isDarkMode ? 'text-blue-400' : 'text-slate-400'} />
          </div>
          <div className={`absolute bottom-40 left-20 floating-icon ${isDarkMode ? 'opacity-10' : 'opacity-5'}`} style={{ animationDelay: '2s' }}>
            <Users size={75} className={isDarkMode ? 'text-cyan-400' : 'text-slate-400'} />
          </div>
          <div className={`absolute top-1/2 right-10 floating-icon ${isDarkMode ? 'opacity-10' : 'opacity-5'}`} style={{ animationDelay: '1.5s' }}>
            <Laptop size={65} className={isDarkMode ? 'text-indigo-400' : 'text-slate-400'} />
          </div>
          <div className={`absolute bottom-20 right-1/4 floating-icon ${isDarkMode ? 'opacity-10' : 'opacity-5'}`} style={{ animationDelay: '0.5s' }}>
            <Cpu size={85} className={isDarkMode ? 'text-blue-400' : 'text-slate-400'} />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-2 py-10">
        

          {/* Main Heading */}
          <Shuffle
            text="ASSETS TRACKER"
            tag="h1"
            className={`text-6xl md:text-8xl lg:text-7xl font-black mb-4 text-center ${isDarkMode ? 'gradient-text-dark' : 'gradient-text-light'}`}
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={1}
            ease="power3.out"
            stagger={0.03}
            triggerOnHover={false}
            loop={true}
            loopDelay={10}
            largeChars={['A', 'T']}
          />

          {/* Subheading */}
          <div className="text-animate">
            <TextType 
              text={[
                "Transform your organization's asset management with intelligent tracking",
                "Seamlessly track laptops, components, and allocations",
                "Real-time insights for smarter decisions"
              ]}
              as="p"
              className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-semibold text-center ${isDarkMode ? 'text-blue-100' : 'text-gray-700'}`}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="|"
            />
          </div>

          {/* Description */}
          <p 
            className={`text-sm max-w-2xl mx-auto text-center mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
            style={{ animation: 'slideInUp 0.8s ease-out 0.7s both' }}
          >
            Seamlessly manage laptops, components, and users with real-time insights.
          </p>

          {/* Login Section */}
          <div className="btn-animate my-4">
            <div className="flex justify-center [&_iframe]:rounded-full! [&_div]:rounded-full! overflow-hidden rounded-full">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                text="signin_with"
                shape="pill"
                size="large"
                theme={isDarkMode ? "filled_black" : "outline"}
                logo_alignment="left"
              />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
            {features.map((feature, index) => (
              <div key={index} className={feature.animationClass}>
                <TiltedCard
                  containerHeight="200px"
                  containerWidth="100%"
                  imageHeight="200px"
                  imageWidth="100%"
                  rotateAmplitude={12}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={false}
                  captionText={feature.title}
                  bgGradient={`bg-${feature.borderColor}${isDarkMode ? '-dark' : '-light'}`}
                >
                  <div className="flex flex-col gap-3 w-full h-full">
                    <div className="flex gap-4 items-start">
                      <div className={`icon-shine-wrapper w-14 h-14 shrink-0 bg-linear-to-br ${feature.bgColor} flex items-center justify-center rounded-xl shadow-lg`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{feature.description}</p>
                      </div>
                    </div>
                    <div className={`mt-auto pt-2 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{feature.details}</p>
                    </div>
                  </div>
                </TiltedCard>
              </div>
            ))}
          </div>

          {/* Bottom Features */}
          <div className="feature-animate mt-4 flex flex-wrap justify-center gap-8 md:gap-12">
            <div className={`flex items-center gap-3 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-slate-800/60 border border-slate-700' : 'bg-white/60 border border-gray-200'}`}>
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${isDarkMode ? 'bg-emerald-400 shadow-emerald-400/40' : 'bg-emerald-600 shadow-emerald-600/40'}`} />
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Real-time Sync</span>
            </div>
            <div className={`flex items-center gap-3 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-slate-800/60 border border-slate-700' : 'bg-white/60 border border-gray-200'}`}>
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${isDarkMode ? 'bg-blue-400 shadow-blue-400/40' : 'bg-blue-600 shadow-blue-600/40'}`} style={{ animationDelay: '0.3s' }} />
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Smart Automation</span>
            </div>
            <div className={`flex items-center gap-3 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-slate-800/60 border border-slate-700' : 'bg-white/60 border border-gray-200'}`}>
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${isDarkMode ? 'bg-orange-400 shadow-orange-400/40' : 'bg-orange-600 shadow-orange-600/40'}`} style={{ animationDelay: '0.6s' }} />
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>Cloud-Based</span>
            </div> 
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
