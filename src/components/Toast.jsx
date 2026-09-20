import { useEffect, useState } from 'react';

export default function Toast({
    message,
    type = 'info',       
    title = null,
    duration = 3000,
    onClose,
}) {
    const [removing, setRemoving] = useState(false);

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
    };

    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
    };

    const finalTitle = title || defaultTitles[type] || 'Information';
    const iconClass = icons[type] || icons.info;

    const close = () => {
        setRemoving(true);
        setTimeout(() => onClose?.(), 250);
    };

    useEffect(() => {
        if (!duration || duration <= 0) return;
        const t = setTimeout(close, duration);
        return () => clearTimeout(t);
    }, [duration]);

    return (
        <div className={`toast toast-${type} ${removing ? 'toast-removing' : ''}`} onClick={close}>
            <div className="toast-icon">
                <i className={iconClass}></i>
            </div>
            <div className="toast-content">
                <div className="toast-title">{finalTitle}</div>
                <div className="toast-message">{message}</div>
            </div>
            <button
                className="toast-close"
                onClick={(e) => {
                    e.stopPropagation();
                    close();
                }}
                aria-label="Close"
            >
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
}