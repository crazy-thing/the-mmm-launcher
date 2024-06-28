import React from 'react';
import '../styles/componentStyles/LoadingScreen.scss'; // Import CSS file for styling

const LoadingScreen = () => {
  return (
    <div className='loading-screen'>
      <div className='loading-screen-spinner'></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;