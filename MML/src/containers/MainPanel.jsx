import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/MainPanel.scss';
import Button from '../components/Button';
import DropDown from '../components/DropDown';
import ConfirmDelete from '../components/ConfirmDelete';
import Changelog from '../components/Changelog';
import Screenshots from '../components/Screenshots';
import { folderIcon, trashIcon } from '../assets/exports';
import PreloadImages from '../components/PreloadImages';
import ScreenshotViewer from '../components/ScreenshotViewer';

const MainPanel = ({ modpack, fetchData, noChange, handleSetNoChange, style  }) => {

  const {ipcRenderer} = window.require('electron');

  const [isInstalling, setIsInstalling] = useState(false);
  const [buttonText, setButtonText] = useState('play');
  const [installText, setInstallText] = useState('');
  const [progress, setProgress] = useState(100);

  const [verInstalling, setVerInstalling] = useState(null);
  const [installedVersion, setInstalledVersion] = useState(null);

  const [update, setUpdate] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [showDel, setShowDel] = useState(false);

  const [isOverflowing, setIsOverflowing] = useState(false);

  const [index, setIndex] = useState(null);

  const [slideDirection, setSlideDirection] = useState('in');
  const [slideAni, setSlideAni] = useState('');


  const openViewer = (index) => {
    setIndex(index);
  };

  const closeViewer = () => {
    setIndex(null);
  };

  const nextScreenshot = (e) => {
    e.stopPropagation();

    setIndex((prevIndex) => (prevIndex + 1) % modpack.screenshots.length);
  };

  const prevScreenshot = (e) => {
    e.stopPropagation();

    setIndex((prevIndex) => (prevIndex - 1 + modpack.screenshots.length) % modpack.screenshots.length);
  };

  const noVersionError = () => {
    ipcRenderer.send('show-error', "Please select a version before launching!");
  };

  const handleOpenFolder = () => {
    ipcRenderer.send('open-folder', modpack.id);
  };

  const handleProg = (prog, progText) => {
    if (prog != null) {
      setButtonText(prog);
      setProgress(prog);
      setInstallText(progText);
    }
  };

  const handleChangeItem = (item) => {
    if (selectedItem === item) return;

    setSlideAni('transform 0.225s ease');
    if (selectedItem === "screenshots" && item === "changelog") {
      setSlideDirection("-110%"); // Exit to left    
    } else if (selectedItem === "changelog" && item === "screenshots") {
      setSlideDirection("110%"); // Exit to right
    }
    setTimeout(() => {
      setSlideAni(null);
      if (item === "screenshots") {
        setSlideDirection("-110%"); // Enter from left
      } else if (item === "changelog") {
        setSlideDirection("110%"); // Enter from right
      }
      setTimeout(() => {
        setTimeout(() => {
          setSlideAni('transform 0.225s ease');
          setSlideDirection("0%");
          setSelectedItem(item);
        }, 15);
      }, 0);
    }, 112);
  };

  const handleOverflowCheck = () => {
    const checkElements = () => {
        const nameElement = document.querySelector('.main-panel-content-top-right-name');
        const parentElement = nameElement?.parentElement;
        if (nameElement && parentElement) {
            const nameRect = nameElement.getBoundingClientRect();
            const parentRect = parentElement.getBoundingClientRect();
            if (nameRect.width === parentRect.width) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
                console.log(nameRect.width);
            }
        } else {
            setTimeout(checkElements, 1); 
        }
    };

    checkElements();
};
  const handleInstallModpack = (modpack) => {
    setUpdate(false);
    setIsInstalling(true);
    setVerInstalling(modpack.mainVersion);
    handleSetNoChange(true);
    ipcRenderer.send('download-modpack', JSON.stringify(modpack));
    setSelectedItem("changelog");
  };

  const handleDeleteModpack = () => {
    setShowDel(true);
  };

  const handleConfirmed = (confirmed) => {
    if (confirmed) {
      console.log(modpack.id);
      ipcRenderer.send('delete-modpack', modpack.id);
      localStorage.removeItem(`lastInstalledVersion${modpack && modpack.id}`);
    }
    setShowDel(false);
  };

  const handleLaunch = () => {
    if (installedVersion) {
      console.log("Launching game");
      ipcRenderer.send("launch-game", modpack.id);
      setIsInstalling(true);
      handleSetNoChange(true);
    }
  };

  useEffect(() => {

    setIsOverflowing(false);
    
    handleOverflowCheck();

    setUpdate(false);
    setInstalledVersion(null);
    const lastInstalledVersion = JSON.parse(localStorage.getItem(`lastInstalledVersion${modpack && modpack.id}`));
    if (lastInstalledVersion && modpack && modpack.mainVersion.id === lastInstalledVersion.id ) {
      setInstalledVersion(lastInstalledVersion);
      console.log(`Installed version found ${lastInstalledVersion}`);
    } else {
      if (lastInstalledVersion != null) {
        setUpdate(true);
        console.log("set update true");
      }
      console.log("No or wrong version installed. Either update or confirm item is installed");
    }

    setSelectedItem("screenshots");
  }, [modpack]);

  useEffect(() => {
    
    ipcRenderer.on('install-complete', (event) => {
      localStorage.setItem(`lastInstalledVersion${modpack && modpack.id}`, JSON.stringify(modpack.mainVersion)); // could cause all modpacks to set one version as installed version
      setInstalledVersion(modpack.mainVersion);
      setIsInstalling(false);
      setVerInstalling(null);
      handleSetNoChange(false);
      setProgress(100);
      fetchData();
    });

    ipcRenderer.on('game-launched', (event) => {
      setIsInstalling(false);
      handleSetNoChange(false);
    });

    ipcRenderer.on('uninstall-complete', (event) => {
      fetchData();
      setInstalledVersion(null);
      setVerInstalling(null);
    });

    ipcRenderer.on('update-progress', (event, prog, progText) => {
      handleProg(prog, progText);
    });

      return () => {
        ipcRenderer.removeAllListeners('install-complete');
        ipcRenderer.removeAllListeners('game-launched');
        ipcRenderer.removeAllListeners('update-progress');
        ipcRenderer.removeAllListeners('uninstall-complete');
      };
    }, [modpack]);

    const renderInfo = () => {
      const slideStyle = {
        transform: `translateX(${slideDirection})`,
        transition: `${slideAni}`,
      };
      switch (selectedItem) {
        /* 
        case "description":
          return (
            <div className='parsed-content' dangerouslySetInnerHTML={{ __html: modpack.description}} />
          );
        */
        case "screenshots":
          return (
            <div style={slideStyle} className='main-panel-item-container'>
              <Screenshots screenshots={modpack.screenshots} onClick={openViewer} />
            </div>
          );
        case "changelog":
          return (
            <div style={slideStyle}>
              <Changelog versions={modpack.versions} />
            </div>
          );
        default:
          return null;
      }
    };

    const installBtnStyle = {
      width: "14vw",
      height: "9vh",
      borderRadius: "5px",
      border: `2px solid ${update ? "#1383df" : "#49a749" }`, 
      background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`
    };

    const installedBtnStyle = {
      width: "14vw",
      height: "9vh",
      borderRadius: "5px 0px 0px 5px",
      border: `2px solid ${update ? "#1383df" : "#49a749" }`, 
      background: `${update ? "#1383df" : `linear-gradient(90deg, #49a749 ${progress}%, transparent ${progress}%)`}`
    };


    return (
      <div className='main-panel'>

        {showDel && (
          <ConfirmDelete onConfirm={() => handleConfirmed(true)} onCancel={() => handleConfirmed(false)} />
        )}

        {index != null && (
          <ScreenshotViewer modpack={modpack} index={index} onClose={closeViewer} onNext={nextScreenshot} onPrev={prevScreenshot} />
        )}

        {/*
          {modpack && (
              <img className='main-panel-background' src={`https://minecraftmigos.me/uploads/${modpack.background}`} />
          )}
        */}

          {modpack && (
              <div className='main-panel-content' style={style}>
                  <div className='main-panel-content-top'>
                      <div className='main-panel-content-top-thumbnail-container'>
                          <img className='main-panel-content-top-thumbnail' src={`https://minecraftmigos.me/uploads/${modpack.thumbnail}`} />
                      </div>
  
                      <div className='main-panel-content-top-right'>
                          <p className={isOverflowing ? 'shrink-font' : 'main-panel-content-top-right-name'}> {modpack.name} </p>
                          <div className='main-panel-content-top-right-buttons'>
                            <div className='main-panel-content-top-right-buttons-button'>
                            <Button
                              onClick={installedVersion ? isInstalling ? console.log("already installing") : () => handleLaunch() : isInstalling ? console.log('already installing') : () => handleInstallModpack(modpack)} 
                              text={isInstalling ? `${buttonText}%` :  installedVersion ? "play" : update ? "update" : "install" }
                              style={installedVersion ? installedBtnStyle : update ? installedBtnStyle : installBtnStyle}
                              textStyle={{color: "#fff", fontSize: "4vh", fontWeight: "normal", fontVariant: "small-caps"}}
                              handleProg={handleProg}
                              progress={progress}
                            />
                            {installedVersion || update ? (
                                <div className='main-panel-content-top-right-buttons-button-dropdown'>
                                    <DropDown 
                                        handleDeleteModpack={handleDeleteModpack}
                                        update={update}
                                    />
                                </div>
                            ) : null}
  
                            </div>
  
                            {installedVersion && (
                              <img className='main-panel-content-top-right-buttons-delete' src={folderIcon} onClick={() => handleOpenFolder()}/>
                            )}
                            {/*  <img className='main-panel-content-top-right-buttons-delete' src={trashIcon} onClick={() => handleDeleteModpack()}/>  */}
  
                          </div>
                          {isInstalling && (
                            <p className='main-panel-content-top-right-install-text'> {installText} </p>
                          )}
                      </div>
  
                  </div>

                  <div className='main-panel-content-description-buttons' >
                          <p className={`main-panel-content-description-buttons-text ${selectedItem === "screenshots" && "selected"}`} onClick={() => handleChangeItem("screenshots")}>SCREENSHOTS</p>
                          <p className='main-panel-content-description-buttons-spacer'> / </p>
                          <p className={`main-panel-content-description-buttons-text ${selectedItem === "changelog" && "selected"}`} onClick={() => handleChangeItem("changelog")}> CHANGELOGS</p>
                  </div>

                  {/* 
                  <div className='main-panel-content-description-header'>
                    <span className='main-panel-content-description-header-text-container'>
                      <p 
                        className={`main-panel-content-description-header-text ${selectedItem === "description" && "selected"}`} 
                        onClick={() => setSelectedItem("description")}
                      >
                        DESCRIPTION
                      </p>
                    </span>

                    <span className='main-panel-content-description-header-text-container'>
                      <p 
                        className={`main-panel-content-description-header-text ${selectedItem === "screenshots" && "selected"}`} 
                        onClick={() => setSelectedItem("screenshots")}
                      >
                        SCREENSHOTS
                      </p>
                    </span>
                    <span className='main-panel-content-description-header-text-container'>
                      <p 
                        className={`main-panel-content-description-header-text ${selectedItem === "changelog" && "selected"}`} 
                        onClick={() => setSelectedItem("changelog")}
                      >
                        CHANGELOG
                      </p>
                    </span>
                </div>     
                */}

                    {selectedItem && (
                      <div className='main-panel-content-rendered-item' >
                        {renderInfo()}
                        <PreloadImages imageUrls={modpack.screenshots.map(screenshot => screenshot)} />
                      </div>
                    )}
              </div>
          )}
      </div>
    )
};

export default MainPanel;