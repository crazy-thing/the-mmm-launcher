import React from 'react';
import '../styles/componentStyles/Changelog.scss';
import Release from './Release';

const Changelog = ({ versions }) => {
  const sortedVersions = versions.sort((a, b) => {
    const getVersionNumber = version => parseInt(version.name.split('.').join(''));
    return getVersionNumber(b) - getVersionNumber(a);
  });

  return (
    <div className='changelog'>
      <p className='changelog-text'> NEWEST RELEASE: </p>
      <div className='changelog-versions'>
        {sortedVersions.map((version, index) => (
          <Release key={index} version={version} />
        ))}
      </div>
    </div>
  );
};

export default Changelog;