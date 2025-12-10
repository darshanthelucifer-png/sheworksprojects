import React from 'react';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const favorites = JSON.parse(localStorage.getItem('clientFavorites') || '[]');

  return (
    <div className="favorites-page">
      <div className="container">
        <h1>My Favorites</h1>
        {favorites.length === 0 ? (
          <div className="empty-state">
            <p>No favorites yet. Start exploring services!</p>
            <button onClick={() => navigate('/categories')}>
              Browse Services
            </button>
          </div>
        ) : (
          <div className="favorites-list">
            {favorites.map(fav => (
              <div key={fav.providerId} className="favorite-item">
                <h3>{fav.providerName}</h3>
                <p>{fav.category} • {fav.subService}</p>
                <button onClick={() => navigate(`/provider/${fav.providerId}`)}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;