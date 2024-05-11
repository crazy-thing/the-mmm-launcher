import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/SettingsSlider.scss';

const SettingsSlider = ({ handleChangeSetting, ramValue }) => {
    const [ramValueMB, setRamValueMB] = useState(8192);

    useEffect(() => {
        setRamValueMB(ramValue);
    }, [ramValue]);

    useEffect(() => {
        const track = document.querySelector('.settings-slider-slide-bar');
        const percent = ramValueMB / 32968 * 100;
        track.style.background = `linear-gradient(to right, #e2e2e2 0%, #e2e2e2 ${percent}%, #2e2e2e ${percent}%, #2e2e2e 100%)`;
        
    }, [ramValueMB]);

    const handleInputChange = (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value)) {
            setRamValueMB('');
        } else {
            if (value > 32768) {
                value = 32768;
            }
            setRamValueMB(value);
        }
    };
 
    const handleSliderChange = (e) => {
        handleChangeSetting("MaxMem", e.target.value);
        setRamValueMB(parseInt(e.target.value));
    };

  return (
    <div className='settings-slider'>
        <input
            type='range'
            id='ramSlider'
            className='settings-slider-slide-bar'
            value={ramValueMB}
            onChange={handleSliderChange}
            min={256}
            max={32768}
            step={256}
            style={{width: "92%", color: "#fff"}}
        />
        <div className="settings-slider-input-container">
            <input
                type='text'
                id='ramInput'
                className='settings-slider-input'
                value={ramValueMB}
                onChange={handleInputChange}
                min={256}
                max={32768}
            />
            <p className="settings-slider-text">MB</p>
        </div>

    </div>
  )
};

export default SettingsSlider;