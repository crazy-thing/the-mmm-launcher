import React, { useEffect, useState } from 'react';
import './navbar.css';

const NavBar = ({ modpacks, handleSelectModpack }) => {

  const thumbnailsUrl = 'http://127.0.0.1:3001/uploads/';

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) {
      const transDelay = setTimeout(() => {
        resetScroll();
      }, 400);
      return () => clearTimeout(transDelay);
    }
  }, [expanded]);

  const resetScroll = () => {
    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) {
      navbarElement.scrollTop = 0;
    }
  };

  const renderModpackRows = (modpacks) => {
    const rows = [];
    for (let i = 0; i < modpacks.length; i += 6) {
      rows.push(modpacks.slice(i, i + 6));
    }
    return (
      <div className='navbar-modpacks-container'>
        {rows.map((row, rowIndex) => (
          <div className='navbar-modpacks-row' key={`row-${rowIndex}`}>
            {row.map((modpack, index) => (
              renderModpack(modpack, index + rowIndex * 6)
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderModpack = (modpack, index) => {
    return (
      <div className='navbar-modpack' key={`modpack-${index}`}>
        <img className='navbar-modpack-thumbnail' src={`${thumbnailsUrl}${modpack.thumbnail}`} alt={`Modpack ${index}`} onClick={() => handleSelectModpack(modpack)} />
      </div>
    );
  };

  return (
    <div className='navbar' onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      {modpacks.length > 0 ? (
        renderModpackRows(modpacks)
      ) : (
        <p className='navbar-modpacks-none'>No modpacks available</p>
      )}
    </div>
  );
};


export default NavBar;