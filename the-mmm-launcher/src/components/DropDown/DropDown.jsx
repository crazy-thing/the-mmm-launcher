import React, { useEffect, useRef, useState } from 'react';
import './dropdown.css';

const DropDown = ({ options = [], dropDownBoxStyle, selectedVersion, setSelectedVersion }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(selectedVersion);
    const dropDownRef = useRef(null);

    const handleOptionsClick = (option) => {
        setSelectedVersion(option);
        setValue(option.name);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className={`dropdown ${isOpen ? 'open' : ''}`} style={dropDownBoxStyle} ref={dropDownRef} onClick={() => setIsOpen(!isOpen)}>
            <div className='dropdown-selected-option' >
                {selectedVersion && selectedVersion.name || 'Select a version'}
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}> &#9660; </span>
            </div>
            <div className={`dropdown-options ${isOpen ? 'open' : ''}`}>
                {options.map((option) => (
                    <p
                        key={option.name}
                        className={`dropdown-options-option`}
                        onClick={() => handleOptionsClick(option)}
                    >
                        {option.name}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default DropDown;