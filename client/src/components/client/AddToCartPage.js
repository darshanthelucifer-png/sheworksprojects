import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './AddToCartPage.css';

const AddToCartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [suggestedServices, setSuggestedServices] = useState([]);

  useEffect(() => {
    loadCartItems();
    loadSuggestedServices();
  }, []);

  const loadCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
      const enhancedCart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        selected: item.selected !== false // Default to selected
      }));
      setCartItems(enhancedCart);
      
      // Initialize selected items
      const initialSelected = new Set(enhancedCart.map(item => item.id));
      setSelectedItems(initialSelected);
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedServices = () => {
    // Load suggested services based on cart items or popular services
    const suggestions = [
      {
        id: 'sug1',
        name: 'Custom Embroidery',
        provider: 'Anita Sharma',
        price: 899,
        image: '/assets/services/embroidery.jpg',
        rating: 4.8
      },
      {
        id: 'sug2',
        name: 'Handmade Gift Box',
        provider: 'Priya Patel',
        price: 599,
        image: '/assets/services/gifts.jpg',
        rating: 4.6
      },
      {
        id: 'sug3',
        name: 'Traditional Meals',
        provider: 'Meera Catering',
        price: 299,
        image: '/assets/services/food.jpg',
        rating: 4.9
      }
    ];
    setSuggestedServices(suggestions);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(itemId);
      return newSelected;
    });
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    // Mock coupon validation
    const validCoupons = {
      'WELCOME10': 10,
      'SHEWORKS15': 15,
      'FIRSTORDER': 20
    };

    const discount = validCoupons[couponCode.toUpperCase()];
    if (discount) {
      setCouponApplied(true);
      setCouponDiscount(discount);
      alert(`🎉 Coupon applied! ${discount}% discount added.`);
    } else {
      alert('❌ Invalid coupon code. Please try again.');
    }
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.id));
  };

  const calculateSubtotal = () => {
    return getSelectedItems().reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return couponApplied ? (subtotal * couponDiscount) / 100 : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const serviceFee = subtotal * 0.02; // 2% service fee
    return subtotal - discount + serviceFee;
  };

  const saveCart = () => {
    localStorage.setItem('clientCart', JSON.stringify(cartItems));
  };

  // UPDATED NAVIGATION FUNCTIONS
  const proceedToCheckout = () => {
    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      alert('Please select at least one item to proceed to checkout.');
      return;
    }

    saveCart();
    
    // For now, use the first selected item for QuickBuyPage
    // You can enhance this later for multiple items
    const firstItem = selectedCartItems[0];
    
    navigate(`/client/quick-buy/${firstItem.providerId}/${firstItem.serviceId || firstItem.id}`, {
      state: {
        product: {
          id: firstItem.serviceId || firstItem.id,
          name: firstItem.name,
          price: firstItem.price,
          image: firstItem.image,
          description: firstItem.description || 'Professional service with quality guarantee'
        },
        provider: {
          id: firstItem.providerId,
          name: firstItem.provider
        },
        fromCart: true,
        cartItems: selectedCartItems
      }
    });
  };

  const continueShopping = () => {
    saveCart();
    navigate('/client/dashboard'); // Changed from '/client/services' to '/client/dashboard'
  };

  const addSuggestedToCart = (service) => {
    const newItem = {
      id: `cart_${Date.now()}`,
      serviceId: service.id,
      name: service.name,
      provider: service.provider,
      price: service.price,
      image: service.image,
      quantity: 1,
      selected: true
    };

    setCartItems(prev => [...prev, newItem]);
    setSelectedItems(prev => new Set([...prev, newItem.id]));
    
    alert(`✅ ${service.name} added to cart!`);
  };

  // Auto-save cart when items change
  useEffect(() => {
    if (!loading) {
      saveCart();
    }
  }, [cartItems, loading]);

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <h1>🛒 My Cart</h1>
        <p>Review your selected services and proceed to checkout</p>
      </div>

      <div className="cart-content">
        {/* Main Cart Section */}
        <div className="cart-main">
          {/* Cart Actions */}
          {cartItems.length > 0 && (
            <div className="cart-actions">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={selectAllItems}
                />
                Select All ({selectedItems.size}/{cartItems.length} selected)
              </label>
              <button
                onClick={() => {
                  const selectedIds = Array.from(selectedItems);
                  setCartItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
                  setSelectedItems(new Set());
                }}
                className="remove-selected-btn"
              >
                🗑️ Remove Selected
              </button>
            </div>
          )}

          {/* Cart Items */}
          <AnimatePresence>
            {cartItems.length > 0 ? (
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="item-select">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                    </div>

                    <div className="item-image">
                      <img
                        src={item.image || '/assets/default-service.jpg'}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/assets/default-service.jpg';
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-provider">by {item.provider}</p>
                      <p className="item-description">
                        {item.description || 'Professional service with quality guarantee'}
                      </p>
                      
                      <div className="item-meta">
                        {item.serviceDate && (
                          <span className="service-date">
                            📅 {new Date(item.serviceDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.deliveryType && (
                          <span className="delivery-type">
                            🚚 {item.deliveryType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="item-price">
                        ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-item-btn"
                        title="Remove from cart"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="empty-cart"
              >
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add some amazing services to get started!</p>
                <button
                  onClick={continueShopping}
                  className="explore-services-btn"
                >
                  🛍️ Explore Services
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested Services */}
          {cartItems.length > 0 && suggestedServices.length > 0 && (
            <div className="suggested-services">
              <h3>You might also like</h3>
              <div className="suggested-grid">
                {suggestedServices.map(service => (
                  <motion.div
                    key={service.id}
                    className="suggested-item"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={service.image} alt={service.name} />
                    <div className="suggested-info">
                      <h4>{service.name}</h4>
                      <p>by {service.provider}</p>
                      <div className="suggested-rating">
                        ⭐ {service.rating}
                      </div>
                      <div className="suggested-price">
                        ₹{service.price}
                      </div>
                      <button
                        onClick={() => addSuggestedToCart(service)}
                        className="add-suggested-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Selected Items ({getSelectedItems().length})</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {couponApplied && (
                  <div className="summary-row discount">
                    <span>Coupon Discount ({couponDiscount}%)</span>
                    <span>-₹{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Service Fee (2%)</span>
                  <span>₹{(calculateSubtotal() * 0.02).toLocaleString()}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="coupon-section">
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="coupon-input"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className="apply-coupon-btn"
                  >
                    {couponApplied ? '✅ Applied' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <button
                    onClick={() => {
                      setCouponApplied(false);
                      setCouponDiscount(0);
                      setCouponCode('');
                    }}
                    className="remove-coupon-btn"
                  >
                    Remove Coupon
                  </button>
                )}
              </div>

              {/* Available Coupons */}
              <div className="available-coupons">
                <h4>Available Coupons:</h4>
                <div className="coupon-list">
                  <div className="coupon-tag">
                    <strong>WELCOME10</strong> - 10% off
                  </div>
                  <div className="coupon-tag">
                    <strong>SHEWORKS15</strong> - 15% off
                  </div>
                  <div className="coupon-tag">
                    <strong>FIRSTORDER</strong> - 20% off
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                disabled={getSelectedItems().length === 0}
                className="checkout-btn"
              >
                🛍️ Proceed to Checkout (₹{calculateTotal().toLocaleString()})
              </button>

              {/* Continue Shopping */}
              <button
                onClick={continueShopping}
                className="continue-shopping-btn"
              >
                ← Continue Shopping
              </button>

              {/* Security Badge */}
              <div className="security-badge">
                <div className="security-icon">🔒</div>
                <div className="security-text">
                  <strong>Secure Checkout</strong>
                  <span>Your payment information is safe with us</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCartPage;