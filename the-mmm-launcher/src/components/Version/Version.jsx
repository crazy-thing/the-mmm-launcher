import React, { useEffect, useState } from 'react';
import Button from '../Button/Button';
import './version.css';
import ProgressBar from '../ProgressBar/ProgressBar';
import {folderIcon} from '../../assets/exports'
const Version = ({ version, modpack, installVersion, isInstalled, fetchData, handleSelectVersion, selectedVersion }) => {
  const { ipcRenderer } = window.require('electron');

  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState('');

  const handleInstallClick = () => {
    setIsInstalling(true);
    console.log(isInstalling);
    installVersion(version, modpack);
  };

  const handleOpenFolder = () => {
    ipcRenderer.send('open-folder', `${modpack.id}\\${version.id}`);
  };

  const handleDeleteVersion = () => {
    ipcRenderer.send('delete-version', version);
  };

  const selectVersion = (ver) => {
    handleSelectVersion(ver)
    if (ver != null && modpack != null) {
      const args = [modpack.id, ver.id];
      ipcRenderer.send('select-version', args);
      setIsInstalling(true);
    }
  };


  useEffect(() => {

    console.log(selectedVersion);

    ipcRenderer.on('install-complete', (event) => {
      setIsInstalling(false);
      fetchData();
    });

    ipcRenderer.on('uninstall-complete', (event) => {
      handleSelectVersion(null);
      fetchData();
    });

    ipcRenderer.on('version-selected', (event) => {
      setIsInstalling(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('install-complete');
      ipcRenderer.removeAllListeners('uninstall-complete');
      ipcRenderer.removeAllListeners('version-selected');

    };
  }, [selectedVersion]);



  return (

    <div className='v'>
    <div className='version-container'>
      <div className='version'>
          <div className='version-info'>
              <p className='version-info-text'> File Name: {version.zip} </p>
              <p className='version-info-text'> Version Number: {version.name} </p>
          </div>

          {isInstalled && (
          <>
            {version.id === selectedVersion?.id ? (
            <Button
              onClick={() => selectVersion(version)}
              text={"Selected"}
              style={{
              width: "8vw",
              height: "4vh",
              background:
              "#49a749",
              marginRight: "2vh"
            }}
              textStyle={{ color: "#fff", fontSize: "1vw" }}
            />
            ) : (
              <Button
                onClick={() => selectVersion(version)}
                text={"Select"}
                style={{
                width: "8vw",
                height: "4vh",
                background: "var(--primary-color)",
                marginRight: "2vh"
              }}
                textStyle={{ color: "#fff", fontSize: "1vw" }}
              />
            )}
          </>
        )}


        {isInstalled ? (
          <Button
          onClick={() => handleDeleteVersion()}
          text={"Uninstall"}
          style={{width: "8vw", height: "4vh", background: "linear-gradient(114deg, rgba(191,20,20,1) 0%, rgba(195,21,21,1) 100%)", marginRight: "2vh"}}
          textStyle={{color: "#fff", fontSize: "1vw"}}
          />
        ) : (
          <Button
              onClick={isInstalling ? () => console.log("already installing") : () => handleInstallClick()}
              text={isInstalling ? `${buttonText}%` : "Install"}
              style={{width: "8vw", height: "4vh", background: "var(--primary-color)", marginRight: "2vh"}}
              textStyle={{color: "#fff", fontSize: "1vw"}}
          />
        )}

      </div>
      {isInstalling && (
        <div className='version-progress-bar-margin'>
          <ProgressBar setButtonText={setButtonText} styles={{marginLeft: "1vw"}} />
        </div>
      )}
    </div>
    {isInstalled && (
      <img
        src={folderIcon}
        width={"40vw"} 
        height={"40vw"} 
        style={{cursor: 'pointer', marginRight: "-2vw"}} 
        onClick={handleOpenFolder}
      />
    )}

    </div>
  )
};



export default Version;