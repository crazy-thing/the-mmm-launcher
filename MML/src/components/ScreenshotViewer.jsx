import React from 'react';
import '../styles/componentStyles/ScreenshotViewer.scss';
import { close, left, right } from '../assets/exports';
const ScreenshotViewer = ({ modpack, index, onClose, onNext, onPrev }) => {
  return (
    <div className='screenshot-viewer-overlay'>
        <img src={close} alt='Close' className='screenshot-viewer-close' onClick={onClose} />
        <p className='screenshot-viewer-title'>{modpack.screenshots[index]}</p>
        <div className='screenshot-viewer'>
            <img src={left} alt='Previous' className='screenshot-viewer-buttons' onClick={onPrev} />
            <img
                className='screenshot-viewer-image'
                src={`https://minecraftmigos.me/uploads/${modpack.screenshots[index]}`}
                alt={`Screenshot ${index}`} />
            <img src={right} alt='Previous' className='screenshot-viewer-buttons' onClick={onNext} />

        </div>
    </div>
  )
};

export default ScreenshotViewer;