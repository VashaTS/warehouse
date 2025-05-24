import './../App.css';

function ImageModal({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      className='modal-overlay'
    >
      <img
        src={src}
        alt="Full"
        className='modal-image'
      />
    </div>
  );
}
export default ImageModal;