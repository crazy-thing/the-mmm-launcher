import React, { useEffect, useState } from 'react';
import './modpack.css';
import Button from '../Button/Button';
import Version from '../Version/Version';
import DropDown from '../DropDown/DropDown';
import ProgressBar from '../ProgressBar/ProgressBar';
const { ipcRenderer } = window.require('electron');

const Modpack = ({ modpack, installVersion, installedVersions, fetchData }) => {
  
  const uploadsUrl = "http://127.0.0.1:3001/uploads/"

  const [selectedVersion, setSelectedVersion ] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    ipcRenderer.on('install-complete', (event) => {
      setIsInstalling(false);
      fetchData();
    });

    ipcRenderer.on('game-launched', (event) => {
      setIsInstalling(false);
      setSelectedVersion(null)
    })

    return () => {
      ipcRenderer.removeAllListeners('install-complete');
      ipcRenderer.removeAllListeners('game-launched');
    };
  }, []);
  const isVersionInstalled = (version) => {
    const installedModpack = installedVersions.find(installedModpack => installedModpack.id === modpack.id);
    
    if (!installedModpack || !installedModpack.versions) {
      return false;
    }

    return installedModpack.versions.some(installedVersion => installedVersion.id === version.id);
  };

  const filterVersions = () => {
    const installedModpack = installedVersions.find(installedModpack => installedModpack.id === modpack.id);

    if (installedModpack != null) {
      return installedModpack.versions;
    }
  };

  const handleSelectVersion = (ver) => {
    setSelectedVersion(ver);
  };

  const handleLaunch = () => {
    ipcRenderer.send("launch-game", selectedVersion);
    setIsInstalling(true);
  };


  return (
    <div className='modpack' key={modpack.id}>

      <div className='modpack-top-panel'>
        <div className='modpack-thumbnail-container'>
          <img className='modpack-thumbnail' src={`${uploadsUrl}${modpack.thumbnail}`} />
        </div>

        <div className='modpack-right-panel'>
          <p className='modpack-right-panel-name'> {modpack.name} </p>
          <div className='modpack-right-panel-buttons'>
            <Button
              onClick={selectedVersion ? () => handleLaunch() : () => console.log("select a version first") }
              text={isInstalling ? `${buttonText}%` : "play"}
              style={{width: "14vw", height: "9vh", borderRadius: "6px", background: "#49a749"}}
              textStyle={{color: "#fff", fontSize: "30px", fontWeight: "bold", fontVariant: "small-caps"}} />
            <Button
              onClick={() => console.log("button clicked222!")}
              text={"..."}
              style={{width: "8vw", height: "9vh", borderRadius: "4px", background: "var(--accent-color)"}}
              textStyle={{color: "#000", fontSize: "30px", fontWeight: "bold", fontVariant: "small-caps"}} />
            <DropDown
              options={filterVersions()}
              dropDownBoxStyle={{width: "12vw", height: "1vh", borderRadius: "4px", background: "var(--accent-color)"}}
              selectedVersion={selectedVersion}
              setSelectedVersion={setSelectedVersion} 
            />
          </div>
          {isInstalling && (
            <ProgressBar setButtonText={setButtonText} />
          )}
        </div>

      </div>

      <div className='modpack-versions-header'>
        <p className='modpack-versions-header-text'> Versions </p>
      </div>

      <div className='modpack-versions-container'>
        {modpack.versions && (
          modpack.versions.map(version => (
            <Version
              version={version} 
              modpack={modpack} 
              installVersion={installVersion} 
              isInstalled={isVersionInstalled(version)}
              fetchData={fetchData}
              handleSelectVersion={handleSelectVersion}
              key={version.id}
            />
          ))
        )}

      </div>

    </div>
  )
};

export default Modpack;