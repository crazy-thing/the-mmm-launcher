import React, { useEffect, useState } from 'react';
import './progressbar.css';

const ProgressBar = ({ setButtonText }) => {
    const { ipcRenderer } = window.require('electron');

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        ipcRenderer.on('update-progress', (event, progress) => {
            setProgress(progress);
            setButtonText(progress);
        });

        return () => {
            ipcRenderer.removeAllListeners('update-progress');
        };
    }, []);

  return (
    <div className='progress-bar'>
        <div className='progress-bar-track' >
            <div className='progress-bar-progress' style={{width: `${progress}%`}}>
            </div>
        </div>    
    </div>
  )
};

export default ProgressBar;