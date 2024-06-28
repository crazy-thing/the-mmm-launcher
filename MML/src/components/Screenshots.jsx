import React from 'react';
import '../styles/componentStyles/Screenshots.scss';
import { fullscreen } from '../assets/exports';

const Screenshots = ({ screenshots, onClick }) => {
    const renderScreenshots = () => {
        const rows = [];
        const totalScreenshots = screenshots.length;
        const placeholdersCount = 3 - (totalScreenshots % 3 === 0 ? 3 : totalScreenshots % 3); // Calculate how many placeholders are needed

        for (let i = 0; i < totalScreenshots; i += 3) {
            const rowScreenshots = screenshots.slice(i, i + 3);
            rows.push(
                <div className='screenshots-row' key={`row-${i}`}>
                    {rowScreenshots.map((screenshot, index) => (
                        <div className="screenshot-container" key={`screenshot-container-${i}-${index}`}>
                            <img
                                key={`screenshot-${i}-${index}`}
                                className='screenshots-screenshot'
                                src={`https://minecraftmigos.me/uploads/${screenshot}`}
                                alt={`Screenshot ${i + index}`}
                            />
                            <img 
                                src={fullscreen}
                                className="screenshot-icon"
                                onClick={() => onClick(i + index)}
                            />
                        </div>
                    ))}
                    {i >= totalScreenshots - 3 && Array.from({ length: placeholdersCount }).map((_, placeholderIndex) => (
                        <div className="screenshot-container placeholder" key={`placeholder-${placeholderIndex}`}>
                            <div className="placeholder-content"></div>
                        </div>
                    ))}
                </div>
            )
        }
        return rows;
    }

    return (
        <div className='screenshots'>
            {renderScreenshots()}
        </div>
    )
};

export default Screenshots;