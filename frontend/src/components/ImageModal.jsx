function ImageModal({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'zoom-out'
      }}
    >
      <img
        src={src}
        alt="Full"
        style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '8px' }}
      />
    </div>
  );
}
export default ImageModal;