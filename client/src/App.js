// src/App.js - FIXED VERSION
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Client Pages
import CreateClientProfile from './components/client/CreateClientProfile';
import ClientDashboard from './components/client/ClientDashboard';
import ClientProfilePage from "./components/client/ClientProfilePage";
import ClientProfileEditPage from './components/client/ClientProfileEditPage';
import ClientOrdersPage from './components/client/ClientOrdersPage';
import ClientChatsPage from './components/client/ClientChatsPage';
import CategoryPage from './components/client/CategoryPage';
import ServiceProvidersList from './components/client/ServiceProvidersList';
import ServiceList from './components/client/ServiceList';
import ProviderDetails from './components/client/ProviderDetails';
import ProviderProfileC from './components/client/ProviderProfileC';
import ChatPage from './components/client/ChatPage';
import PaymentPage from './components/client/PaymentPage';
import WriteReviewPage from './components/client/WriteReviewPage';
import AddToCartPage from './components/client/AddToCartPage';
import QuickBuyPage from './components/client/QuickBuyPage';
import CategoriesPage from './components/client/CategoriesPage';
import SearchPage from './components/client/SearchPage';
import FavoritesPage from './components/client/FavoritesPage';

// Provider Pages
import CreateProfile from './components/provider/CreateProfile';
import ProviderProfileView from './components/provider/ProviderProfileView';
import EditProviderProfile from './components/provider/EditProviderProfile';
import ManageBookings from './components/provider/ManageBookings';
import ProviderReviews from './components/provider/ProviderReviews';
import ProviderChat from './components/provider/ProviderChat';
import ProviderDashboard from './components/provider/ProviderDashboard';
import ProviderChatsPage from './components/provider/ProviderChatsPage';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import ManageProviders from './components/admin/ManageProviders';
import ManageOrders from './components/admin/ManageOrders';
import AdminSettings from './components/admin/AdminSettings';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminReports from './components/admin/AdminReports';

// Shared Components
import Navbar from './components/shared/Navbar';
import NotFound from './components/shared/NotFound';
import ErrorPage from './components/shared/ErrorPage';

// Import manual providers data
import { manualProviders } from './data';

// Import initProviders function
import initProviders from "./utils/initProviders";

// Route Animation Wrapper
const AnimatedRoute = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Initialize localStorage data on app start
const initializeAppData = () => {
  console.log('🔄 Initializing app data...');
  
  const essentialData = {
    users: [],
    services: [],
    bookings: [],
    clientOrders: [],
    reviews: [],
    chats: [],
    providers: [],
    manualProviders: manualProviders,
    clientCart: [],
    clientFavorites: [],
    allProvidersData: {},
    clientNotifications: [],
    categories: [
      {
        id: 'embroidery',
        name: 'Embroidery',
        description: 'Beautiful handcrafted embroidery work',
        image: '/assets/categories/embroidery.jpg',
        subcategories: ['Hand Embroidery', 'Machine Embroidery', 'Pearl Embroidery', 'Beads Embroidery']
      },
      {
        id: 'food',
        name: 'Home Cooked Food',
        description: 'Delicious homemade meals',
        image: '/assets/categories/food.jpg',
        subcategories: ['South Indian Meals', 'North Indian Meals', 'Quick Snacks', 'Special Diet Meals']
      },
      {
        id: 'gifts',
        name: 'Custom Gifts',
        description: 'Personalized and handmade gifts',
        image: '/assets/categories/gifts.jpg',
        subcategories: ['Handmade Gifts', 'Birthday Gifts', 'Wedding Gifts', 'Anniversary Gifts']
      },
      {
        id: 'arts',
        name: 'Arts & Crafts',
        description: 'Creative arts and crafts',
        image: '/assets/categories/arts.jpg',
        subcategories: ['Art Paintings', 'Paper Crafting', 'Clay Modelling', 'Collage Making']
      }
    ]
  };

  Object.keys(essentialData).forEach(key => {
    const currentData = localStorage.getItem(key);
    if (!currentData || currentData === 'null' || currentData === 'undefined') {
      localStorage.setItem(key, JSON.stringify(essentialData[key]));
      console.log(`✅ ${key} initialized`);
    } else {
      try {
        const existingData = JSON.parse(currentData);
        if (Array.isArray(existingData) && existingData.length > 0) {
          console.log(`📊 ${key} has existing data:`, existingData.length, 'items');
        }
      } catch (e) {
        console.log(`🔄 Resetting corrupted ${key}`);
        localStorage.setItem(key, JSON.stringify(essentialData[key]));
      }
    }
  });

  console.log('🎉 App data initialization complete');
};

