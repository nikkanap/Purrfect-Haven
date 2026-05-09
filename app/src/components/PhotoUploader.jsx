// reusable photo uploader with previews.
// gagamitin sa welfare check modal at story modals (both adopter at admin).
//
// usage:
//   const [files, setFiles] = useState([]);
//   <PhotoUploader files={files} onChange={setFiles} maxFiles={5} />

import { useState } from 'react';

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function PhotoUploader({ files, onChange, maxFiles = 5, label = 'Photos' }) {
  const [error, setError] = useState('');

  // i-validate yung mga selected files at i-add sa state
  function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files || []);
    setError('');

    // i-check ang count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed.`);
      return;
    }

    // i-validate bawat file
    const validFiles = [];
    for (const file of newFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPEG, PNG, and WEBP images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be under ${MAX_SIZE_MB}MB.`);
        return;
      }
      validFiles.push(file);
    }

    onChange([...files, ...validFiles]);

    // i-clear yung file input para pwedeng pumili ulit ng same file
    event.target.value = '';
  }

  // tanggalin ang file mula sa state
  function removeFile(index) {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
    setError('');
  }

  return (
    <div className="photo-uploader">
      <label className="photo-uploader-label">{label}</label>

      <p className="photo-uploader-hint">
        Up to {maxFiles} photos · JPEG, PNG, or WEBP · Max {MAX_SIZE_MB}MB each
      </p>

      {/* file input — hidden, ti-trigger via button */}
      <input
        type="file"
        id={`photo-input-${label}`}
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <label htmlFor={`photo-input-${label}`} className="photo-uploader-button">
        Choose Photos ({files.length}/{maxFiles})
      </label>

      {error && <p className="photo-uploader-error">{error}</p>}

      {/* previews ng mga na-select na photos */}
      {files.length > 0 && (
        <div className="photo-previews">
          {files.map((file, index) => (
            <PhotoPreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// helper component — preview card per file
function PhotoPreview({ file, onRemove }) {
  // create object url for preview — ito yung temporary url ng file
  // bago ma-upload sa server.
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="photo-preview">
      <img src={previewUrl} alt={file.name} />
      <button
        type="button"
        className="photo-preview-remove"
        onClick={onRemove}
        title="Remove photo"
      >
        ×
      </button>
    </div>
  );
}

export default PhotoUploader;
