import { useEffect, useRef } from 'react';

const Modal = ({ refObj, onOpen, onClose = () => {}, onSubmit, children, className, disableSubmit, hideSubmit=false, ...props }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit();
        }
        onClose();
    };

    return (
        <dialog ref={refObj} className="modal">
            <div ref={modalRef} className="modal-box">
                <div>
                    <form method="dialog" onSubmit={handleSubmit}>
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
                        <div>
                            {children}
                        </div>
                        <div className="flex modal-action justify-between">
                            <div></div>
                            {!hideSubmit && (<button type="submit" className="btn btn-primary" disabled={disableSubmit}>
                                Save
                            </button>)}
                            
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default Modal;
