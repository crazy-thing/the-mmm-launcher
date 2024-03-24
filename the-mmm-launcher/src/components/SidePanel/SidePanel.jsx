import React, { useEffect, useState } from 'react';
import './sidepanel.css';
import Button from '../Button/Button';
import { settingIcon } from '../../assets/exports';

const SidePanel = ({ changeSettingPos }) => {
  const { ipcRenderer } = window.require('electron');

  const [ profile, setProfile ] = useState(null);


  useEffect(() => {
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



  const getDefaultAccount = () => {
    ipcRenderer.send('get-default-account');
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
  }, []);

  return (
    <div className='sidepanel'>
      <div className='sidepanel-content'>
      <div className='sidepanel-content-profile-picture'>
        {profile && (
        <img className='sidepanel-content-profile-picture-img' src={profile.ProfilePicture} alt='Profile Picture' />
        )}
      </div>
      <div className='sidepanel-content-profile-name'>
        <p className='sidepanel-content-profile-name-text'> {profile ? profile.GamerTag : ''} </p>
      </div>
      <Button
        onClick={profile ? () => handleSignOut(profile.GamerTag) : () => handleSignIn()}
        text={profile ? "Sign Out" : "Sign In"}
        style={{ width: "8vw", height: "3vw", background: "var(--accent-color)"}}
        textStyle={{ fontSize: "16px", color: "#000"}}/>
      </div>
      <img className='sidepanel-setting' src={settingIcon} onClick={() => changeSettingPos("0")} />
    </div>
  )
};

export default SidePanel;