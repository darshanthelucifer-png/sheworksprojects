import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoriesPage = () => {
  const navigate = useNavigate();
  
  const categories = [
    { id: 'embroidery', name: 'Embroidery', icon: '🪡' },
    { id: 'food', name: 'Home Cooked Food', icon: '🍛' },
    { id: 'gifts', name: 'Custom Gifts', icon: '🎁' },
    { id: 'arts', name: 'Arts & Crafts', icon: '🎨' }
  ];

  return (
    <div className="categories-page">
      <div className="container">
        <h1>Browse Categories</h1>
        <div className="categories-grid">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => navigate(`/services/${category.id}`)}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;