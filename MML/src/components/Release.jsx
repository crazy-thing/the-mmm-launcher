import React from 'react';
import '../styles/componentStyles/Release.scss';

const Release = ({ version }) => {
  return (
    <div className='release'>
        <p className='release-version'> v{version.name} </p>
        <div className='release-changelog' dangerouslySetInnerHTML={{__html: version.changelog }}/>
    </div>
  )
};

export default Release;