import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/Settings.scss';
import SettingsSlider from '../components/SettingsSlider';
import SettingsOption from '../components/SettingsOption';
import { backIcon, github, globe, mml } from '.././assets/exports';

const { ipcRenderer } = window.require('electron');

const Settings = ({ pos, changeSettingPos }) => {
    const [selectedSettings, setSelectedSettings] = useState('');
    const [selectedOpt1, setSelectedOpt1] = useState('');

    const optionToSettingMap = {
        "Minimize launcher to taskbar": "MinimizeLauncher",
        "Exit launcher": "ExitLauncher",
    };
    const opts = ["Minimize launcher to taskbar", "Exit launcher"];

    const openWebsite = (url) => {
        ipcRenderer.send("open-website", url);
    };

    useEffect(() => {

        fetchSettings();
    
        ipcRenderer.on('settings', (event, result) => {
            setSelectedSettings(result);
            console.log(result);
    
            let selectedOpt1Index = null;    
            for (let i = 0; i < opts.length; i++) {
                const option = opts[i];
                if (result[optionToSettingMap[option]] === true) {
                    selectedOpt1Index = i;
                    break;
                }
            }
    
    
            setSelectedOpt1(selectedOpt1Index);
        });
    
        return () => {
            ipcRenderer.removeAllListeners('settings');
        };

    }, []);

    const fetchSettings = async () => {
        ipcRenderer.send("get-settings");
    };

    const handleChangeSetting = (settingName, value) => {
        console.log(`Changing ${settingName} to ${value}`);
    

        let args = [];

        if (settingName === "MaxMem") {
            args.push("MaxMem", value);
            ipcRenderer.send('change-setting', args);
        }

        if (opts.includes(settingName)) {
            const mappedSettingName = optionToSettingMap[settingName];
            args.push(mappedSettingName, value);
            ipcRenderer.send('change-setting', args);
        }
    
    };


    return (
        <div className='settings' style={{right: pos}}>
            <div className='settings-header'>
                <p className='settings-header-text'>Settings</p>
                <img className='settings-header-back' src={backIcon} onClick={() => changeSettingPos("-20")} />

            </div>

            <div className='settings-body'>
                <div className='settings-body-header'>
                    <p className='settings-body-header-text'>On Modpack Launch</p>
                </div>
                <SettingsOption options={opts} handleChangeSetting={handleChangeSetting} selected={selectedOpt1} />   


                <div className='settings-body-header'>
                    <p className='settings-body-header-text'>Allocated Memory</p>
                </div>
                <SettingsSlider handleChangeSetting={handleChangeSetting} ramValue={selectedSettings && selectedSettings.MaxMem} />
            </div>

            <div className='settings-mml'>
                <img className='settings-mml-icon' src={mml} />
                <div className='settings-mml-info'>
                    <p className='settings-mml-info-text'> Minecraft Migos Launcher 1.0.1 </p>
                    <img className='settings-mml-info-website ' src={globe} onClick={() => openWebsite("https://minecraftmigos.netlify.app/") } />
                    <img className='settings-mml-info-website ' src={github} onClick={() => openWebsite("https://github.com/crazy-thing/the-mmm-launcher") } />
                </div>
            </div>
         </div>
    );
};

export default Settings;