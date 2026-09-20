import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div className="modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <svg className="icon-svg" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}