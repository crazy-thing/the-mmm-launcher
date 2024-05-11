import React from 'react';
import '../styles/componentStyles/Button.scss';

const Button = ({ onClick, text, style, textStyle }) => {

  return (
    <div className='button' onClick={onClick} style={style}>
        <p style={textStyle}> {text} </p>
    </div>
  )
};

export default Button;