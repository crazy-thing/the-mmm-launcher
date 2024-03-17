import React, {useEffect, useState} from 'react';
import './mainpanel.css';
import NavBar from '../NavBar/NavBar';
import Modpack from '../Modpack/Modpack';
import { getAllModpacks } from '../../util/apiCalls';
import { mcStockVid } from '../../assets/exports';
const { ipcRenderer } = window.require('electron');

const MainPanel = () => {
  const [allModpacks, setAllModpacks] = useState([]);
  const [allInstalledVersions, setAllInstalledVersions] = useState([]);
  const [selectedModpack, setSelectedModpack] = useState(null);


  useEffect(() => {
    fetchData();

    ipcRenderer.on('installed-versions', (event, installedVersions) => {
      setAllInstalledVersions(installedVersions);
      console.log(installedVersions);
    });

  }, []);

  const fetchData = async () => {
    const modpacks = await getAllModpacks();
    setAllModpacks(modpacks);
    if (selectedModpack == null) {
      setSelectedModpack(modpacks[0]);
    }
    ipcRenderer.send("get-installed-versions");
    console.log("sending request for installed versions");
  };

  const handleInstallVersion = (version, modpack) => {
    const args = [version.id, JSON.stringify(modpack)];
    console.log(modpack);
    ipcRenderer.send('download-version', args);
  };

  const handleSelectModpack = (modpack) => {
    setSelectedModpack(modpack);
    console.log("Selected Modpack: ", modpack);
  };

  return (
    <div className='mainpanel'>
      <video autoPlay loop muted playsInline id="mainpanel-background">
        <source src={mcStockVid} type='video/mp4' />
      </video>
      <div className='mainpanel-content'>
      <NavBar
        modpacks={allModpacks}
        handleSelectModpack={handleSelectModpack}
      />
      {selectedModpack && (
        <Modpack 
          modpack={selectedModpack} 
          installVersion={handleInstallVersion} 
          installedVersions={allInstalledVersions}
          fetchData={fetchData}
        />
      )}

      </div>
    </div>
  )
};

export default MainPanel;