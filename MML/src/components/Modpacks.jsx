import React from 'react';
import '../styles/componentStyles/Modpacks.scss';

const Modpacks = ({ modpacks, handleSelectModpack }) => {
    const thumbnailsUrl = 'http://server_ip:port/uploads/';

    const renderModpacks = () => {
        return modpacks.map((modpack, index) => {
          return (
            <div className="modpacks-row" key={`row-${index}`}>
              <div className='modpacks-modpack'>
                {modpack && (
                  <img className='modpacks-modpack-thumbnail' src={`${thumbnailsUrl}${modpack.thumbnail}`} onClick={() => handleSelectModpack(modpack)} />
                )}
              </div>
            </div>
          );
        });
      };

    return (
        <div className='modpacks'>
            {modpacks.length > 0 ? (
                <>
                    {renderModpacks()}
                </>
            ) : (
                <p className='modpacks-none'> No modpacks available </p>
            )}
        </div>
    );
};

export default Modpacks;