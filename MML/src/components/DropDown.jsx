import React, { useEffect, useRef, useState } from 'react';
import '../styles/componentStyles/DropDown.scss';
import { carretDown } from '../assets/exports';

const DropDown = ({handleDeleteModpack, update}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropDownRef = useRef(null);

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
        <div className={`dropdown ${isOpen ? 'open' : ''} dropdown ${update ? 'update' : ''}`} ref={dropDownRef} onClick={() => setIsOpen(!isOpen)}>
            <img src={carretDown} className={`dropdown-carret-down ${isOpen ? 'open' : '' }`} />
            <div className={`dropdown-options ${isOpen ? 'open' : ''}`}>
                    <div
                        className={`dropdown-options-option`}
                        onClick={() => handleDeleteModpack()}
                    >
                        UNINSTALL?
                    </div>
                </div>
        </div>
    );
};

export default DropDown;