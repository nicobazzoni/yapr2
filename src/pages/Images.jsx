import React, { useState, useEffect } from 'react';
import RandomImageGenerator from '../components/RandomImageGenerator';

const Images = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Simulating a 3-second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading images...</p> // Render a loading message or spinner while images are being fetched
      ) : (
        <RandomImageGenerator />
      )}
    </div>
  );
};

export default Images;
