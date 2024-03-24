import React, { useEffect, useRef, useState } from 'react';
import './modpacksside.css';
const ModpacksSide = ({ modpacks, handleSelectModpack }) => {

  const thumbnailsUrl = 'http://127.0.0.1:3001/uploads/';
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const [showModpackName, setShowModpackName] = useState(false);
  const containerRef = useRef(null);



  const handleScrollUp = () => {
    const nextStartIndex = startIndex - 6;
    if (nextStartIndex >= 0) {
      setStartIndex(nextStartIndex);
      setEndIndex(nextStartIndex + 5);
    }
  };

  const handleScrollDown = () => {
    const nextStartIndex = endIndex + 1;
    if (nextStartIndex < modpacks.length) {
      setStartIndex(nextStartIndex);
      setEndIndex(nextStartIndex + 5);
    }
  };



  const handleWheelScroll = (event) => {
    if (event.deltaY > 0) {
      handleScrollDown();
    } else {
      handleScrollUp();
    }
  };

  const renderModpacks = () => {
    return modpacks.slice(startIndex, endIndex + 1).map((modpack, index) => (
      <div className='modpacks-side-modpack' key={`modpack-${index}`} onMouseEnter={() =>  setShowModpackName(true) } onMouseLeave={() => setShowModpackName(false)}>
        <img className='modpacks-side-thumbnail' src={`${thumbnailsUrl}${modpack.thumbnail}`} onClick={() => handleSelectModpack(modpack)} />
      </div>
    ));
  };

  return (
    <div className='modpacks-side' onWheel={handleWheelScroll}>
      <div className='modpacks-side-scroll' onClick={handleScrollUp}>
        {startIndex > 0 && (
          <div className='modpacks-side-scroll-btn-up'  />
        )}
      </div>
        {modpacks.length > 0 ? (
          <div ref={containerRef} className='modpacks-side-container'>
            {renderModpacks()}
          </div>
        ) : (
          <p className='modpacks-side-none'> No modpacks available</p>
        )}
      <div className='modpacks-side-scroll' onClick={handleScrollDown}>
      {endIndex < modpacks.length - 1 && (
        <div className='modpacks-side-scroll-btn-down'  />
      )}
      </div>
    </div>
  )
};

export default ModpacksSide;