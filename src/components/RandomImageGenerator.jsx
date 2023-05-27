import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RandomImageGenerator = () => {
  const [randomImageUrls, setRandomImageUrls] = useState([]);

  useEffect(() => {
    const fetchRandomPhotos = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
          params: {
            client_id: 'ZeEt_hAmCRaSRPvl70T-oCqt44z8_btoQVIO8uN6_y4',
            query: 'nature',
            orientation: 'landscape',
            count: 20, // Fetch 20 random photos
          },
        });
        const photoUrls = response.data.map((photo) => photo.urls.regular);
        setRandomImageUrls(photoUrls);
        console.log(photoUrls);
      } catch (error) {
        console.error('Error fetching random photos:', error);
      }
    };

    const debounceFetch = debounce(fetchRandomPhotos, 3600000 / 45); // Limit requests to 45 photos per hour (3600000 ms)

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
    <div className="flex flex-wrap justify-center">
      {randomImageUrls.map((imageUrl) => (
        <div
          key={imageUrl}
          className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-full h-32 rounded-sm"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
      ))}
    </div>
  );
};

export default RandomImageGenerator;
