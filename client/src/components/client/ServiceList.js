import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Import all JSON data files
import providersData from '../../data/providers.json';
import productsData from '../../data/products.json';
import servicesData from '../../data/services.json';
import categoriesData from '../../data/categories.json';
import usersData from '../../data/users.json';
import reviewsData from '../../data/reviews.json';
import bookingsData from '../../data/bookings.json';

import './ServiceList.css';

const BASE_URL = 'http://localhost:5000';

function ServiceList() {
  const { category, subService } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    minRating: 0,
    priceRange: 'all',
    location: '',
    experience: 'all',
    availability: 'all',
    providerType: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickCompare, setQuickCompare] = useState(false);
  const [bulkActions, setBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [favoriteProviders, setFavoriteProviders] = useState(new Set());

  // Initialize from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('clientFavorites') || '[]');
    const favoriteIds = new Set(savedFavorites.map(fav => fav.providerId));
    setFavoriteProviders(favoriteIds);
  }, []);

  // Enhanced data fetching with JSON integration
  useEffect(() => {
    if (!category || !subService) {
      setError('Invalid route parameters');
      setLoading(false);
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      setError('');
      
      try {
        let providersList = [];

        // Try to fetch from API first
        try {
          const res = await axios.get(
            `${BASE_URL}/api/services/category/${encodeURIComponent(category)}/subservice/${encodeURIComponent(subService)}`
          );
          providersList = res.data || [];
        } catch (apiError) {
          console.log('API fetch failed, using JSON data:', apiError);
          providersList = getProvidersFromJSON(category, subService);
        }

        // If no data from API or JSON, use demo data
        if (providersList.length === 0) {
          providersList = generateDemoProviders(category, subService);
        }

        // Enhance provider data with additional information from JSON files
        const enhancedProviders = providersList.map(provider => 
          enhanceProviderData(provider, category, subService)
        );

        setProviders(enhancedProviders);

      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load providers. Using demo data.');
        const demoProviders = generateDemoProviders(category, subService);
        setProviders(demoProviders.map(provider => 
          enhanceProviderData(provider, category, subService)
        ));
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category, subService]);

  // Get providers from JSON data
  const getProvidersFromJSON = (category, subService) => {
    let providersList = [];

    // Method 1: Search in providers.json
    if (providersData && providersData.providers) {
      providersList = providersData.providers.filter(provider => 
        provider.category?.toLowerCase() === category.toLowerCase() ||
        provider.service?.toLowerCase().includes(subService.toLowerCase()) ||
        provider.skills?.some(skill => skill.toLowerCase().includes(subService.toLowerCase()))
      );
    }

    // Method 2: Search in services.json
    if (providersList.length === 0 && servicesData && servicesData.services) {
      const serviceProviders = servicesData.services.filter(service =>
        service.category?.toLowerCase() === category.toLowerCase() &&
        service.subService?.toLowerCase().includes(subService.toLowerCase())
      ).map(service => ({
        ...service.provider,
        service: service.name,
        description: service.description
      }));
      providersList = [...providersList, ...serviceProviders];
    }

    // Method 3: Search in users.json for service providers
    if (providersList.length === 0 && usersData && usersData.users) {
      const userProviders = usersData.users.filter(user =>
        user.role === 'provider' &&
        (user.skills?.some(skill => skill.toLowerCase().includes(subService.toLowerCase())) ||
         user.category?.toLowerCase() === category.toLowerCase())
      );
      providersList = [...providersList, ...userProviders];
    }

    return providersList.slice(0, 20); // Limit results
  };

  // Enhance provider data with additional information
  const enhanceProviderData = (provider, category, subService) => {
    // Get products for this provider
    const providerProducts = getProviderProducts(provider.id);
    
    // Get reviews for this provider
    const providerReviews = getProviderReviews(provider.id);
    
    // Calculate average rating
    const avgRating = providerReviews.length > 0 
      ? (providerReviews.reduce((sum, review) => sum + review.rating, 0) / providerReviews.length).toFixed(1)
      : (4.0 + Math.random() * 1).toFixed(1);

    // Get bookings count
    const bookingsCount = getProviderBookingsCount(provider.id);

    return {
      id: provider.id || provider._id || `provider_${Date.now()}_${Math.random()}`,
      name: provider.name || provider.username || 'Service Provider',
      image: provider.image || provider.profileImage || provider.avatar || '/assets/default-profile.png',
      description: provider.description || provider.bio || `Professional ${subService} provider specializing in ${category}`,
      location: provider.location || provider.city || provider.address || 'Location not specified',
      experience: provider.experience || provider.yearsOfExperience || `${Math.floor(Math.random() * 10) + 1}+ years`,
      priceRange: provider.priceRange || provider.pricing || `₹${500 + Math.random() * 2000} - ₹${2000 + Math.random() * 3000}`,
      rating: parseFloat(avgRating),
      reviews: providerReviews.length || Math.floor(Math.random() * 100) + 5,
      products: providerProducts,
      skills: provider.skills || provider.services || [subService, `${category} Services`],
      providerType: provider.providerType || (Math.random() > 0.7 ? 'verified' : 'professional'),
      responseRate: provider.responseRate || `${Math.floor(80 + Math.random() * 20)}%`,
      completionRate: provider.completionRate || `${Math.floor(85 + Math.random() * 15)}%`,
      languages: provider.languages || ['English', 'Hindi'],
      certification: provider.certification || provider.qualification || 'Professional Certified',
      availability: provider.availability || 'Available',
      portfolio: provider.portfolio || generatePortfolioItems(provider.id, subService),
      contact: {
        phone: provider.phone || provider.contactNumber || `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
        email: provider.email || `${provider.name?.toLowerCase().replace(' ', '.')}@sheworks.com`,
        whatsapp: provider.whatsapp || provider.phone
      },
      stats: {
        completedProjects: bookingsCount || Math.floor(Math.random() * 50) + 10,
        repeatClients: Math.floor(Math.random() * 30) + 5,
        satisfactionRate: `${Math.floor(90 + Math.random() * 10)}%`
      },
      social: provider.social || {
        website: provider.website,
        instagram: provider.instagram,
        facebook: provider.facebook
      },
      // Additional metadata
      category: category,
      subService: subService,
      joinedDate: provider.joinedDate || provider.createdAt || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: provider.lastActive || new Date().toISOString(),
      isFavorite: favoriteProviders.has(provider.id)
    };
  };

  // Get products for provider from products.json
  const getProviderProducts = (providerId) => {
    if (!productsData || !productsData.products) return [];
    
    return productsData.products
      .filter(product => product.providerId === providerId || product.providerId?.toString() === providerId)
      .slice(0, 5) // Limit to 5 products
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        inStock: product.inStock !== false
      }));
  };

  // Get reviews for provider from reviews.json
  const getProviderReviews = (providerId) => {
    if (!reviewsData || !reviewsData.reviews) return [];
    
    return reviewsData.reviews
      .filter(review => review.providerId === providerId || review.providerId?.toString() === providerId)
      .slice(0, 10); // Limit to 10 reviews
  };

  // Get bookings count from bookings.json
  const getProviderBookingsCount = (providerId) => {
    if (!bookingsData || !bookingsData.bookings) return 0;
    
    return bookingsData.bookings.filter(
      booking => booking.providerId === providerId || booking.providerId?.toString() === providerId
    ).length;
  };

  // Generate portfolio items
  const generatePortfolioItems = (providerId, serviceType) => {
    return Array.from({ length: 6 }, (_, index) => ({
      id: `portfolio_${providerId}_${index}`,
      image: `/assets/portfolio/${serviceType.toLowerCase()}_${index + 1}.jpg`,
      title: `${serviceType} Project ${index + 1}`,
      description: `Professional ${serviceType.toLowerCase()} work showcasing quality and craftsmanship`,
      category: serviceType
    }));
  };

  // Enhanced demo data generator with JSON integration
  const generateDemoProviders = useCallback((category, subService) => {
    const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
    const experiences = ["1-2 years", "3-5 years", "5-8 years", "8+ years"];
    const indianWomenNames = [
      "Priya Sharma", "Ananya Patel", "Divya Reddy", "Sneha Kumar", "Riya Gupta",
      "Neha Singh", "Pooja Mehta", "Kavya Joshi", "Shreya Malhotra", "Aditi Choudhury",
      "Nandini Iyer", "Madhuri Desai", "Sunita Nair", "Lakshmi Menon", "Sarika Pillai"
    ];

    return Array.from({ length: 15 }, (_, index) => {
      const name = indianWomenNames[index % indianWomenNames.length];
      const basePrice = [800, 1200, 1500, 2000, 2500, 3000][index % 6];
      
      return {
        id: `demo_${category}_${subService}_${index}`,
        name: name,
        location: cities[index % cities.length],
        experience: experiences[index % experiences.length],
        priceRange: `₹${basePrice} - ₹${basePrice + 1500}`,
        rating: (4.0 + Math.random() * 1).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 10,
        skills: [subService, `${category} Specialist`, "Custom Work"],
        providerType: Math.random() > 0.7 ? 'verified' : 'professional'
      };
    });
  }, []);

  // Filter and sort providers with advanced filtering
  const filteredAndSortedProviders = useMemo(() => {
    return providers
      .filter(provider => {
        const matchesRating = provider.rating >= filters.minRating;
        const matchesLocation = filters.location === '' || 
          provider.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesSearch = searchQuery === '' || 
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
          provider.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filters.providerType === 'all' || 
          provider.providerType === filters.providerType;
        const matchesAvailability = filters.availability === 'all' || 
          provider.availability.toLowerCase().includes(filters.availability.toLowerCase());

        return matchesRating && matchesLocation && matchesSearch && matchesType && matchesAvailability;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'reviews':
            return b.reviews - a.reviews;
          case 'price-low':
            return parseInt(a.priceRange.split(' - ')[0].replace('₹', '')) - parseInt(b.priceRange.split(' - ')[0].replace('₹', ''));
          case 'price-high':
            return parseInt(b.priceRange.split(' - ')[1].replace('₹', '')) - parseInt(a.priceRange.split(' - ')[1].replace('₹', ''));
          case 'experience':
            return parseInt(b.experience) - parseInt(a.experience);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [providers, filters, sortBy, searchQuery]);

  // Pagination
  const paginatedProviders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProviders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProviders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProviders.length / itemsPerPage);

  // Event Handlers
  const handleQuickBook = useCallback((providerId) => {
    const provider = providers.find(p => p.id === providerId);
    navigate(`/client/book/${providerId}`, {
      state: {
        serviceType: `${category} - ${subService}`,
        providerDetails: provider,
        category: category,
        subService: subService
      }
    });
  }, [navigate, providers, category, subService]);

  const handleAddToFavorites = useCallback((providerId, providerName, providerImage) => {
    const favorites = JSON.parse(localStorage.getItem('clientFavorites') || '[]');
    const favorite = {
      providerId,
      providerName,
      providerImage,
      category,
      subService,
      addedAt: new Date().toISOString(),
      rating: providers.find(p => p.id === providerId)?.rating
    };
    
    const existingIndex = favorites.findIndex(fav => fav.providerId === providerId);
    
    if (existingIndex === -1) {
      favorites.push(favorite);
      setFavoriteProviders(prev => new Set([...prev, providerId]));
      // Show toast notification
      showNotification(`✅ ${providerName} added to favorites!`, 'success');
    } else {
      favorites.splice(existingIndex, 1);
      setFavoriteProviders(prev => {
        const newSet = new Set(prev);
        newSet.delete(providerId);
        return newSet;
      });
      showNotification(`❌ ${providerName} removed from favorites!`, 'info');
    }
    
    localStorage.setItem('clientFavorites', JSON.stringify(favorites));
  }, [category, subService, providers]);

  const handleCompareToggle = useCallback((providerId) => {
    setSelectedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(providerId)) {
        newSet.delete(providerId);
      } else {
        if (newSet.size < 4) { // Limit comparison to 4 providers
          newSet.add(providerId);
        } else {
          showNotification('❌ Maximum 4 providers can be compared!', 'warning');
        }
      }
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback((action) => {
    switch (action) {
      case 'addToFavorites':
        selectedProviders.forEach(providerId => {
          const provider = providers.find(p => p.id === providerId);
          if (provider) {
            handleAddToFavorites(providerId, provider.name, provider.image);
          }
        });
        showNotification(`✅ ${selectedProviders.size} providers added to favorites!`, 'success');
        setSelectedProviders(new Set());
        break;
      case 'contact':
        // Implement bulk contact
        showNotification(`📧 Contacting ${selectedProviders.size} providers...`, 'info');
        break;
      default:
        break;
    }
  }, [selectedProviders, providers, handleAddToFavorites]);

  const handleShareProvider = useCallback(async (provider) => {
    const shareData = {
      title: `${provider.name} - ${subService} Services`,
      text: `Check out ${provider.name} for ${subService} services in ${category}. Rating: ${provider.rating} ⭐`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        showNotification('🔗 Link copied to clipboard!', 'success');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  }, [category, subService]);

  // Notification system
  const showNotification = useCallback((message, type = 'info') => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      minRating: 0,
      priceRange: 'all',
      location: '',
      experience: 'all',
      availability: 'all',
      providerType: 'all'
    });
    setSearchQuery('');
    setSelectedProviders(new Set());
  }, []);

  if (loading) {
    return (
      <div className="service-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Finding the best providers for you...</p>
          <div className="loading-details">
            <span>Searching in {category} • {subService}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && providers.length === 0) {
    return (
      <div className="service-list-container">
        <div className="error-state">
          <h2>😔 Unable to Load Providers</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-btn">
              🔄 Try Again
            </button>
            <button onClick={() => navigate('/categories')} className="back-btn">
              ← Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-list-container">
      {/* Header Section */}
      <div className="service-list-header">
        <div className="header-top">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back to Categories
          </button>
          <div className="header-actions">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="view-toggle-btn"
            >
              {viewMode === 'grid' ? '📋 List' : '🔲 Grid'}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle-btn"
            >
              🎛️ {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {selectedProviders.size > 0 && (
              <button 
                onClick={() => setBulkActions(!bulkActions)}
                className="bulk-actions-btn"
              >
                ⚡ Bulk Actions ({selectedProviders.size})
              </button>
            )}
          </div>
        </div>

        <div className="header-main">
          <h1>
            {subService} Services in {category}
          </h1>
          <p className="subtitle">
            Choose from {filteredAndSortedProviders.length} trusted service providers
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search providers, skills, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button 
              onClick={() => setQuickCompare(!quickCompare)}
              className={`compare-btn ${quickCompare ? 'active' : ''}`}
            >
              ⚖️ Compare
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {bulkActions && selectedProviders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bulk-actions-panel"
          >
            <div className="bulk-actions-content">
              <h4>Bulk Actions ({selectedProviders.size} selected)</h4>
              <div className="bulk-buttons">
                <button onClick={() => handleBulkAction('addToFavorites')} className="bulk-btn favorite">
                  ❤️ Add to Favorites
                </button>
                <button onClick={() => handleBulkAction('contact')} className="bulk-btn contact">
                  📧 Contact Selected
                </button>
                <button onClick={() => setSelectedProviders(new Set())} className="bulk-btn clear">
                  ❌ Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="advanced-filters"
          >
            <div className="filters-grid">
              <div className="filter-group">
                <label>⭐ Minimum Rating</label>
                <select 
                  value={filters.minRating} 
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="filter-select"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={5}>5 Stars Only</option>
                </select>
              </div>

              <div className="filter-group">
                <label>💰 Price Range</label>
                <select 
                  value={filters.priceRange} 
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (₹500 - ₹2000)</option>
                  <option value="medium">Medium (₹2000 - ₹5000)</option>
                  <option value="premium">Premium (₹5000+)</option>
                </select>
              </div>

              <div className="filter-group">
                <label>📍 Location</label>
                <input
                  type="text"
                  placeholder="Enter city or area..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="location-input"
                />
              </div>

              <div className="filter-group">
                <label>⏱️ Experience</label>
                <select 
                  value={filters.experience} 
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">Any Experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div className="filter-group">
                <label>🏷️ Provider Type</label>
                <select 
                  value={filters.providerType} 
                  onChange={(e) => setFilters(prev => ({ ...prev, providerType: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="verified">✅ Verified</option>
                  <option value="professional">⭐ Professional</option>
                </select>
              </div>

              <div className="filter-group">
                <label>📅 Availability</label>
                <select 
                  value={filters.availability} 
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">Any Availability</option>
                  <option value="available">Available Now</option>
                  <option value="weekend">Weekend Only</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={handleResetFilters} className="reset-filters-btn">
                🔄 Reset Filters
              </button>
              <div className="active-filters-count">
                {Object.values(filters).filter(val => val !== 'all' && val !== '' && val !== 0).length} filters active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-info">
          <span className="results-count">
            {filteredAndSortedProviders.length} {filteredAndSortedProviders.length === 1 ? 'provider' : 'providers'} found
          </span>
          {selectedProviders.size > 0 && (
            <span className="selected-count">
              • {selectedProviders.size} selected
            </span>
          )}
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
            <option value="name">Alphabetical</option>
          </select>

          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>
        </div>
      </div>

      {/* Quick Compare Bar */}
      <AnimatePresence>
        {quickCompare && selectedProviders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="compare-bar"
          >
            <div className="compare-bar-content">
              <h4>⚖️ Compare Providers ({selectedProviders.size}/4)</h4>
              <div className="compare-actions">
                <button className="compare-view-btn">
                  📊 View Comparison
                </button>
                <button 
                  onClick={() => setSelectedProviders(new Set())}
                  className="compare-clear-btn"
                >
                  ❌ Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Providers Grid/List */}
      <div className={`providers-container ${viewMode}`}>
        {paginatedProviders.length > 0 ? (
          paginatedProviders.map((provider, index) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={index}
              viewMode={viewMode}
              isSelected={selectedProviders.has(provider.id)}
              isFavorite={favoriteProviders.has(provider.id)}
              onSelect={handleCompareToggle}
              onFavorite={handleAddToFavorites}
              onQuickBook={handleQuickBook}
              onShare={handleShareProvider}
              compareMode={quickCompare}
            />
          ))
        ) : (
          <div className="no-providers">
            <div className="no-providers-content">
              <h3>🔍 No providers found</h3>
              <p>We couldn't find any providers matching your criteria.</p>
              <button onClick={handleResetFilters} className="clear-filters-btn">
                🗑️ Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="stats-footer">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{providers.length}</span>
            <span className="stat-label">Total Providers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {providers.reduce((max, p) => Math.max(max, p.rating), 0).toFixed(1)}
            </span>
            <span className="stat-label">Highest Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round(providers.reduce((sum, p) => sum + p.rating, 0) / providers.length) || 0}
            </span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {new Set(providers.map(p => p.location)).size}
            </span>
            <span className="stat-label">Cities Covered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Provider Card Component
const ProviderCard = React.memo(({ 
  provider, 
  index, 
  viewMode, 
  isSelected, 
  isFavorite, 
  onSelect, 
  onFavorite, 
  onQuickBook, 
  onShare,
  compareMode 
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/provider/${provider.id}`, {
      state: { providerData: provider }
    });
  };

  const handleQuickChat = () => {
    navigate(`/client/chat/${provider.id}`, {
      state: {
        providerName: provider.name,
        providerImage: provider.image
      }
    });
  };

  return (
    <motion.div
      className={`provider-card ${viewMode} ${isSelected ? 'selected' : ''} ${compareMode ? 'compare-mode' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Selection Checkbox for Compare Mode */}
      {compareMode && (
        <div className="selection-overlay">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(provider.id)}
            className="provider-checkbox"
          />
        </div>
      )}

      {/* Provider Image Section */}
      <div className="provider-image-section">
        <div className="image-container">
          <img 
            src={provider.image} 
            alt={provider.name}
            className="provider-image"
            onError={(e) => {
              e.target.src = "/assets/default-profile.png";
            }}
          />
          
          {/* Badges */}
          <div className="badges-container">
            <div className="rating-badge">
              ⭐ {provider.rating}
            </div>
            {provider.providerType === 'verified' && (
              <div className="verified-badge">
                ✅ Verified
              </div>
            )}
            <div className="reviews-badge">
              📝 {provider.reviews}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              onClick={() => onFavorite(provider.id, provider.name, provider.image)}
              className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            <button
              onClick={() => onShare(provider)}
              className="share-btn"
              title="Share provider"
            >
              📤
            </button>
          </div>
        </div>
      </div>

      {/* Provider Info Section */}
      <div className="provider-info">
        <div className="provider-header">
          <h3 className="provider-name">{provider.name}</h3>
          <span className="provider-type">{provider.providerType}</span>
        </div>

        <div className="provider-meta">
          <span className="provider-location">📍 {provider.location}</span>
          <span className="provider-experience">⏱️ {provider.experience}</span>
        </div>

        <p className="provider-description">
          {provider.description}
        </p>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-value">{provider.rating}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat">
            <span className="stat-value">{provider.reviews}</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat">
            <span className="stat-value">{provider.stats?.completedProjects || 0}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <span className="stat-value">{provider.responseRate}</span>
            <span className="stat-label">Response</span>
          </div>
        </div>

        {/* Price and Availability */}
        <div className="price-availability">
          <div className="price-range">{provider.priceRange}</div>
          <div className={`availability ${provider.availability.toLowerCase()}`}>
            {provider.availability}
          </div>
        </div>

        {/* Skills/Tags */}
        <div className="skills-section">
          <strong>Services:</strong>
          <div className="skills-tags">
            {provider.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
            {provider.skills.length > 3 && (
              <span className="skill-tag more">+{provider.skills.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Products Preview */}
        {provider.products && provider.products.length > 0 && (
          <div className="products-preview">
            <strong>Products:</strong>
            <div className="products-list">
              {provider.products.slice(0, 2).map(product => (
                <div key={product.id} className="product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">₹{product.price}</span>
                </div>
              ))}
              {provider.products.length > 2 && (
                <div className="product-more">
                  +{provider.products.length - 2} more products
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="provider-actions">
          <button 
            onClick={() => onQuickBook(provider.id)}
            className="book-btn primary"
          >
            📅 Quick Book
          </button>
          <button 
            onClick={handleQuickChat}
            className="chat-btn secondary"
          >
            💬 Chat
          </button>
          <button 
            onClick={handleViewProfile}
            className="profile-btn"
          >
            👁️ Profile
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-item">
            <span className="info-label">Languages:</span>
            <span className="info-value">{provider.languages?.join(', ') || 'English, Hindi'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Certification:</span>
            <span className="info-value">{provider.certification}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ServiceList;