import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic here
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>Search Services</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="🔍 Search for services, providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </div>
  );
};

export default SearchPage;