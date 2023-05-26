
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RandomImageGenerator = () => {
  const [randomImageUrl, setRandomImageUrl] = useState('');

  useEffect(() => {
    const fetchRandomPhoto = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
          params: {
            client_id: 'ZeEt_hAmCRaSRPvl70T-oCqt44z8_btoQVIO8uN6_y4',
            query: 'nature',
            orientation: 'landscape',
          },
        });
        const photoUrl = response.data.urls.regular;
        setRandomImageUrl(photoUrl);
      } catch (error) {
        console.error('Error fetching random photo:', error);
      }
    };

    const debounceFetch = debounce(fetchRandomPhoto, 3600000 / 45); // Limit requests to 45 photos per hour (3600000 ms)

    debounceFetch();
  }, []);

  // Debounce function to limit API requests
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  return (
    <div
      className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-20 h-10 rounded-sm"
      style={{ backgroundImage: `url(${randomImageUrl})` }}
    ></div>
  );
};

export default RandomImageGenerator;