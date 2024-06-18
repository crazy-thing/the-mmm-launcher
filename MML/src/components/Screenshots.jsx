import React from 'react';
import '../styles/componentStyles/Screenshots.scss';

const Screenshots = ({ screenshots, onClick }) => {
    const renderScreenshots = () => {
        const rows = [];
        for (let i = 0; i < screenshots.length; i+= 3 ) {
            const rowScreenshots = screenshots.slice(i, i + 3);
            rows.push(
                <div className='screenshots-row' key={`row-${i}`}>
                    {rowScreenshots.map((screenshot, index) => (
                        <img
                            key={`screenshot-${i}-${index}`}
                            className='screenshots-screenshot'
                            src={`https://minecraftmigos.me/uploads/${screenshot}`}
                            alt={`Screenshot ${i + index}`}
                            onClick={() => onClick(i + index)}
                        />
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