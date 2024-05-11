import React, { useEffect, useState } from 'react';
import '../styles/componentStyles/SettingsOption.scss';

const SettingsOption = ({ options, handleChangeSetting, selected }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    console.log(selected);
    setSelectedOption(selected);
  }, [selected]);

  const toggleOption = (index) => {
    if (selectedOption === index) {
      setSelectedOption(null);
      handleChangeSetting(options[index], false);
    } else {
      setSelectedOption(index);
      options.forEach((option, i) => {
        if (i !== index) {
          handleChangeSetting(option, false);
        } else {
          handleChangeSetting(option, true);
        }
      });
    }
  };

  return (
    <div className='settings-option-container'>
      {options.map((option, index) => (
        <div key={index} className='settings-option'>
          <svg
            width="20"
            height="20"
            viewBox='0 0 100 100'
            onClick={() => toggleOption(index)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="50" cy="50" r="45" fill='#fff' />
            {selectedOption === index && <circle cx="50" cy="50" r="20" fill='#000' />}
          </svg>
          <p className='settings-option-text'>{option}</p>
        </div>
      ))}
    </div>
  );
};

export default SettingsOption;