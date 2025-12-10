import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProviderById } from "../../data";
import "./ProviderReviews.css";

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const providerSession = localStorage.getItem('providerSession');
    if (!providerSession) return;

    const sessionData = JSON.parse(providerSession);
    const providerDetails = getProviderById(sessionData.id);
    setProvider(providerDetails);

    // Generate reviews based on provider data
    const timeout = setTimeout(() => {
      const generatedReviews = [
        {
          _id: "1",
          clientName: "Anita Sharma",
          rating: providerDetails?.rating || 5,
          comment: "Excellent service! The quality exceeded my expectations. Will definitely book again!",
          date: "2024-01-15",
          service: providerDetails?.services?.[0] || "General Service"
        },
        {
          _id: "2",
          clientName: "Rajesh Kumar",
          rating: 4,
          comment: "Good work, completed on time. Professional and courteous service provider.",
          date: "2024-01-10",
          service: providerDetails?.services?.[1] || "General Service"
        },
        {
          _id: "3",
          clientName: "Priya Patel",
          rating: 5,
          comment: "Absolutely amazing! Attention to detail was impressive. Highly recommended!",
          date: "2024-01-08",
          service: providerDetails?.services?.[0] || "General Service"
        }
      ];
      setReviews(generatedReviews);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading) return (
    <div className="reviews-loading">
      <div className="loading-spinner"></div>
      <p>Loading reviews...</p>
    </div>
  );

  const ratingDistribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="provider-reviews-container">
      {/* Header with Stats */}
      <div className="reviews-header">
        <div className="reviews-overview">
          <div className="average-rating">
            <h1>{averageRating}</h1>
            <div className="stars-large">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>
            <p>{reviews.length} reviews</p>
          </div>
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span>{rating} ★</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(ratingDistribution[rating] / reviews.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <span>({ratingDistribution[rating]})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <h2 className="reviews-title">Client Reviews</h2>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>Your reviews will appear here once clients start rating your services.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="avatar">
                    {review.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{review.clientName}</h3>
                    <p className="review-service">{review.service}</p>
                  </div>
                </div>
                <div className="review-meta">
                  <div className="stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <p className="review-text">"{review.comment}"</p>
              
              <div className="review-actions">
                <button className="action-btn">👍 Helpful</button>
                <button className="action-btn">💬 Reply</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Insights */}
      {reviews.length > 0 && (
        <motion.div 
          className="review-insights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Review Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Response Rate</h4>
                <p>98%</p>
                <small>You respond to most reviews</small>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⭐</div>
              <div className="insight-content">
                <h4>Average Rating</h4>
                <p>{averageRating}/5</p>
                <small>Based on {reviews.length} reviews</small>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💬</div>
              <div className="insight-content">
                <h4>Positive Feedback</h4>
                <p>92%</p>
                <small>Clients love your work</small>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProviderReviews;