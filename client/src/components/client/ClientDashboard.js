import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ClientDashboard.css';

const services = [
  {
    id: 1,
    category: 'Embroidery',
    title: 'Embroidery',
    description: 'Elegant handcrafted embroidery with unique designs.',
    image: '/assets/ServiceImages/Embriodrey.jpeg',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🪡'
  },
  {
    id: 2,
    category: 'Home Cooked Food',
    title: 'Home Cooked Food',
    description: 'Fresh, hygienic, and delicious homemade meals.',
    image: '/assets/ServiceImages/Foods.jpeg',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🍛'
  },
  {
    id: 3,
    category: 'Custom Gifts',
    title: 'Custom Gifts',
    description: 'Personalized gifts crafted with love for every occasion.',
    image: '/assets/ServiceImages/Gifts.jpeg',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '🎁'
  },
  {
    id: 4,
    category: 'Arts & Crafts',
    title: 'Arts & Crafts',
    description: 'Creative handmade décor and craft items.',
    image: '/assets/ServiceImages/arts&crafts.jpeg',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: '🎨'
  },
  {
    id: 5,
    category: 'Fashion & Tailoring',
    title: 'Fashion & Tailoring',
    description: 'Stylish custom stitching and alterations.',
    image: '/assets/ServiceImages/Tailoring.jpeg',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: '👗'
  },
  {
    id: 6,
    category: 'Beauty & Wellness',
    title: 'Beauty & Wellness',
    description: 'Professional beauty care and wellness services at home.',
    image: '/assets/ServiceImages/Beuty&wellness.jpeg',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: '💄'
  },
  {
    id: 7,
    category: 'Sugar Bloom',
    title: 'Sugar Bloom',
    description: 'Delicious homemade baked goods and confectionery.',
    image: '/assets/ServiceImages/sugar-bloom.png',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    icon: '🍰'
  },
  {
    id: 8,
    category: 'Event Decoration',
    title: 'Event Decoration',
    description: 'Beautiful and budget-friendly event decorations.',
    image: '/assets/ServiceImages/Event.jpeg',
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    icon: '🎉'
  },
  {
    id: 9,
    category: 'Home Gardening Kits',
    title: 'Home Gardening Kits',
    description: 'Expert care and setup for your home garden.',
    image: '/assets/ServiceImages/Gardening.jpeg',
    color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    icon: '🌱'
  },
  {
    id: 10,
    category: 'Traditional Festival Kits',
    title: 'Traditional Festival Kits',
    description: 'Ready-made kits for rituals and festive needs.',
    image: '/assets/ServiceImages/Festive.jpeg',
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    icon: '🪔'
  },
];

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState(services);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filtered = services.filter(service =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="client-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Services
        </motion.h1>
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              className="service-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: item * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="client-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header and Search section completely removed */}

      <motion.div 
        className="service-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                className="service-card"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                <Link 
                  to={`/services/${service.category}`} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="service-image-container">
                    <motion.img 
                      src={service.image} 
                      alt={service.title}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div 
                      className="service-overlay"
                      style={{ background: service.color }}
                    >
                      <div className="service-icon">{service.icon}</div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <motion.button 
                        className="explore-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Explore Now
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="service-content">
                    <h2>{service.title}</h2>
                    <p>{service.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="no-results"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="no-results-icon">🔍</div>
              <h3>No services found</h3>
              <p>Try adjusting your search terms</p>
              <motion.button
                onClick={() => setSearchTerm('')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="clear-search-btn"
              >
                Clear Search
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ClientDashboard;