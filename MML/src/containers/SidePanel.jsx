import React, { useEffect, useState } from 'react';
import '../styles/containerStyles/SidePanel.scss';
import { settingIcon } from '../assets/exports';
import Button from '../components/Button';
import Modpacks from '../components/Modpacks';

const SidePanel = ({ pos, changeSettingPos, handleSelectModpack, modpacks }) => {
    const { ipcRenderer } = window.require('electron');

    const [ profile, setProfile ] = useState(null);

    const getDefaultAccount = () => {
        ipcRenderer.send('sign-in');
      };
    
    const handleSignIn = async () => {
    ipcRenderer.send('sign-in');
    };

    const handleSignOut = async (gamerTag) => {
    ipcRenderer.send('sign-out', gamerTag);
    setProfile(null);
    };

    useEffect(() => {

        getDefaultAccount();

        ipcRenderer.on('sign-in-reply', (event, result) => {
          console.log(result);
          setProfile(result);
        });
      
        ipcRenderer.on('default-account-reply', (event, result) => {
          console.log(result);
          setProfile(result);
        });
    
        return () => {
          ipcRenderer.removeAllListeners('sign-in-reply');
          ipcRenderer.removeAllListeners('default-account-reply');
        };

      }, []);

  return (
    <div className='side-panel' style={{right: pos}} >

      <img className='side-panel-setting' src={settingIcon} onClick={() => changeSettingPos("0")} />

      <div className='side-panel-content'>

        <div className='side-panel-content-profile-picture'>
          {profile && (
          <img className='side-panel-content-profile-picture-img' src={profile.ProfilePicture} alt='Profile Picture' />
          )}
        </div>
        {profile ? (
          <>
          <div className='side-panel-content-profile-name'>
            <p className='side-panel-content-profile-name-text'> {profile ? profile.GamerTag : ''} </p>
          </div>

          <Button
            onClick={profile ? () => handleSignOut(profile.GamerTag) : () => handleSignIn()}
            text={profile ? "Sign Out" : "Sign In"}
            style={{ width: "7vw", height: "2.1vw", background: "var(--accent-color)"}}
            textStyle={{ fontSize: "1.85vh", color: "#000", fontFamily: "var(--font-family-secondary"}}/>
          </>
        ) : (
          <Button
            onClick={profile ? () => handleSignOut(profile.GamerTag) : () => handleSignIn()}
            text={profile ? "Sign Out" : "Sign In"}
            style={{ width: "7vw", height: "2.1vw", background: "var(--accent-color)"}}
            textStyle={{ fontSize: "15px", color: "#000", fontFamily: "var(--font-family-secondary"}}/>
        )}

      </div>

      <Modpacks handleSelectModpack={handleSelectModpack} modpacks={modpacks} />

    </div>
  )
};

export default SidePanel;