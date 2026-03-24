import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const confirmButtonClass = variant === 'success' 
        ? styles.confirmButtonSuccess 
        : styles.confirmButton;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <AlertTriangle size={32} />
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.message}>{message}</p>
                    {itemName && (
                        <div className={styles.itemName}>
                            <span>"{itemName}"</span>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={confirmButtonClass} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
