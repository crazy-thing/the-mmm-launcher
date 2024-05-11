import { useEffect, useState } from 'react'
import './App.scss'
import LoadingScreen from './components/LoadingScreen';
import SidePanel from './containers/SidePanel';
import { getAllModpacks } from './util/api';
import Settings from './containers/Settings';
import MainPanel from './containers/MainPanel';

function App() {
  const { ipcRenderer } = window.require('electron');

  const [isLoading, setIsLoading] = useState(true);

  const [allInstalledVersions, setAllInstalledVersions] = useState([]);
  const [allModpacks, setAllModpacks] = useState([]);
  const [selectedModpack, setSelectedModpack] = useState(null);

  const [noChange, setNoChange] = useState(false);
  const [settingPos, setSettingPos] = useState("-20%");

  const fetchData = async () => {
    try {
      const modpacks = await getAllModpacks();
      setAllModpacks(modpacks);
      if (selectedModpack == null) {
        const lastSelectedModpackId = JSON.parse(localStorage.getItem("lastSelectedModpack"));
        if (lastSelectedModpackId != null) {
          const modpackToSelect = modpacks.find(modpack => modpack.id === lastSelectedModpackId);
          if (modpackToSelect) {
            setSelectedModpack(modpackToSelect);
          }
        } else {
          setSelectedModpack(modpacks[0]);
        }
      }
  
      ipcRenderer.send('get-installed-versions');
    } catch (error) {
      console.error(`An error occurred fetching data ${error}`);
    }
  };

  const handleSelectModpack = (modpack) => {
    if (noChange) {
      ipcRenderer.send('show-error', "Please wait until install has finished");
    } else if (selectedModpack.id === modpack.id) {
      console.log("Modpack already selected");
    } else {
      setSelectedModpack(modpack);
      localStorage.setItem('lastSelectedModpack', JSON.stringify(modpack.id));
      console.log("Selected Modpack: ", modpack);
    }
  };

  const changeSettingPos = (pos) => {
    setSettingPos(`${pos}%`);
  };

  const handleSetNoChange = (b) => {
    setNoChange(b);
  };

  useEffect(() => {

    fetchData();
    ipcRenderer.on('installed-versions', (event, versions) => {
      handleSetNoChange(false);
      setAllInstalledVersions(versions);
      setIsLoading(false);
    });


    return () => {
      ipcRenderer.removeAllListeners('installed-versions');
    };

  }, []);

  return (
    <div className='mml'>

      {isLoading && (
        <LoadingScreen />
      )}

      <MainPanel modpack={selectedModpack} fetchData={fetchData} handleSetNoChange={handleSetNoChange} noChange={noChange} />

      <SidePanel changeSettingPos={changeSettingPos} handleSelectModpack={handleSelectModpack} modpacks={allModpacks} />

      <Settings pos={settingPos} changeSettingPos={changeSettingPos} />


    </div>
  )
}

export default App
