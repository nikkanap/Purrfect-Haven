// pet form modal — ginagamit para sa add at edit ng pet (admin only).
//
// usage:
//   <PetFormModal
//     mode="add"   // o "edit"
//     pet={petData}  // optional, for edit mode
//     onSave={() => { ... }}
//     onCancel={() => { ... }}
//   />

import { useState, useEffect } from 'react';
import { createPet, updatePet, getSpecies } from '../services/petsService.js';
import {
  uploadPetPhotos,
  deletePetPhoto,
} from '../services/petPhotosService.js';
import PhotoUploader from './PhotoUploader.jsx';

import { getPhotoUrl as buildPhotoUrl } from '../utils/photoUrl.js';
const getPhotoUrl = (filePath) => buildPhotoUrl(filePath, '');

function PetFormModal({ mode, pet, onSave, onCancel }) {
  const isEdit = mode === 'edit';

  // form state — kapag edit, i-prefill galing sa pet object
  const [name, setName] = useState(pet?.name || '');
  const [speciesId, setSpeciesId] = useState(pet?.species_id || '');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [sex, setSex] = useState(pet?.sex || 'Male');
  const [age, setAge] = useState(pet?.age || '');
  const [color, setColor] = useState(pet?.color || '');
  const [description, setDescription] = useState(pet?.description || '');
  const [locationRescued, setLocationRescued] = useState(pet?.location_rescued || '');
  const [dateRescued, setDateRescued] = useState(pet?.date_rescued ? pet.date_rescued.split('T')[0] : '');
  const [locationHeld, setLocationHeld] = useState(pet?.location_held || '');
  const [isAdopted, setIsAdopted] = useState(pet?.is_adopted ? true : false);

  // photos state
  const [newPhotos, setNewPhotos] = useState([]);  // bagong files na ia-upload
  const [existingPhotos, setExistingPhotos] = useState(pet?.photos || []);  // existing photos sa edit mode

  // dropdown options at ui state
  const [speciesList, setSpeciesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // fetch species options on mount
  useEffect(() => {
    async function fetchSpecies() {
      try {
        const data = await getSpecies();
        setSpeciesList(data);
        // kapag add mode at wala pang selected species, default to first
        if (!isEdit && data.length > 0 && !speciesId) {
          setSpeciesId(data[0].species_id);
        }
      } catch (err) {
        console.error('Failed to load species:', err);
      }
    }
    fetchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildPetData() {
    return {
      name: name.trim(),
      species_id: parseInt(speciesId),
      breed: breed.trim(),
      sex,
      age: age ? parseInt(age) : null,
      color: color.trim(),
      description: description.trim(),
      location_rescued: locationRescued.trim(),
      date_rescued: dateRescued || null,
      location_held: locationHeld.trim(),
      is_adopted: isAdopted,
    };
  }

  async function handleSubmit() {
    if (!name.trim() || !speciesId || !sex || !locationHeld.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const petData = buildPetData();

      if (isEdit) {
        // i-update muna ang text fields
        await updatePet(pet.pet_id, petData);

        // i-upload yung bagong photos kung meron
        if (newPhotos.length > 0) {
          await uploadPetPhotos(pet.pet_id, newPhotos);
        }

        onSave({ message: 'Pet updated successfully.' });
      } else {
        // add mode — single multipart request
        const result = await createPet(petData, newPhotos);
        onSave({
          message: 'Pet added successfully.',
          pet_id: result.pet_id,
        });
      }
    } catch (err) {
      console.error('Save pet error:', err);
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // tanggalin ang existing photo (edit mode lang)
  async function handleRemoveExistingPhoto(photoId) {
    if (!confirm('Remove this photo? This cannot be undone.')) return;

    try {
      await deletePetPhoto(photoId);
      setExistingPhotos((prev) => prev.filter((p) => p.pet_pic_id !== photoId));
    } catch (err) {
      console.error('Delete photo error:', err);
      alert('Failed to remove photo.');
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Pet' : 'Add a New Pet'}</h2>
        <p className="modal-subtext">
          {isEdit
            ? `Update details for ${pet.name}`
            : 'Add a new pet to the adoption listing.'}
        </p>

        {error && (
          <p className="photo-uploader-error" style={{ marginBottom: '14px' }}>
            {error}
          </p>
        )}

        {/* form fields — two-column layout */}
        <div className="pet-form-grid">
          <label className="modal-label">
            Name <span className="required-mark">*</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bantay"
            />
          </label>

          <label className="modal-label">
            Species <span className="required-mark">*</span>
            <select
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="pet-form-select"
            >
              <option value="">Select species...</option>
              {speciesList.map((sp) => (
                <option key={sp.species_id} value={sp.species_id}>
                  {sp.species_name}
                </option>
              ))}
            </select>
          </label>

          <label className="modal-label">
            Breed
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Aspin, Puspin"
            />
          </label>

          <label className="modal-label">
            Sex <span className="required-mark">*</span>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="pet-form-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label className="modal-label">
            Age (in years)
            <input
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 2"
            />
          </label>

          <label className="modal-label">
            Color
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Brown and white"
            />
          </label>

          <label className="modal-label">
            Location Rescued
            <input
              type="text"
              value={locationRescued}
              onChange={(e) => setLocationRescued(e.target.value)}
              placeholder="e.g. Mandaue City"
            />
          </label>

          <label className="modal-label">
            Date Rescued
            <input
              type="date"
              value={dateRescued}
              onChange={(e) => setDateRescued(e.target.value)}
            />
          </label>

          <label className="modal-label modal-label-full">
            Location Held <span className="required-mark">*</span>
            <input
              type="text"
              value={locationHeld}
              onChange={(e) => setLocationHeld(e.target.value)}
              placeholder="e.g. Mandaue Foster Home"
            />
          </label>

          <label className="modal-label modal-label-full">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell potential adopters about this pet's personality, history, and any special needs..."
              rows={5}
            />
          </label>

          {/* edit mode only — adoption status toggle */}
          {isEdit && (
            <label className="modal-label modal-label-full pet-form-checkbox">
              <input
                type="checkbox"
                checked={isAdopted}
                onChange={(e) => setIsAdopted(e.target.checked)}
              />
              <span>This pet has been adopted (will hide from adoption list)</span>
            </label>
          )}
        </div>

        {/* existing photos — edit mode lang */}
        {isEdit && existingPhotos.length > 0 && (
          <div className="modal-label">
            <span className="photo-uploader-label">Existing Photos</span>
            <p className="photo-uploader-hint">
              Click × to remove a photo permanently.
            </p>
            <div className="photo-previews">
              {existingPhotos.map((photo) => (
                <div key={photo.pet_pic_id} className="photo-preview">
                  <img src={getPhotoUrl(photo.file_path)} alt="" />
                  <button
                    type="button"
                    className="photo-preview-remove"
                    onClick={() => handleRemoveExistingPhoto(photo.pet_pic_id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* photo uploader for new photos */}
        <PhotoUploader
          files={newPhotos}
          onChange={setNewPhotos}
          maxFiles={10}
          label={isEdit ? 'Add More Photos' : 'Photos'}
        />

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            className="approve-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? 'Saving...'
              : isEdit ? 'Save Changes' : 'Add Pet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PetFormModal;
