import React, { useEffect } from 'react';

const PreloadImages = ({ imageUrls }) => {

    useEffect(() => {
        imageUrls.forEach((image) => {
            const img = new Image();
            img.src = `https://minecraftmigos.me/uploads/${image}`;
        });
    }, [imageUrls]);
  return null;
};

export default PreloadImages;