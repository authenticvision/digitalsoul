import { useEffect, useRef, useState } from 'react';

const MobilePreviewModal = ({ isOpen, onClose, url }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="iphone-frame" ref={modalRef}>
        <div className="iphone-notch"></div>
        <button className="btn btn-sm btn-circle btn-ghost absolute -right-12 -top-5" onClick={onClose}>✕</button>
        <iframe
          src={url}
          className="w-full h-full border-none rounded-lg"
          title="Page Content"
        ></iframe>
      </div>
    </div>
  );
};

// A simple mobile preview, clicking on the children elements opens the modal
const MobilePreview = ({url, children, ...props}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState(url);

  const openModal = () => {
    setModalUrl(url); // Set the URL of the page you want to display in the iframe
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUrl('');
  };

  return (
    <div>
      <div onClick={openModal}>{children}</div>
      <MobilePreviewModal isOpen={isModalOpen} onClose={closeModal} url={modalUrl} />
    </div>
  );
}


export default MobilePreview;
