import React, { useEffect, useState } from 'react';
import './settings.css';
import SettingsOption from '../SettingsOption/SettingsOption';
import SettingsSlider from '../SettingsSlider/SettingsSlider';
import Button from '../Button/Button';
const { ipcRenderer } = window.require('electron');

const Settings = ({ pos, changeSettingPos }) => {
    const [selectedSettings, setSelectedSettings] = useState('');
    const [selectedOpt1, setSelectedOpt1] = useState('');
    const [selectedOpt2, setSelectedOpt2] = useState('');

    const optionToSettingMap = {
        "Minimize launcher to taskbar": "MinimizeLauncher",
        "Exit launcher": "ExitLauncher",
        "Run on startup": "RunOnStart",
        "Do not run on startup": "DoNotRunStart"
    };
    const opts = ["Minimize launcher to taskbar", "Exit launcher"];
    const opts2 = ["Run on startup", "Do not run on startup"];

    useEffect(() => {
    
        ipcRenderer.on('settings', (event, result) => {
            setSelectedSettings(result);
            console.log(result);
    
            let selectedOpt1Index = null;
            let selectedOpt2Index = null;
    
            for (let i = 0; i < opts.length; i++) {
                const option = opts[i];
                if (result[optionToSettingMap[option]] === true) {
                    selectedOpt1Index = i;
                    break;
                }
            }
    
            for (let i = 0; i < opts2.length; i++) {
                const option = opts2[i];
                if (result[optionToSettingMap[option]] === true) {
                    selectedOpt2Index = i;
                    break;
                }
            }
    
            setSelectedOpt1(selectedOpt1Index);
            setSelectedOpt2(selectedOpt2Index);
        });
    
        return () => {
            ipcRenderer.removeAllListeners('settings');
        };
    }, []);

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
    
        if (opts2.includes(settingName)) {
            const mappedSettingName = optionToSettingMap[settingName];
            args.push(mappedSettingName, value);
            ipcRenderer.send('change-setting', args);        
        }
    };


    return (
        <div className='settings' style={{right: pos}}>
            <div className='settings-header'>
                <p className='settings-header-text'>Settings</p>
            </div>

            <div className='settings-body'>
                <div className='settings-body-header'>
                    <p className='settings-body-header-text'>On modpack launch</p>
                </div>
                <SettingsOption options={opts} handleChangeSetting={handleChangeSetting} selected={selectedOpt1} />   

                <div className='settings-body-header'>
                    <p className='settings-body-header-text'>Startup</p>
                </div>
                <SettingsOption options={opts2} handleChangeSetting={handleChangeSetting} selected={selectedOpt2}  />

                <div className='settings-body-header'>
                    <p className='settings-body-header-text'>Allocated Memory</p>
                </div>
                <SettingsSlider handleChangeSetting={handleChangeSetting} ramValue={selectedSettings && selectedSettings.MaxMem} />
            </div>

            <div className='settings-back'>
                <Button
                    onClick={() => changeSettingPos("-18")}
                    text={"BACK"}
                    style={{width: "7vw", height: "5.5vh", borderRadius: "2px", background: "#686868"}}
                    textStyle={{color: "#fff", fontSize: "2.1vh"}}
                />
            </div>
        </div>
    );
};

export default Settings;