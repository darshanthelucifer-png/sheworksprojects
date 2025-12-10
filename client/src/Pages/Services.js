import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Services</h2>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul>
          {services.map((service) => (
            <li key={service._id} style={{ marginBottom: '15px' }}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p><strong>Price:</strong> ₹{service.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Services;