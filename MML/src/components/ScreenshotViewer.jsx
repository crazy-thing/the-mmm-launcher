import React from 'react';
import '../styles/componentStyles/ScreenshotViewer.scss';
import { close, left, right } from '../assets/exports';
const ScreenshotViewer = ({ modpack, index, onClose, onNext, onPrev }) => {

  const handleImgClick = (e) => {
    e.stopPropagation();
  };

  
  return (
    <div className='screenshot-viewer-overlay' onClick={onClose}>
        
       {/*  <img src={close} alt='Close' className='screenshot-viewer-close' onClick={onClose} /> */}
        <div className='screenshot-viewer'>
            <img src={left} alt='Previous' className='screenshot-viewer-buttons' onClick={(e) => onPrev(e)} />
            <img
                className='screenshot-viewer-image'
                src={`https://minecraftmigos.me/uploads/${modpack.screenshots[index]}`}
                alt={`Screenshot ${index}`}
                onClick={(e) => handleImgClick(e)} />
            <img src={right} alt='Previous' className='screenshot-viewer-buttons' onClick={(e) => onNext(e)}/>

        </div>
    </div>
  )
};

export default ScreenshotViewer;