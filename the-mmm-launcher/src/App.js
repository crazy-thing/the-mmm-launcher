import './App.css';

// import MainPanel from './components/MainPanel/MainPanel';
import SidePanel from './components/SidePanel/SidePanel';
import ModpacksSide from './components/ModpacksSide/ModpacksSide';
import MainView from './components/MainView/MainView';
import { useEffect, useState } from 'react';
import { getAllModpacks } from './util/apiCalls';
import Settings from './components/Settings/Settings';

// UI State
// Selected Versions
// Selected Modpack


function App() {
  const { ipcRenderer } = window.require('electron');
  const [allModpacks, setAllModpacks] = useState([]);
  const [allInstalledVersions, setAllInstalledVersions] = useState([]);
  const [selectedModpack, setSelectedModpack] = useState(null);
  const [noChange, setNoChange] = useState(false);
  const [settingPos, setSettingPos] = useState("-18%");

  useEffect(() => {

    fetchData();
    
    ipcRenderer.on('installed-versions', (event, versions) => {
      handleSetNoChange(false);
      setAllInstalledVersions(versions);
    });

    return () => {
      ipcRenderer.removeAllListeners('installed-versions');
    };

  }, []);

  const fetchData = async () => {
    try {
      const modpacks = await getAllModpacks();
      setAllModpacks(modpacks);
      if (selectedModpack == null) {
        const lastSelectedModpack = JSON.parse(localStorage.getItem("lastSelectedModpack"));
        if (lastSelectedModpack != null) {
          setSelectedModpack(lastSelectedModpack);
        } else {
          setSelectedModpack(modpacks[0]);
        }
      }

      ipcRenderer.send('get-installed-versions');
    } catch (error) {
      console.error(`An error occurred fetching data ${error}`);
    }
  };

  const changeSettingPos = (pos) => {
    setSettingPos(`${pos}%`);
  };

  const handleSetNoChange = (b) => {
    console.log(b);
    setNoChange(b);
  };

  const handleSelectModpack = (modpack) => {
    if (noChange) {
      ipcRenderer.send('show-error', "Please wait until install has finished");
    } else {
      setSelectedModpack(modpack);
      localStorage.setItem('lastSelectedModpack', JSON.stringify(modpack));
      console.log("Selected Modpack: ", modpack);
    }
  };

  return (
    <div className="App">
      {/* <MainPanel /> */}

      <ModpacksSide modpacks={allModpacks} handleSelectModpack={handleSelectModpack} />

      <MainView
        modpack={selectedModpack}
        installedVersions={allInstalledVersions}
        fetchData={fetchData}
        handleSetNoChange={handleSetNoChange}
      />

      <SidePanel changeSettingPos={changeSettingPos} />

      <Settings pos={settingPos} changeSettingPos={changeSettingPos} />

     </div>
  );
}

export default App;
