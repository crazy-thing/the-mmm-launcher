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
  const [nextModpack, setNextModpack] = useState(null);

  const [noChange, setNoChange] = useState(false);
  const [settingPos, setSettingPos] = useState("-20%");
  const [sidePanelPos, setSiePanelPos] = useState("0%");

  const [animation, setAnimation] = useState(null);
  const [mpAnimation, setMpAnimation] = useState(null);


  const fetchData = async () => {
    try {
      const modpacks = await getAllModpacks();
      const sortedModpacks = modpacks.sort((a, b) => {
        const indexA = a.index ? Number(a.index) : Infinity;
        const indexB = b.index ? Number(b.index) : Infinity;
        return indexA - indexB;
      });
      setAllModpacks(sortedModpacks);
    
      if (selectedModpack == null) {
        const lastSelectedModpackId = JSON.parse(localStorage.getItem("lastSelectedModpack"));
        if (lastSelectedModpackId != null) {
          const modpackToSelect = modpacks.find(modpack => modpack.id === lastSelectedModpackId);
          if (modpackToSelect != null) {
            setSelectedModpack(modpackToSelect);
          } else {
            setSelectedModpack(modpacks[0]);

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
    setAnimation(null);
    if (noChange) {
      ipcRenderer.send('show-error', "Please wait until install has finished");
    } else if (selectedModpack.id === modpack.id) {
      console.log("Modpack already selected");
    } else {
        setNextModpack(modpack);
        setAnimation("fade .6s ease-in-out infinite alternate");
        setMpAnimation({opacity: "0"});
        setTimeout(() => {
          setAnimation(null);
          setMpAnimation({opacity: "1"});
          setSelectedModpack(modpack);
          localStorage.setItem('lastSelectedModpack', JSON.stringify(modpack.id));
          console.log("Selected Modpack: ", modpack);
        }, 300);

      };

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

  useEffect(() => {
    let timer;
    if (settingPos === "0%") {
      timer = setTimeout(() => setSiePanelPos("-20%"), 300);
    } else {
      setSiePanelPos("0%");
    }

    return () => clearTimeout(timer);
  }, [settingPos]);

  const animationStyle = {
    animation: animation
  }

  return (

    <div className='mml'>
    {selectedModpack && (
      <div className='app-background-container'>
        <img className={`app-background-next`} src={`https://minecraftmigos.me/uploads/${nextModpack && nextModpack.background}`} />
        <img className={`app-background`} style={animationStyle}  src={`https://minecraftmigos.me/uploads/${selectedModpack && selectedModpack.background}`} />
      </div>
    )}
      {isLoading && (
        <LoadingScreen />
      )}

      <MainPanel modpack={selectedModpack} fetchData={fetchData} handleSetNoChange={handleSetNoChange} noChange={noChange} style={mpAnimation} />

      <SidePanel pos={sidePanelPos} changeSettingPos={changeSettingPos} handleSelectModpack={handleSelectModpack} modpacks={allModpacks} />

      <Settings pos={settingPos} changeSettingPos={changeSettingPos} />


    </div>    
  )
}

export default App
