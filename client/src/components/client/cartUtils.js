// Utility functions for cart management
export const cartUtils = {
  // Add item to cart
  addToCart: (item) => {
    const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.serviceId === item.serviceId && 
      cartItem.providerId === item.providerId
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item with unique ID
      const newItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        quantity: item.quantity || 1,
        selected: true,
        addedAt: new Date().toISOString()
      };
      cart.push(newItem);
    }
    
    localStorage.setItem('clientCart', JSON.stringify(cart));
    return cart;
  },

  // Remove item from cart
  removeFromCart: (itemId) => {
    const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
    const updatedCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('clientCart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  // Update item quantity
  updateQuantity: (itemId, newQuantity) => {
    const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );
    localStorage.setItem('clientCart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  // Get cart item count
  getCartItemCount: () => {
    const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Clear cart
  clearCart: () => {
    localStorage.removeItem('clientCart');
  },

  // Get cart total
  getCartTotal: () => {
    const cart = JSON.parse(localStorage.getItem('clientCart')) || [];
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  }
};

// Hook to use in components
export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('clientCart')) || [];
      setCart(savedCart);
    };
    
    loadCart();
    
    // Listen for cart updates from other components
    const handleStorageChange = () => {
      loadCart();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    cart,
    addToCart: (item) => {
      const updatedCart = cartUtils.addToCart(item);
      setCart(updatedCart);
      return updatedCart;
    },
    removeFromCart: (itemId) => {
      const updatedCart = cartUtils.removeFromCart(itemId);
      setCart(updatedCart);
      return updatedCart;
    },
    updateQuantity: (itemId, newQuantity) => {
      const updatedCart = cartUtils.updateQuantity(itemId, newQuantity);
      setCart(updatedCart);
      return updatedCart;
    },
    clearCart: () => {
      cartUtils.clearCart();
      setCart([]);
    },
    getItemCount: cartUtils.getCartItemCount,
    getTotal: cartUtils.getCartTotal
  };
};