// Load providers data from JSON file
const loadProvidersFromJSON = async () => {
  try {
    console.log('📁 Loading providers data from JSON file...');
    
    const response = await fetch(process.env.PUBLIC_URL + "/data/providers.json");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully loaded providers data:', data);
    
    if (data.providers && Array.isArray(data.providers)) {
      const providersMap = {};
      data.providers.forEach(provider => {
        providersMap[provider.id] = provider;
      });
      
      const existingData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
      const mergedData = { ...existingData, ...providersMap };
      
      localStorage.setItem('allProvidersData', JSON.stringify(mergedData));
      console.log(`📊 Loaded ${data.providers.length} providers from JSON file`);
    }
    
    return data;
  } catch (error) {
    console.warn('⚠️ Could not load providers.json, using fallback data:', error);
    
    const existingData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
    const manualProvidersMap = {};
    
    manualProviders.forEach(provider => {
      manualProvidersMap[provider.id] = provider;
    });
    
    const mergedData = { ...existingData, ...manualProvidersMap };
    localStorage.setItem('allProvidersData', JSON.stringify(mergedData));
    
    console.log(`📊 Using ${manualProviders.length} manual providers as fallback`);
    return { providers: manualProviders };
  }
};

// Reset authentication data
const resetAuthData = () => {
  console.log('🧹 Resetting authentication data...');
  
  const preservedData = {
    users: localStorage.getItem('users'),
    clientCart: localStorage.getItem('clientCart'),
    clientFavorites: localStorage.getItem('clientFavorites'),
    allProvidersData: localStorage.getItem('allProvidersData'),
    categories: localStorage.getItem('categories')
  };
  
  localStorage.clear();
  
  Object.keys(preservedData).forEach(key => {
    if (preservedData[key]) {
      localStorage.setItem(key, preservedData[key]);
    }
  });
  
  console.log('✅ Authentication data reset (user data preserved)');
};

// Public Route - for login/register pages
const PublicRoute = ({ children }) => {
  return children;
};

// Enhanced Protected Route for Regular Users
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (!token) {
      console.log('🔒 No token found, redirecting to login');
    } else if (requiredRole && userRole !== requiredRole) {
      console.log(`🚫 Role mismatch: ${userRole} vs ${requiredRole}`);
    }
  }, [token, userRole, requiredRole]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'provider') return <Navigate to="/provider/dashboard" replace />;
    if (userRole === 'client') return <Navigate to="/client/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Enhanced Protected Route for Manual Providers - FIXED
const ProviderProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  // Both token AND provider role required
  const canAccess = token && userRole === 'provider';
  
  if (!canAccess) {
    console.log('🔒 Provider access denied - missing token or wrong role, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ✅ FIXED: Enhanced Protected Route for Admin - UPDATED
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Both token AND admin role required
  if (!token || userRole !== 'admin') {
    console.log('🔒 Admin access denied - missing token or wrong role, redirecting to login');
    return <Navigate to="/login?admin=true" replace />;
  }
  
  return children;
};

// Enhanced Profile Check Route
const ProfileCheckRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!user.profileCompleted) {
    console.log(`📝 Profile incomplete, redirecting to create profile for ${role}`);
    const profileRoute = role === 'client' ? '/client/create-profile' : '/provider/create-profile';
    return <Navigate to={profileRoute} replace />;
  }
  
  return children;
};

