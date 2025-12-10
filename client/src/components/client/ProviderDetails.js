import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ProviderDetails.css";

// Import data from JSON files
import providersData from "../../data/providers.json";
import productsData from "../../data/products.json";
import servicesData from "../../data/services.json";

const ProviderDetails = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching provider details for:', providerId);
        
        // Get provider data from localStorage (stored by ServiceProvidersList)
        const allProvidersData = JSON.parse(localStorage.getItem('allProvidersData') || '{}');
        console.log('📊 Available providers:', Object.keys(allProvidersData));
        
        let providerData = allProvidersData[providerId];

        // If not found, try to find in providers.json
        if (!providerData) {
          console.log('🔄 Searching in providers.json...');
          providerData = findProviderInJson(providerId);
        }

        // If still not found, try alternative ID formats in localStorage
        if (!providerData) {
          console.log('❌ Provider not found with exact ID, searching alternatives...');
          const alternativeId = Object.keys(allProvidersData).find(key => 
            key.includes(providerId) || providerId.includes(key)
          );
          
          if (alternativeId) {
            console.log('🔄 Found alternative ID:', alternativeId);
            providerData = allProvidersData[alternativeId];
          } else {
            console.log('🛠️ Generating fallback provider data');
            providerData = generateProviderFromId(providerId);
            
            // Store the generated provider for future use
            allProvidersData[providerId] = providerData;
            localStorage.setItem('allProvidersData', JSON.stringify(allProvidersData));
          }
        }

        setProvider(providerData);
        console.log('✅ Provider data loaded:', providerData);

        // Load reviews from localStorage
        const storedReviews = JSON.parse(localStorage.getItem(`reviews_${providerId}`)) || [];
        setReviews(storedReviews);

      } catch (error) {
        console.error("❌ Error fetching provider details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      fetchProviderDetails();
    }
  }, [providerId]);

  // Find provider in JSON data
  const findProviderInJson = (providerId) => {
    let foundProvider = null;
    
    // Search in providers.json
    if (providersData) {
      if (Array.isArray(providersData)) {
        foundProvider = providersData.find(p => p.id.toString() === providerId);
      } else if (providersData.providers && Array.isArray(providersData.providers)) {
        foundProvider = providersData.providers.find(p => p.id.toString() === providerId);
      }
    }

    if (foundProvider) {
      console.log('✅ Found provider in JSON:', foundProvider);
      return enhanceProviderData(foundProvider);
    }

    return null;
  };

  // Enhance provider data with additional fields
  const enhanceProviderData = (provider) => {
    const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
    const experiences = ["1+ years", "2+ years", "3+ years", "5+ years", "8+ years", "10+ years"];
    const priceRanges = {
      low: "₹500 - ₹2000",
      medium: "₹1000 - ₹5000", 
      high: "₹2000 - ₹10000"
    };

    // Determine price range based on service type
    let priceRange = priceRanges.medium;
    const serviceName = provider.service || provider.category || "";
    
    if (["bridal_makeup", "wedding_gifts", "art_paintings", "corporate_event_decor", "party_wear_outfits"].some(id => 
      serviceName.toLowerCase().includes(id))) {
      priceRange = priceRanges.high;
    } else if (["quick_snacks", "south_indian_meals", "north_indian_meals", "diwali_festival_kit"].some(id => 
      serviceName.toLowerCase().includes(id))) {
      priceRange = priceRanges.low;
    }

    return {
      id: provider.id.toString(),
      name: provider.name,
      description: provider.description || `Passionate ${serviceName.toLowerCase()} expert with excellent customer satisfaction.`,
      image: provider.image || provider.imagePath || "/assets/default-profile.png",
      rating: provider.rating || (4.0 + Math.random() * 1).toFixed(1),
      reviews: provider.reviews || Math.floor(Math.random() * 100) + 20,
      location: provider.location || cities[Math.floor(Math.random() * cities.length)],
      experience: provider.experience || experiences[Math.floor(Math.random() * experiences.length)],
      priceRange: provider.priceRange || priceRange,
      services: provider.services || [serviceName, "Custom Designs", "Premium Quality Work"],
      portfolio: provider.portfolio || generatePortfolio(serviceName),
      products: provider.products || getProductsForProvider(provider.id, serviceName),
      phone: provider.phone || `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
      email: provider.email || `${provider.name.toLowerCase().replace(' ', '.')}@sheworks.com`,
      bio: provider.bio || `I am a passionate and dedicated ${serviceName.toLowerCase()} specialist with years of experience. I take pride in delivering high-quality work and ensuring complete customer satisfaction.`,
      providerType: provider.providerType || (Math.random() > 0.3 ? 'verified' : 'professional'),
      responseRate: provider.responseRate || "95%",
      completionRate: provider.completionRate || "98%", 
      onTimeDelivery: provider.onTimeDelivery || "96%",
      customerSatisfaction: provider.customerSatisfaction || `${(4.0 + Math.random() * 1).toFixed(1)}/5`,
      category: provider.category || serviceName
    };
  };

  // Get products for provider from products.json
  const getProductsForProvider = (providerId, serviceName) => {
    let products = [];
    
    // Search in products.json
    if (productsData) {
      if (Array.isArray(productsData)) {
        products = productsData.filter(product => 
          product.providerId === providerId || 
          product.category?.toLowerCase().includes(serviceName.toLowerCase())
        );
      } else if (productsData.products && Array.isArray(productsData.products)) {
        products = productsData.products.filter(product => 
          product.providerId === providerId || 
          product.category?.toLowerCase().includes(serviceName.toLowerCase())
        );
      }
    }

    // If no products found, generate some
    if (products.length === 0) {
      products = generateProducts(providerId, serviceName);
    }

    return products.slice(0, 10); // Limit to 10 products
  };

  // Generate provider data from ID pattern (fallback)
  const generateProviderFromId = (providerId) => {
    console.log('🎨 Generating provider from ID:', providerId);
    
    const parts = providerId.split('_');
    const serviceType = parts[0];
    const providerIndex = parts[2] || '0';
    
    const indianWomenNames = [
      "Priya Sharma", "Ananya Patel", "Divya Reddy", "Sneha Kumar", "Riya Gupta",
      "Neha Singh", "Pooja Mehta", "Kavya Joshi", "Shreya Malhotra", "Aditi Choudhury",
      "Nandini Iyer", "Madhuri Desai", "Sunita Nair", "Lakshmi Menon", "Sarika Pillai"
    ];
    
    const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
    const serviceNames = {
      hand: "Hand Embroidery",
      machine: "Machine Embroidery", 
      pearl: "Pearl Embroidery",
      beads: "Beads Embroidery",
      "south": "South Indian Meals",
      "north": "North Indian Meals",
      "quick": "Quick Snacks",
      "handmade": "Handmade Gifts",
      "birthday": "Birthday Gifts",
      "wedding": "Wedding Gifts",
      "anniversary": "Anniversary Gifts",
      "art": "Art Paintings",
      "paper": "Paper Crafting",
      "clay": "Clay Modelling",
      "collage": "Collage Making",
      "ladies": "Ladies Wear Fashion",
      "mens": "Mens Wear Fashion",
      "kids": "Kids Wear Fashion",
      "ethnic": "Ethnic Wear",
      "party": "Party Wear Outfits",
      "bridal": "Bridal Makeup",
      "skin": "Skin Care Routine",
      "hair": "Hair Care Products",
      "manicure": "Manicure & Pedicure",
      "full": "Full Body Massage",
      "cake": "Cake Artistry",
      "cupcake": "Cupcake & Muffin Creations",
      "cookies": "Cookies & Biscuits",
      "bread": "Bread & Pastry Delight"
    };

    const serviceName = serviceNames[serviceType] || `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Services`;
    const name = indianWomenNames[parseInt(providerIndex) % indianWomenNames.length] || "Service Provider";

    return {
      id: providerId,
      name: name,
      image: `/assets/ServiceProviderImages/${serviceType}_embroidery.jpg`.replace('_embroidery', ''),
      description: `Professional ${serviceName.toLowerCase()} expert with excellent customer satisfaction and quality work.`,
      rating: (4.0 + Math.random() * 1).toFixed(1),
      reviews: Math.floor(Math.random() * 100) + 20,
      location: cities[Math.floor(Math.random() * cities.length)],
      experience: ['2+ years', '3+ years', '5+ years', '8+ years', '10+ years'][Math.floor(Math.random() * 5)],
      priceRange: ['₹500 - ₹2000', '₹1000 - ₹5000', '₹2000 - ₹10000'][Math.floor(Math.random() * 3)],
      phone: `+91 ${Math.floor(9000000000 + Math.random() * 1000000000)}`,
      email: `${name.toLowerCase().replace(' ', '.')}@sheworks.com`,
      services: [serviceName, "Custom Designs", "Premium Quality Work", "Fast Delivery"],
      portfolio: generatePortfolio(serviceType),
      products: getProductsForProvider(providerId, serviceName),
      bio: `I am a passionate and dedicated ${serviceName.toLowerCase()} specialist with years of experience. I take pride in delivering high-quality work and ensuring complete customer satisfaction. My goal is to bring your vision to life with creativity and precision.`,
      providerType: Math.random() > 0.3 ? 'verified' : 'professional',
      responseRate: "95%",
      completionRate: "98%", 
      onTimeDelivery: "96%",
      customerSatisfaction: `${(4.0 + Math.random() * 1).toFixed(1)}/5`
    };
  };

  // Generate portfolio items
  const generatePortfolio = (serviceType) => {
    return Array.from({ length: 6 }, (_, index) => ({
      image: `/assets/ServiceProviderImages/portfolio_${serviceType}_${index + 1}.jpg`,
      title: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Work ${index + 1}`,
      description: `Beautiful ${serviceType} work showcasing quality and craftsmanship.`,
      price: `₹${(800 + index * 400)}`
    }));
  };

  // Generate products with realistic data
  const generateProducts = (providerId, serviceName) => {
    const productTemplates = {
      'embroidery': [
        { name: "Custom Embroidery Design", basePrice: 1200 },
        { name: "Personalized Monogram Service", basePrice: 800 },
        { name: "Traditional Motif Embroidery", basePrice: 1500 },
        { name: "Modern Abstract Embroidery", basePrice: 1300 },
        { name: "Bridal Embroidery Package", basePrice: 5000 },
        { name: "Kids Clothing Embroidery", basePrice: 600 },
        { name: "Home Decor Embroidery", basePrice: 1800 },
        { name: "Accessories Embroidery", basePrice: 900 },
        { name: "Corporate Logo Embroidery", basePrice: 2000 },
        { name: "Special Occasion Embroidery", basePrice: 2500 }
      ],
      'food': [
        { name: "Traditional Meal Package", basePrice: 300 },
        { name: "Special Diet Meal Plan", basePrice: 500 },
        { name: "Festival Special Menu", basePrice: 800 },
        { name: "Healthy Snacks Pack", basePrice: 200 },
        { name: "Custom Thali Service", basePrice: 400 },
        { name: "Party Catering Package", basePrice: 1500 },
        { name: "Dietary Specific Meals", basePrice: 350 },
        { name: "Traditional Sweets Box", basePrice: 600 },
        { name: "Ready-to-Cook Kit", basePrice: 250 },
        { name: "Special Occasion Feast", basePrice: 1200 }
      ],
      'default': [
        { name: "Basic Service Package", basePrice: 1000 },
        { name: "Premium Service Package", basePrice: 2500 },
        { name: "Custom Design Service", basePrice: 1500 },
        { name: "Express Delivery Service", basePrice: 1800 },
        { name: "Standard Service Package", basePrice: 1200 },
        { name: "Luxury Service Package", basePrice: 3500 },
        { name: "Budget Friendly Package", basePrice: 600 },
        { name: "Professional Service", basePrice: 2000 },
        { name: "Quick Service Option", basePrice: 800 },
        { name: "Comprehensive Service", basePrice: 2800 }
      ]
    };

    let template = productTemplates.default;
    if (serviceName.toLowerCase().includes('embroidery')) template = productTemplates.embroidery;
    if (serviceName.toLowerCase().includes('meal') || serviceName.toLowerCase().includes('food')) template = productTemplates.food;

    return template.map((product, index) => ({
      id: `prod_${providerId}_${index}`,
      name: product.name,
      price: Math.floor(product.basePrice * (0.8 + Math.random() * 0.4)),
      description: `High-quality ${serviceName.toLowerCase()} service with excellent results and customer satisfaction.`,
      image: `/assets/ServiceProviderImages/Serviceproviderproductimages/product_${index + 1}.jpg`,
      rating: (Math.random() * 1 + 4).toFixed(1),
      reviews: Math.floor(Math.random() * 50),
      inStock: Math.random() > 0.1,
      type: product.basePrice > 2000 ? 'service' : 'product'
    }));
  };

  const handleBookService = () => {
    navigate(`/booking/${providerId}`, {
      state: { providerDetails: provider }
    });
  };

  const handleChat = () => {
    navigate(`/client/chat/${providerId}`, {
      state: { 
        providerName: provider?.name,
        providerImage: provider?.image 
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuickBuy = (product) => {
    if (product.type === 'service') {
      navigate(`/booking/${providerId}`, {
        state: {
          product,
          provider: provider
        }
      });
    } else {
      navigate(`/client/quick-buy/${providerId}/${product.id}`, {
        state: {
          product,
          provider: provider
        }
      });
    }
  };

  const handleAddToCart = (product) => {
    if (product.type === 'service') {
      navigate(`/booking/${providerId}`, {
        state: {
          product,
          provider: provider
        }
      });
      return;
    }

    const cart = JSON.parse(localStorage.getItem('clientCart') || '[]');
    const cartItem = {
      ...product,
      providerId,
      providerName: provider?.name,
      quantity: 1
    };
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push(cartItem);
    }
    
    localStorage.setItem('clientCart', JSON.stringify(cart));
    alert(`🛒 ${product.name} added to cart!`);
  };

  const handleAddToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('clientFavorites') || '[]');
    const favorite = {
      providerId,
      providerName: provider?.name,
      providerImage: provider?.image,
      category: provider?.category || providerId.split('_')[0],
      rating: provider?.rating,
      location: provider?.location,
      addedAt: new Date().toISOString()
    };
    
    const existingIndex = favorites.findIndex(fav => fav.providerId === providerId);
    if (existingIndex === -1) {
      favorites.push(favorite);
      localStorage.setItem('clientFavorites', JSON.stringify(favorites));
      alert('✅ Added to favorites!');
    } else {
      alert('⚠️ Already in favorites!');
    }
  };

  // Debug function
  const debugData = () => {
    console.log('🔍 Provider Details Debug:', {
      providerId,
      provider,
      allProvidersData: JSON.parse(localStorage.getItem('allProvidersData') || '{}'),
      reviews,
      providersData,
      productsData
    });
  };

  if (loading) {
    return (
      <div className="provider-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading provider details...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-error">
        <div className="error-content">
          <h2>Provider Not Found</h2>
          <p>The service provider you're looking for is not available.</p>
          <button
            onClick={handleBack}
            className="back-button"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-details-container">
      {/* Debug button */}
      <button 
        onClick={debugData}
        className="debug-button"
      >
        🐛 Debug
      </button>

      {/* Header */}
      <div className="provider-header">
        <div className="header-container">
          <button
            onClick={handleBack}
            className="back-button"
          >
            ← Back
          </button>
          
          <div className="provider-header-content">
            <div className="provider-image-section">
              <img
                src={provider.image}
                alt={provider.name}
                className="provider-avatar"
                onError={(e) => {
                  e.target.src = "/assets/default-profile.png";
                }}
              />
              <div className="provider-badge">
                {provider.providerType === 'verified' ? '✅ Verified' : '⭐ Professional'}
              </div>
            </div>
            
            <div className="provider-info">
              <div className="info-main">
                <h1 className="provider-name">
                  {provider.name}
                </h1>
                
                <div className="provider-stats">
                  <div className="stat-item rating">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{provider.rating}</span>
                    <span className="stat-detail">({provider.reviews} reviews)</span>
                  </div>
                  
                  <div className="stat-item location">
                    <span className="stat-icon">📍</span>
                    <span className="stat-value">{provider.location}</span>
                  </div>
                  
                  <div className="stat-item experience">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{provider.experience}</span>
                  </div>

                  <div className="stat-item price">
                    <span className="stat-icon">💰</span>
                    <span className="stat-value">{provider.priceRange}</span>
                  </div>
                </div>
                
                <p className="provider-description">
                  {provider.description}
                </p>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleBookService}
                  className="book-service-btn"
                >
                  📅 Book Service
                </button>
                <button
                  onClick={handleChat}
                  className="chat-btn"
                >
                  💬 Chat Now
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className="favorite-btn"
                >
                  ❤️ Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="provider-content">
        <div className="content-layout">
          {/* Main Content */}
          <div className="main-content">
            {/* Tabs */}
            <div className="tabs-container">
              <div className="tabs-header">
                <nav className="tabs-navigation">
                  {[
                    { id: 'services', label: 'Services', icon: '🛠️' },
                    { id: 'products', label: 'Products', icon: '🛍️', count: provider.products?.length || 0 },
                    { id: 'portfolio', label: 'Portfolio', icon: '🖼️' },
                    { id: 'reviews', label: 'Reviews', icon: '⭐', count: reviews.length },
                    { id: 'about', label: 'About', icon: 'ℹ️' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="tab-count">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="tab-content">
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <ServicesTab 
                    services={provider.services} 
                    priceRange={provider.priceRange}
                    onBookService={handleBookService}
                  />
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <ProductsTab 
                    products={provider.products || []} 
                    onQuickBuy={handleQuickBuy}
                    onAddToCart={handleAddToCart}
                  />
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <PortfolioTab portfolio={provider.portfolio || []} />
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <ReviewsTab 
                    reviews={reviews}
                    averageRating={provider.rating}
                    reviewsCount={provider.reviews}
                    providerId={providerId}
                  />
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <AboutTab provider={provider} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <ContactCard 
              provider={provider}
              onChat={handleChat}
              onBookService={handleBookService}
            />
            
            <StatsCard provider={provider} />
            
            {provider.products && provider.products.length > 0 && (
              <ProductsPreview 
                products={provider.products}
                onViewAll={() => setActiveTab('products')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components (keep the same as before)
const ServicesTab = ({ services, priceRange, onBookService }) => (
  <div className="services-tab">
    <h3 className="tab-title">Services Offered</h3>
    <div className="services-grid">
      {services.map((service, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="service-card"
        >
          <h4 className="service-name">{service}</h4>
          <p className="service-description">Customized service available</p>
          <div className="service-footer">
            <span className="service-price">{priceRange}</span>
            <button 
              onClick={onBookService}
              className="book-now-btn"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const ProductsTab = ({ products, onQuickBuy, onAddToCart }) => {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛍️</div>
        <h3 className="empty-title">No Products Available</h3>
        <p className="empty-description">This provider hasn't listed any products yet.</p>
      </div>
    );
  }

  return (
    <div className="products-tab">
      <h3 className="tab-title">Available Products</h3>
      <div className="products-grid">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="product-card"
          >
            <div className="product-image-container">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = "/assets/default-product.jpg";
                }}
              />
              <div className="product-rating">
                ⭐ {product.rating}
              </div>
              {!product.inStock && (
                <div className="out-of-stock-overlay">
                  <span className="out-of-stock-label">
                    Out of Stock
                  </span>
                </div>
              )}
              {product.type === 'service' && (
                <div className="service-badge">
                  Service
                </div>
              )}
            </div>
            <div className="product-info">
              <h4 className="product-name">{product.name}</h4>
              <p className="product-description">{product.description}</p>
              <div className="product-meta">
                <span className="product-price">₹{product.price}</span>
                <span className="product-reviews">{product.reviews} reviews</span>
              </div>
              <div className="product-actions">
                <button
                  onClick={() => onQuickBuy(product)}
                  disabled={!product.inStock}
                  className={`buy-btn ${!product.inStock ? 'disabled' : ''}`}
                >
                  {product.type === 'service' ? 'Book Now' : product.inStock ? 'Buy Now' : 'Out of Stock'}
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.inStock || product.type === 'service'}
                  className={`cart-btn ${(!product.inStock || product.type === 'service') ? 'disabled' : ''}`}
                >
                  {product.type === 'service' ? '📅' : product.inStock ? '🛒' : '❌'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PortfolioTab = ({ portfolio }) => {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🖼️</div>
        <h3 className="empty-title">No Portfolio Items</h3>
        <p className="empty-description">This provider hasn't added any portfolio items yet.</p>
      </div>
    );
  }

  return (
    <div className="portfolio-tab">
      <h3 className="tab-title">Portfolio</h3>
      <div className="portfolio-grid">
        {portfolio.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="portfolio-item"
          >
            <div className="portfolio-image-container">
              <img
                src={item.image}
                alt={item.title}
                className="portfolio-image"
                onError={(e) => {
                  e.target.src = "/assets/default-work.jpg";
                }}
              />
            </div>
            <div className="portfolio-info">
              <h4 className="portfolio-title">{item.title}</h4>
              <p className="portfolio-price">{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ReviewsTab = ({ reviews, averageRating, reviewsCount, providerId }) => (
  <div className="reviews-tab">
    <h3 className="tab-title">Customer Reviews</h3>
    {reviews.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">⭐</div>
        <h3 className="empty-title">No Reviews Yet</h3>
        <p className="empty-description">Be the first to review this provider!</p>
      </div>
    ) : (
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="review-card"
          >
            <div className="review-header">
              <div className="reviewer-avatar">
                {review.name?.charAt(0) || 'A'}
              </div>
              <div className="reviewer-info">
                <h4 className="reviewer-name">{review.name || 'Anonymous'}</h4>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
            <p className="review-date">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

const AboutTab = ({ provider }) => (
  <div className="about-tab">
    <h3 className="tab-title">About {provider.name}</h3>
    <div className="about-content">
      <p className="provider-bio">
        {provider.bio || "No bio provided yet."}
      </p>
      
      <div className="about-grid">
        <InfoCard icon="📍" label="Location" value={provider.location} />
        <InfoCard icon="⏱️" label="Experience" value={provider.experience} />
        <InfoCard icon="💰" label="Price Range" value={provider.priceRange} />
        <InfoCard icon="⭐" label="Rating" value={`${provider.rating} (${provider.reviews} reviews)`} />
      </div>
    </div>
  </div>
);

// Sidebar Components (keep the same as before)
const ContactCard = ({ provider, onChat, onBookService }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="sidebar-card contact-card"
  >
    <h3 className="card-title">Contact Information</h3>
    <div className="contact-info">
      <div className="contact-item">
        <span className="contact-icon">📞</span>
        <span className="contact-value">{provider.phone}</span>
      </div>
      <div className="contact-item">
        <span className="contact-icon">📧</span>
        <span className="contact-value">{provider.email}</span>
      </div>
      <div className="contact-item">
        <span className="contact-icon">📍</span>
        <span className="contact-value">{provider.location}</span>
      </div>
    </div>
    <div className="contact-actions">
      <button onClick={onChat} className="chat-action-btn">
        💬 Send Message
      </button>
      <button onClick={onBookService} className="book-action-btn">
        📅 Book Service
      </button>
    </div>
  </motion.div>
);

const StatsCard = ({ provider }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="sidebar-card stats-card"
  >
    <h3 className="card-title">Provider Stats</h3>
    <div className="stats-list">
      <StatItem label="Response Rate" value={provider.responseRate || "95%"} />
      <StatItem label="Completion Rate" value={provider.completionRate || "98%"} />
      <StatItem label="On Time Delivery" value={provider.onTimeDelivery || "96%"} />
      <StatItem label="Customer Satisfaction" value={provider.customerSatisfaction || `${provider.rating}/5`} />
    </div>
  </motion.div>
);

const StatItem = ({ label, value }) => (
  <div className="stat-item">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

const ProductsPreview = ({ products, onViewAll }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="sidebar-card products-preview"
  >
    <h3 className="card-title">Popular Products</h3>
    <div className="preview-list">
      {products.slice(0, 3).map((product, index) => (
        <div key={index} className="preview-item">
          <img 
            src={product.image} 
            alt={product.name}
            className="preview-image"
          />
          <div className="preview-info">
            <p className="preview-name">{product.name}</p>
            <p className="preview-price">₹{product.price}</p>
          </div>
        </div>
      ))}
    </div>
    <button onClick={onViewAll} className="view-all-btn">
      View All Products →
    </button>
  </motion.div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="info-card">
    <div className="info-content">
      <span className="info-icon">{icon}</span>
      <div className="info-details">
        <p className="info-label">{label}</p>
        <p className="info-value">{value}</p>
      </div>
    </div>
  </div>
);

export default ProviderDetails;