import logo from './logo.svg';
import './App.css';
import Button from './components/Button/Button';
import MainPanel from './components/MainPanel/MainPanel';
import SidePanel from './components/SidePanel/SidePanel';

function App() {
  const { ipcRenderer } = window.require('electron');

  const handleClick = () => {
    ipcRenderer.send('fetch-modpacks');
  }

  return (
    <div className="App">
      <MainPanel />
      <SidePanel />
     </div>
  );
}

export default App;
