import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './WriteReviewPage.css';

function WriteReviewPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [review, setReview] = useState({ 
    rating: 0, 
    comment: '',
    title: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load provider details
    const loadProviderDetails = async () => {
      try {
        // Try multiple data sources
        let providerData = null;
        
        // 1. Try localStorage
        const allProviders = JSON.parse(localStorage.getItem('allProviders') || '[]');
        providerData = allProviders.find(p => p.id === providerId || p._id === providerId);

        // 2. Try API
        if (!providerData) {
          try {
            const response = await axios.get(`http://localhost:5000/api/providers/${providerId}`);
            if (response.data.success) {
              providerData = response.data.provider;
            }
          } catch (apiError) {
            console.log('API not available');
          }
        }

        // 3. Fallback
        if (!providerData) {
          providerData = {
            name: 'Service Provider',
            image: '/assets/default-profile.png'
          };
        }

        setProvider(providerData);
      } catch (error) {
        console.error('Error loading provider details:', error);
      }
    };

    loadProviderDetails();
  }, [providerId]);

  const handleRatingClick = (rating) => {
    setReview(prev => ({ ...prev, rating }));
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview(prev => ({ ...prev, [name]: value }));
  };

  const validateReview = () => {
    if (review.rating === 0) {
      alert('Please select a rating');
      return false;
    }
    if (!review.comment.trim()) {
      alert('Please write a review comment');
      return false;
    }
    if (review.comment.length < 10) {
      alert('Please write a more detailed review (at least 10 characters)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateReview()) return;

    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('user')) || { name: 'Anonymous' };
      const newReview = {
        name: user.name || 'Anonymous',
        rating: Number(review.rating),
        comment: review.comment.trim(),
        title: review.title.trim() || `Review for ${provider?.name}`,
        createdAt: new Date().toISOString(),
        orderId: location.state?.orderId || null,
        helpful: 0
      };

      const key = `reviews_${providerId}`;
      const existing = JSON.parse(localStorage.getItem(key)) || [];
      
      // Check if user already reviewed this provider
      const existingReviewIndex = existing.findIndex(rev => 
        rev.name === newReview.name && 
        (!location.state?.orderId || rev.orderId === location.state.orderId)
      );

      if (existingReviewIndex !== -1) {
        if (!window.confirm('You have already reviewed this provider. Do you want to update your review?')) {
          setSubmitting(false);
          return;
        }
        existing[existingReviewIndex] = newReview;
      } else {
        existing.unshift(newReview); // add newest first
      }

      localStorage.setItem(key, JSON.stringify(existing));

      // Try API submission
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `http://localhost:5000/api/providers/${providerId}/reviews`,
          newReview,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (apiError) {
        console.log('API submission failed, using localStorage only');
      }

      // Show success message
      setTimeout(() => {
        alert('🎉 Review submitted successfully! Thank you for your feedback.');
        
        // Navigate back to provider profile or orders page
        if (location.state?.fromOrders) {
          navigate('/client/orders');
        } else {
          navigate(`/provider/${providerId}`);
        }
      }, 500);

    } catch (error) {
      console.error('Review submission failed:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (review.rating > 0 || review.comment.trim() || review.title.trim()) {
      if (window.confirm('Are you sure? Your review will be lost.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="write-review-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="review-card"
      >
        {/* Header */}
        <div className="review-header">
          <button 
            onClick={handleCancel}
            className="back-button"
          >
            ← Back
          </button>
          <h2>Write a Review</h2>
          {provider && (
            <div className="provider-preview">
              <img 
                src={provider.image} 
                alt={provider.name}
                className="provider-image-small"
                onError={(e) => {
                  e.target.src = "/assets/default-profile.png";
                }}
              />
              <span className="provider-name">{provider.name}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Rating Section */}
          <div className="rating-section">
            <label className="rating-label">Overall Rating *</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoverRating || review.rating) ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                >
                  {star <= (hoverRating || review.rating) ? '★' : '☆'}
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            {review.rating > 0 && (
              <p className="selected-rating">
                You selected: {review.rating} {review.rating === 1 ? 'star' : 'stars'}
              </p>
            )}
          </div>

          {/* Review Title */}
          <div className="form-group">
            <label htmlFor="title">Review Title (Optional)</label>
            <input
              type="text"
              id="title"
              name="title"
              value={review.title}
              onChange={handleChange}
              placeholder="Summarize your experience..."
              className="form-input"
              maxLength="100"
            />
            <div className="character-count">
              {review.title.length}/100 characters
            </div>
          </div>

          {/* Review Comment */}
          <div className="form-group">
            <label htmlFor="comment">Your Review *</label>
            <textarea
              id="comment"
              name="comment"
              value={review.comment}
              onChange={handleChange}
              placeholder="Share details of your experience with this provider. What did you like? What could be improved?"
              className="form-textarea"
              rows="6"
              required
              maxLength="1000"
            />
            <div className="character-count">
              {review.comment.length}/1000 characters
            </div>
          </div>

          {/* Tips for Good Review */}
          <div className="review-tips">
            <h4>💡 Tips for a great review:</h4>
            <ul>
              <li>Be specific about what you liked or didn't like</li>
              <li>Mention the quality of work and communication</li>
              <li>Note if the service was delivered on time</li>
              <li>Keep it honest and constructive</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || review.rating === 0 || !review.comment.trim()}
              className="submit-btn"
            >
              {submitting ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <p>
              🔒 Your review will be publicly visible. We never share your personal contact information.
            </p>
          </div>
        </form>
      </motion.div>

      {/* Preview Section */}
      {(review.rating > 0 || review.comment) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="review-preview"
        >
          <h3>Preview</h3>
          <div className="preview-content">
            {review.rating > 0 && (
              <div className="preview-rating">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                <span> ({review.rating}/5)</span>
              </div>
            )}
            {review.title && (
              <h4 className="preview-title">{review.title}</h4>
            )}
            {review.comment && (
              <p className="preview-comment">{review.comment}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default WriteReviewPage;