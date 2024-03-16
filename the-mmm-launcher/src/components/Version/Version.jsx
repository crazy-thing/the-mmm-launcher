import React, { useEffect, useState } from 'react';
import Button from '../Button/Button';
import './version.css';
import ProgressBar from '../ProgressBar/ProgressBar';
const Version = ({ version, modpack, installVersion, isInstalled, fetchData, handleSelectVersion }) => {
  const { ipcRenderer } = window.require('electron');


  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState('');

  const handleInstallClick = () => {
    installVersion(version, modpack);
    setIsInstalling(true);
  };

  const handleDeleteVersion = () => {
    ipcRenderer.send('delete-version', version);
  };

  useEffect(() => {
    ipcRenderer.on('install-complete', (event) => {
      setIsInstalling(false);
      fetchData();
    });

    ipcRenderer.on('uninstall-complete', (event) => {
      handleSelectVersion(null);
      fetchData();
    });

    return () => {
      ipcRenderer.removeAllListeners('install-complete');
      ipcRenderer.removeAllListeners('uninstall-complete');
    };
  }, []);

  return (
    <div className='version-container'>
      <div className='version'>
          <div className='version-info'>
              <p className='version-info-text'> File Name: {version.zip} </p>
              <p className='version-info-text'> Version Number: {version.name} </p>
          </div>

        {isInstalled ? (
          <Button
          onClick={() => handleDeleteVersion()}
          text={"Uninstall"}
          style={{width: "8vw", height: "4vh", background: "linear-gradient(114deg, rgba(191,20,20,1) 0%, rgba(195,21,21,1) 100%)", marginRight: "2vw"}}
          textStyle={{color: "#fff", fontSize: "17px"}}
      />
        ) : (
          <Button
              onClick={isInstalling ? () => console.log("already installing") : () => handleInstallClick()}
              text={isInstalling ? `${buttonText}%` : "Install"}
              style={{width: "8vw", height: "4vh", background: "var(--primary-color)", marginRight: "2vw"}}
              textStyle={{color: "#fff", fontSize: "17px"}}
          />
        )}

      </div>
      {isInstalling && (
        <div className='version-progress-bar-margin'>
          <ProgressBar setButtonText={setButtonText} styles={{marginLeft: "1vw"}} />
        </div>
      )}
    </div>
  )
};

export default Version;