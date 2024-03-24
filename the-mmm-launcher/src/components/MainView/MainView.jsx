import React, { useState, useEffect } from 'react';
import './mainview.css';
import Button from '../Button/Button';
import Version from '../Version/Version';
import ProgressBar from '../ProgressBar/ProgressBar';
const { ipcRenderer } = window.require('electron');

const MainView = ({ modpack, installedVersions, fetchData, handleSetNoChange }) => {

  const [selectedVersion, setSelectedVersion] = useState(null);
  const [verInstalling, setVerInstalling] = useState({});
  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState("");

  const noVersionError = () => {
    ipcRenderer.send('show-error', "Please select a version before launching!");
  };

  useEffect(() => {

    const lastSelectedVersion = JSON.parse(localStorage.getItem("lastSelectedVersion"));
    handleSelectVersion(lastSelectedVersion);

    ipcRenderer.on('install-complete', (event) => {
      setIsInstalling(false);
      handleSetNoChange(false);
      handleSelectVersion(verInstalling);
      setVerInstalling({});
      fetchData();
    });

    ipcRenderer.on('game-launched', (event) => {
      setIsInstalling(false);
      handleSetNoChange(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('install-complete');
      ipcRenderer.removeAllListeners('game-launched');
    };
  }, []);

  const isVersionInstalled = (version) => {
    if (installedVersions != null) {
      const installedModpack = installedVersions.find(installedModpack => installedModpack.id === modpack.id);
    
      if (!installedModpack || !installedModpack.versions) {
        return false;
      }
  
      return installedModpack.versions.some(installedVersion => installedVersion.id === version.id);
    }
  };

  const handleSelectVersion = (ver) => {
    setSelectedVersion(ver);
    localStorage.setItem("lastSelectedVersion", JSON.stringify(ver));
    console.log(ver);
  };

  const handleInstallVersion = (version, modpack) => {
    const args = [version.id, JSON.stringify(modpack)];
    setVerInstalling(version);
    handleSetNoChange(true);
    ipcRenderer.send('download-version', args);
  };

  const handleLaunch = () => {
    console.log(selectedVersion);
    const args = [modpack.id, selectedVersion]
    ipcRenderer.send("launch-game", args);
    setIsInstalling(true);
    handleSetNoChange(true);

  };

  return (
  <div className="main-view" >
    {modpack  && (
    <img className='main-view-background' src={`http://127.0.0.1:3001/uploads/${modpack.background}`} />
    )}
    {modpack && (
    <div className='main-view-content'>
    <div className='main-view-content-top'>
      <div className='main-view-content-top-thumbnail-container'>
        <img className='main-view-content-top-thumbnail' src={`http://127.0.0.1:3001/uploads/${modpack.thumbnail}`} />
      </div>

      <div className='main-view-content-top-right'>
        <p className='main-view-content-top-right-name'> {modpack.name} </p>
        <Button
          onClick={selectedVersion ? () => handleLaunch() : noVersionError }
          text={isInstalling ? `${buttonText}%` : "play"}
          style={{width: "14vw", height: "9vh", borderRadius: "6px", background: "#49a749"}}
          textStyle={{color: "#fff", fontSize: "30px", fontWeight: "bold", fontVariant: "small-caps"}}
        />
        {isInstalling && (
          <ProgressBar setButtonText={setButtonText} />
        )}
      </div>
    </div>

    <div className='main-view-versions-header'>
          <p className='main-view-versions-header-text'> Versions </p>
    </div>

    <div className='main-view-versions-container'>
          {modpack.versions && (
            modpack.versions.map(version => (
              <Version
                version={version}
                selectedVersion={selectedVersion}
                modpack={modpack} 
                installVersion={handleInstallVersion} 
                isInstalled={isVersionInstalled(version)}
                fetchData={fetchData}
                handleSelectVersion={handleSelectVersion}
                key={version.id}
            /> 
            ))
          )}
    </div>
    

    </div>
    )}
  </div>
  )
};

export default MainView;