// ✅ FIXED: Enhanced Role-Based Redirect - SIMPLIFIED VERSION
const RoleBasedRedirect = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const needsProfile = !currentUser.profileCompleted;

  console.log('🔍 Redirect check (simplified):', {
    token: !!token,
    userRole,
    needsProfile
  });

  // ❌ No token → always go to login
  if (!token || !userRole) {
    console.log('❌ No valid token or role, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If profile incomplete, send to profile creation
  if (needsProfile) {
    console.log(`📝 Profile incomplete for ${userRole}, redirecting to create profile`);
    if (userRole === 'client') {
      return <Navigate to="/client/create-profile" replace />;
    }
    if (userRole === 'provider') {
      return <Navigate to="/provider/create-profile" replace />;
    }
  }

  // Role-based dashboards
  if (userRole === 'admin') {
    console.log('👑 Admin detected, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (userRole === 'provider') {
    console.log('👩‍💼 Provider detected, redirecting to provider dashboard');
    return <Navigate to="/provider/dashboard" replace />;
  }
  if (userRole === 'client') {
    console.log('👤 Client detected, redirecting to client dashboard');
    return <Navigate to="/client/dashboard" replace />;
  }

  // Fallback
  console.log('❓ Unknown role or state, redirecting to login');
  return <Navigate to="/login" replace />;
};

// Main App Component with enhanced routing
function App() {
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 App starting...');
    
    initializeAppData();
    loadProvidersFromJSON();
    initProviders();
    
    // Debug functions
    window.debugApp = {
      showLoginPage: () => {
        resetAuthData();
        window.location.href = '/login';
      },
      
      checkAuth: () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const adminSession = JSON.parse(localStorage.getItem('adminSession') || "null");
        return {
          token: localStorage.getItem('token'),
          adminSession: adminSession,
          providerSession: localStorage.getItem('providerSession'),
          currentUser: currentUser,
          role: localStorage.getItem('role'),
          profileCompleted: currentUser.profileCompleted,
          cartItems: JSON.parse(localStorage.getItem('clientCart') || '[]').length,
          favorites: JSON.parse(localStorage.getItem('clientFavorites') || '[]').length,
          providersData: Object.keys(JSON.parse(localStorage.getItem('allProvidersData') || '{}')).length
        };
      },

      resetAppData: () => {
        if (!window.confirm("⚠️ This will clear login data and reload the app. Continue?")) {
            return;
        }

        console.log("🧹 Resetting App Data...");

        // Data to KEEP
        const keep = {
            users: localStorage.getItem("users"),
            allProvidersData: localStorage.getItem("allProvidersData"),
            categories: localStorage.getItem("categories"),
            clientCart: localStorage.getItem("clientCart"),
            clientFavorites: localStorage.getItem("clientFavorites")
        };

        // Clear everything
        localStorage.clear();

        // Restore preserved items
        Object.keys(keep).forEach(key => {
            if (keep[key]) {
                localStorage.setItem(key, keep[key]);
            }
        });

        console.log("✅ App data reset complete.");
        alert("🧹 App data has been reset. Reloading...");
        window.location.reload();
      },
      
      createTestUser: (role = 'client') => {
        const testUser = {
          id: `test-${role}-1`,
          name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: `test@example.com`,
          password: 'password123',
          role: role,
          profileCompleted: true,
          phone: '+1234567890',
          address: '123 Test Street',
          createdAt: new Date().toISOString()
        };
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(user => user.email !== 'test@example.com');
        filteredUsers.push(testUser);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        console.log(`👤 Test ${role} created:`, testUser);
        alert(`Test ${role} created!\nEmail: test@example.com\nPassword: password123`);
      },
      
      loginTestUser: (role = 'client') => {
        const testUser = {
          id: `test-${role}-1`,
          name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: `test@example.com`,
          role: role,
          profileCompleted: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        localStorage.setItem('token', 'test-token-' + Date.now());
        localStorage.setItem('role', role);
        
        console.log(`🔑 Logged in as test ${role}`);
        
        if (role === 'client') {
          window.location.href = '/client/dashboard';
        } else if (role === 'provider') {
          window.location.href = '/provider/dashboard';
        } else if (role === 'admin') {
          localStorage.setItem('adminSession', JSON.stringify(testUser));
          localStorage.setItem('adminToken', 'admin-token-' + Date.now());
          window.location.href = '/admin/dashboard';
        }
      },

      addSampleToCart: () => {
        const sampleItems = [
          {
            id: 'cart_sample_1',
            serviceId: 'embroidery_1',
            name: 'Custom Hand Embroidery',
            provider: 'Anita Sharma',
            providerId: 'hand_0',
            price: 899,
            image: '/assets/services/embroidery.jpg',
            quantity: 1,
            description: 'Beautiful hand embroidery with traditional designs',
            selected: true,
            category: 'Embroidery'
          },
          {
            id: 'cart_sample_2', 
            serviceId: 'gift_1',
            name: 'Personalized Gift Box',
            provider: 'Priya Patel',
            providerId: 'gift_0',
            price: 599,
            image: '/assets/services/gifts.jpg',
            quantity: 2,
            description: 'Custom gift box with handmade items',
            selected: true,
            category: 'Custom Gifts'
          }
        ];
        
        localStorage.setItem('clientCart', JSON.stringify(sampleItems));
        console.log('🛒 Sample items added to cart');
        alert('Sample items added to cart! Check the cart page.');
      },

      clearCart: () => {
        localStorage.setItem('clientCart', JSON.stringify([]));
        console.log('🛒 Cart cleared');
        alert('Cart cleared!');
      },

      checkProviders: () => {
        const providersData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
        console.log('👩‍💼 Providers data:', providersData);
        return providersData;
      },

      reloadProviders: () => {
        console.log('🔄 Reloading providers from JSON file...');
        loadProvidersFromJSON().then(data => {
          console.log('✅ Providers reloaded:', data);
          alert('Providers data reloaded from JSON file!');
        });
      },

      createSampleProviders: () => {
        const sampleProviders = {
          'hand_0': {
            id: 'hand_0',
            name: 'Priya Sharma',
            description: 'Passionate Hand Embroidery expert with excellent customer satisfaction.',
            image: '/assets/ServiceProviderImages/hand_embroidery.jpg',
            rating: '4.5',
            reviews: 45,
            location: 'Mumbai',
            experience: '3+ years',
            priceRange: '₹2000 - ₹10000',
            services: ['Hand Embroidery'],
            providerType: 'verified',
            products: [
              {
                id: 'prod_hand_0_0',
                name: 'Custom Embroidery Design',
                price: 1500,
                description: 'Beautiful Design crafted with care and attention to detail.',
                image: '/assets/ServiceProviderImages/Serviceproviderproductimages/product_1.jpg',
                rating: '4.5',
                reviews: 12,
                inStock: true,
                type: 'product'
              }
            ],
            phone: '+91 9876543210',
            email: 'priya.sharma@sheworks.com',
            bio: 'I am a passionate and dedicated Hand Embroidery specialist with 3+ years of experience.',
            responseRate: '95%',
            completionRate: '98%',
            onTimeDelivery: '96%'
          },
          'food_0': {
            id: 'food_0',
            name: 'Ananya Patel',
            description: 'Expert in traditional South Indian meals with authentic flavors.',
            image: '/assets/ServiceProviderImages/south_indian_meals.jpg',
            rating: '4.8',
            reviews: 67,
            location: 'Chennai',
            experience: '5+ years',
            priceRange: '₹300 - ₹1500',
            services: ['South Indian Meals'],
            providerType: 'verified',
            products: [
              {
                id: 'prod_food_0_0',
                name: 'Traditional Meal Package',
                price: 350,
                description: 'Complete South Indian meal with 5 items',
                image: '/assets/ServiceProviderImages/Serviceproviderproductimages/product_2.jpg',
                rating: '4.7',
                reviews: 23,
                inStock: true,
                type: 'product'
              }
            ],
            phone: '+91 9876543211',
            email: 'ananya.patel@sheworks.com',
            bio: 'Specialized in authentic South Indian cuisine with 5+ years of experience.',
            responseRate: '98%',
            completionRate: '99%',
            onTimeDelivery: '97%'
          }
        };
        
        localStorage.setItem('allProvidersData', JSON.stringify(sampleProviders));
        console.log('✅ Sample provider data created');
        alert('Sample provider data created! You can now test provider details page.');
      },

      resetEverything: () => {
        if (window.confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
          localStorage.clear();
          initializeAppData();
          loadProvidersFromJSON();
          initProviders();
          alert('✅ All data reset complete! Page will reload.');
          window.location.reload();
        }
      },

      exportData: () => {
        const data = {
          users: JSON.parse(localStorage.getItem('users') || '[]'),
          cart: JSON.parse(localStorage.getItem('clientCart') || '[]'),
          favorites: JSON.parse(localStorage.getItem('clientFavorites') || '[]'),
          providers: JSON.parse(localStorage.getItem('allProvidersData') || '{}')
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sheworks-backup.json';
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Data exported');
        alert('Data exported successfully!');
      },

      clearOneTimeReset: () => {
        sessionStorage.removeItem("authResetDone");
        console.log("🔄 One-time reset flag cleared. Next refresh will auto-logout.");
        alert("One-time reset flag cleared. Next page refresh will auto-logout.");
      }
    };
    
    console.log('💡 Debug commands available:');
    console.log('   - debugApp.showLoginPage() - Force login page');
    console.log('   - debugApp.resetAppData() - Reset login data (preserves users, providers, cart, favorites)');
    console.log('   - debugApp.checkAuth() - Check auth status');
    console.log('   - debugApp.createTestUser("client") - Create test client');
    console.log('   - debugApp.createTestUser("provider") - Create test provider');
    console.log('   - debugApp.createTestUser("admin") - Create test admin');
    console.log('   - debugApp.loginTestUser("client") - Login as test client');
    console.log('   - debugApp.loginTestUser("provider") - Login as test provider');
    console.log('   - debugApp.loginTestUser("admin") - Login as test admin');
    console.log('   - debugApp.addSampleToCart() - Add sample cart items');
    console.log('   - debugApp.clearCart() - Clear cart');
    console.log('   - debugApp.checkProviders() - Check provider data');
    console.log('   - debugApp.reloadProviders() - Reload providers from JSON');
    console.log('   - debugApp.createSampleProviders() - Create sample provider data');
    console.log('   - debugApp.resetEverything() - Reset all data (careful!)');
    console.log('   - debugApp.exportData() - Export data backup');
    console.log('   - debugApp.clearOneTimeReset() - Clear auto-logout flag');
    
    console.log('📊 Initial auth state:', window.debugApp.checkAuth());
  }, []);

  return (
    <div className="App">
      {/* Show navbar on all routes except auth pages */}
      <Routes>
        <Route path="/login" element={null} />
        <Route path="/register" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes - ALWAYS ACCESSIBLE */}
          <Route path="/" element={<RoleBasedRedirect />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <AnimatedRoute>
                  <Login />
                </AnimatedRoute>
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <AnimatedRoute>
                  <Register />
                </AnimatedRoute>
              </PublicRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <AdminDashboard />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <ManageUsers />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/providers" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <ManageProviders />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <ManageOrders />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <AdminSettings />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <AdminAnalytics />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <AdminRoute>
                <AnimatedRoute>
                  <AdminReports />
                </AnimatedRoute>
              </AdminRoute>
            } 
          />

          {/* Client Routes */}
          <Route 
            path="/client/create-profile" 
            element={
              <ProtectedRoute requiredRole="client">
                <AnimatedRoute>
                  <CreateClientProfile />
                </AnimatedRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ClientDashboard />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/profile" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ClientProfilePage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/edit-profile" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ClientProfileEditPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/orders" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ClientOrdersPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/chats" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ClientChatsPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Cart Route */}
          <Route 
            path="/client/cart" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <AddToCartPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* UNIFIED BOOKING ROUTE - Only QuickBuyPage */}
          <Route 
            path="/client/quick-buy/:providerId/:productId?" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <QuickBuyPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Service Discovery Routes */}
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <CategoriesPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/:category" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <CategoryPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/:category/:subService" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ServiceProvidersList />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* Alternative service list route */}
          <Route 
            path="/service-list/:category/:subService" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ServiceList />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* Provider Details Routes */}
          <Route 
            path="/provider/:providerId" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ProviderDetails />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider-profile/:providerId" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ProviderProfileC />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* Search and Favorites */}
          <Route 
            path="/search" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <SearchPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <FavoritesPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* Chat and Payment Routes */}
          <Route 
            path="/client/chat/:providerId" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <ChatPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/payment/:providerId" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <PaymentPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/writereview/:providerId" 
            element={
              <ProtectedRoute requiredRole="client">
                <ProfileCheckRoute role="client">
                  <AnimatedRoute>
                    <WriteReviewPage />
                  </AnimatedRoute>
                </ProfileCheckRoute>
              </ProtectedRoute>
            } 
          />

          {/* Provider Routes */}
          <Route 
            path="/provider/create-profile" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <CreateProfile />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/dashboard" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ProviderDashboard />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/profile" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ProviderProfileView />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/edit-profile" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <EditProviderProfile />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/manage-bookings" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ManageBookings />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/reviews" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ProviderReviews />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/chats" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ProviderChatsPage />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />
          <Route 
            path="/provider/chat/:bookingId" 
            element={
              <ProviderProtectedRoute>
                <AnimatedRoute>
                  <ProviderChat />
                </AnimatedRoute>
              </ProviderProtectedRoute>
            } 
          />

          {/* Error and Catch-All Routes */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

// Wrap App with Router with auto logout functionality
function AppWrapper() {
  useEffect(() => {
    // 🔁 ONE-TIME AUTO LOGOUT PER BROWSER SESSION
    const hasResetAuth = sessionStorage.getItem("authResetDone");
    if (!hasResetAuth) {
      console.log("🔄 First load this run → clearing auth/session data");

      const authKeys = [
        "token",
        "role", 
        "userRole",
        "currentUser",
        "providerSession",
        "adminSession",
        "adminToken"
      ];
      
      authKeys.forEach(key => localStorage.removeItem(key));
      
      console.log("✅ Auth data cleared for this session");
      sessionStorage.setItem("authResetDone", "true");
    }
  }, []);

  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;