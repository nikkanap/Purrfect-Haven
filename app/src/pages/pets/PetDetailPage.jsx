// PetDetailPage.jsx
// Shows detailed info for one specific pet.
// The pet id comes from the URL (/pets/:id).

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPetById } from '../../services/petsService.js';
import '../../styles/petdetail.css';

import { getPhotoUrl, getPetPhotoUrl } from '../../utils/photoUrl.js';

function PetDetailPage() {
  const { id } = useParams(); // grabs the :id from the URL
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pet, setPet] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the pet when the page loads, or when the id in the URL changes
  useEffect(() => {
    async function fetchPet() {
      setLoading(true);
      setError('');

      try {
        const fetched = await getPetById(id);
        setPet(fetched);
        setSelectedPhotoIndex(0); // reset photo selection when loading a new pet
      } catch (err) {
        console.error('Failed to load pet:', err);
        if (err.response?.status === 404) {
          setError('Pet not found.');
        } else {
          setError('Could not load pet details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPet();
  }, [id]);

  // When user clicks "Adopt Now":
  // - If not logged in, send them to login first
  // - If logged in, take them to the adoption form (not built yet)
  function handleAdoptClick() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: wire this up once AdoptionFormPage exists
    navigate(`/adopt/${pet.pet_id}`);
  }

  // --- Early returns for loading / error / not-found ---
  if (loading) {
    return <p className="status-message">Loading pet details...</p>;
  }

  if (error) {
    return <p className="status-message error-message">{error}</p>;
  }

  if (!pet) {
    return null; // shouldn't happen, but just in case
  }

  // --- Main render ---
  // The main photo is whichever thumbnail is currently selected.
  // If the pet has no photos, we show a placeholder.
  const photos = pet.photos || [];
  const mainPhoto = photos[selectedPhotoIndex];
  const mainPhotoUrl = mainPhoto
    ? getPhotoUrl(mainPhoto.file_path)
    : getPetPhotoUrl(null, pet.name);

  return (
    <div className="detail-page">
      {/* Add a back button */}
      {/*Pagination? */}
      <div className="detail-layout">
        {/* Left column: photos + adopt button */}
        <div className="detail-photos">
          <img
            src={mainPhotoUrl}
            alt={pet.name}
            className="detail-main-photo"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400?text=No+Photo'; }}
          />

          {/* Thumbnails — only show if there are multiple photos */}
          {photos.length > 1 && (
            <div className="detail-thumbnails">
              {photos.map((photo, index) => (
                <img
                  key={photo.pet_pic_id}
                  src={getPhotoUrl(photo.file_path)}
                  alt={`${pet.name} photo ${index + 1}`}
                  className={
                    'detail-thumbnail ' +
                    (index === selectedPhotoIndex ? 'detail-thumbnail-active' : '')
                  }
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200?text=No+Photo'; }}
                  onClick={() => setSelectedPhotoIndex(index)}
                />
              ))}
            </div>
          )}

          <button
            className="pd-adopt-btn"
            onClick={handleAdoptClick}
            disabled={pet.is_adopted === 1}
          >
            {pet.is_adopted === 1 ? 'Already Adopted' : 'Adopt Now'}
          </button>
        </div>

        {/* Right column: info card + about section */}
        <div className="detail-info">
          <div className="info-card">
            <h2 className="info-card-name">{pet.name}</h2>
            {pet.location_held && (
              <p className="info-card-location">{pet.location_held}</p>
            )}

            {/* Info rows — only render the ones that have data */}
            <div className="info-card-rows">
              {pet.species_name && (
                <div className="info-row">
                  <span className="info-label">Type</span>
                  <span className="info-value">{pet.species_name}</span>
                </div>
              )}
              {pet.breed && (
                <div className="info-row">
                  <span className="info-label">Breed</span>
                  <span className="info-value">{pet.breed}</span>
                </div>
              )}
              {pet.sex && (
                <div className="info-row">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{pet.sex}</span>
                </div>
              )}
              {pet.age !== null && pet.age !== undefined && (
                <div className="info-row">
                  <span className="info-label">Age</span>
                  <span className="info-value">
                    {pet.age} {pet.age === 1 ? 'year' : 'years'}
                  </span>
                </div>
              )}
              {pet.color && (
                <div className="info-row">
                  <span className="info-label">Color/Pattern</span>
                  <span className="info-value">{pet.color}</span>
                </div>
              )}
            </div>
          </div>

          <div className="about-section">
            <h2>About {pet.name}</h2>
            <p>{pet.description || 'No description available yet.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetailPage;