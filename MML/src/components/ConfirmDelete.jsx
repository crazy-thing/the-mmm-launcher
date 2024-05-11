import React from 'react';
import '../styles/componentStyles/ConfirmDelete.scss';

const ConfirmDelete = ({ onConfirm, onCancel}) => {

    return (
        <div className='popup-overlay'>
            <div className='confirm-delete'>
                <p className='confirm-delete-header'>Confirm Deletion</p>
                <p className='confirm-delete-body'>Are you sure you want to permanently delete this item?</p>
                <div className='confirm-delete-buttons'>
                    <div className='confirm-delete-button' onClick={onCancel} style={{background: "transparent"}}>
                        <p className='confirm-delete-button-text'> Cancel</p>
                    </div>
                    <div className='confirm-delete-button' onClick={onConfirm} style={{background: "red"}}>
                        <p className='confirm-delete-button-text'> Delete</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConfirmDelete;