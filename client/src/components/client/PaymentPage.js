import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './PaymentPage.css';

const PaymentPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);

  useEffect(() => {
    // Get order details from location state or localStorage
    const bookingData = location.state?.bookingData || 
                      JSON.parse(localStorage.getItem('currentBooking')) || 
                      JSON.parse(localStorage.getItem('lastBooking')) || 
                      {};

    const provider = location.state?.providerDetails || 
                    JSON.parse(localStorage.getItem(`provider_${providerId}`)) || 
                    {};

    setOrderDetails(bookingData);
    setProviderDetails(provider);

    // If no booking data, redirect back
    if (!bookingData.serviceType) {
      alert("No booking details found. Please book a service first.");
      navigate(-1);
    }
  }, [providerId, location.state, navigate]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length <= 19) { // 16 digits + 3 spaces
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length <= 5) {
        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    
    // CVV - only numbers, max 4
    if (name === 'cvv') {
      if (/^\d{0,4}$/.test(value)) {
        setCardDetails(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const validatePayment = () => {
    if (paymentMethod === 'online') {
      if (!cardDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        alert("Please enter a valid 16-digit card number");
        return false;
      }
      if (!cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        alert("Please enter a valid expiry date (MM/YY)");
        return false;
      }
      if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
        alert("Please enter a valid CVV");
        return false;
      }
      if (!cardDetails.cardholderName.trim()) {
        alert("Please enter cardholder name");
        return false;
      }
    }
    return true;
  };

  const processPayment = async () => {
    if (!validatePayment()) return;

    setLoading(true);

    try {
      // Simulate API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        id: `ORD${Date.now()}`,
        providerId,
        providerName: providerDetails?.name || 'Service Provider',
        serviceType: orderDetails.serviceType,
        description: orderDetails.description,
        serviceDate: orderDetails.serviceDate,
        contact: orderDetails.contact,
        amount: orderDetails.amount || '₹999',
        paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
        bookingDate: new Date().toISOString(),
        tracking: {
          currentStatus: paymentMethod === 'cod' ? 'Pending Confirmation' : 'Order Confirmed',
          statusHistory: [
            {
              status: paymentMethod === 'cod' ? 'Pending Confirmation' : 'Order Confirmed',
              description: paymentMethod === 'cod' 
                ? 'Waiting for provider confirmation' 
                : 'Payment received and order confirmed',
              timestamp: new Date().toISOString(),
              completed: true
            }
          ],
          currentStep: 0,
          isCompleted: false
        }
      };

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('clientOrders')) || [];
      const existingBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      
      localStorage.setItem('clientOrders', JSON.stringify([order, ...existingOrders]));
      localStorage.setItem('bookings', JSON.stringify([order, ...existingBookings]));
      localStorage.setItem('lastBooking', JSON.stringify(order));

      // Clear current booking
      localStorage.removeItem('currentBooking');

      // Show success message
      alert(`🎉 Payment Successful! Order #${order.id} has been placed.`);

      // Navigate to orders page
      navigate('/client/orders', { 
        state: { 
          bookingSuccess: true, 
          bookingId: order.id 
        } 
      });

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    await processPayment();
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Secure Payment</h1>
          <p className="text-gray-600 text-lg">Complete your booking with secure payment</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Service</label>
                  <p className="font-semibold text-gray-800">{orderDetails.serviceType}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Provider</label>
                  <p className="font-medium text-gray-700">{providerDetails?.name || 'Service Provider'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Service Date</label>
                  <p className="font-medium text-gray-700">
                    {orderDetails.serviceDate ? new Date(orderDetails.serviceDate).toLocaleDateString() : 'Flexible'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Contact</label>
                  <p className="font-medium text-gray-700">{orderDetails.contact}</p>
                </div>

                {orderDetails.description && (
                  <div>
                    <label className="text-sm text-gray-500">Special Requirements</label>
                    <p className="font-medium text-gray-700 text-sm">{orderDetails.description}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">{orderDetails.amount || '₹999'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">💳 Online Payment</span>
                        <p className="text-sm text-gray-600 mt-1">Pay securely with card</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-green-500 bg-green-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">💰 Cash on Delivery</span>
                        <p className="text-sm text-gray-600 mt-1">Pay when service is delivered</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'online' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-800">Card Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardDetails.cardholderName}
                      onChange={handleCardChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter cardholder name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-green-500 text-xl">🔒</div>
                      <div>
                        <p className="font-semibold text-green-800">Secure Payment</p>
                        <p className="text-sm text-green-600">Your payment information is encrypted and secure</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Button */}
              <div className="border-t pt-6">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `💳 ${paymentMethod === 'cod' ? 'Confirm Booking' : `Pay ${orderDetails.amount || '₹999'}`}`
                  )}
                </button>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  {paymentMethod === 'cod' 
                    ? 'You will pay when the service is completed'
                    : 'Your payment is secured with 256-bit SSL encryption'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;