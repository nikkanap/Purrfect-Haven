import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPets,
  getAdoptedPets,
  getPetById,
  deletePet,
} from '../../services/petsService.js';
import PetCard from '../../components/PetCard.jsx';
import PetFormModal from '../../components/PetFormModal.jsx';
import addIcon from '../../assets/icons/add.svg';
import '../../styles/pets.css';

const SPECIES_FILTERS = [
  { label: 'All Types', value: '' },
  { label: 'Cats',      value: 'cat' },
  { label: 'Dogs',      value: 'dog' },
  { label: 'Birds',     value: 'bird' },
  { label: 'Others',    value: 'other' },
];

function AdoptionListPage() {
  const { user } = useAuth();
  const isAdmin = user?.is_admin === 1;

  // --- existing state ---
  const [availablePets, setAvailablePets] = useState([]);
  const [adoptedPets, setAdoptedPets]     = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- admin state ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const filters = { species: selectedSpecies };

    async function fetchAllPets() {
      setLoading(true);
      setError('');
      try {
        const [available, adopted] = await Promise.all([
          getPets(filters),
          getAdoptedPets(filters),
        ]);
        setAvailablePets(available);
        setAdoptedPets(adopted);
      } catch (err) {
        console.error('Failed to load pets:', err);
        setError('Could not load pets. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAllPets();
  }, [selectedSpecies]);

  // auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message, kind = 'success') {
    setToast({ message, kind });
  }

  // i-reload ang both lists pagkatapos ng add/edit/delete
  async function refreshAllPets() {
    const filters = { species: selectedSpecies};
    try {
      const [available, adopted] = await Promise.all([
        getPets(filters),
        getAdoptedPets(filters),
      ]);
      setAvailablePets(available);
      setAdoptedPets(adopted);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }

  // ============ admin handlers ============

  // pag-edit, kailangan natin yung full pet data (kasama yung age, sex, atbp.).
  // yung list view minimal lang ang fields, kaya kailangang i-fetch ang full
  // data mula sa /api/pets/:id muna.
  async function handleEdit(pet) {
    setLoadingEdit(true);
    try {
      const fullPet = await getPetById(pet.pet_id);
      setEditingPet(fullPet);
    } catch (err) {
      console.error('Failed to load pet details:', err);
      showToast('Failed to load pet details.', 'error');
    } finally {
      setLoadingEdit(false);
    }
  }

  function handleDelete(pet) {
    setDeleteConfirm(pet);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await deletePet(deleteConfirm.pet_id);
      setAvailablePets((prev) =>
        prev.filter((p) => p.pet_id !== deleteConfirm.pet_id)
      );
      showToast(`${deleteConfirm.name} has been removed.`);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.response?.data?.error || 'Failed to delete pet.', 'error');
      setDeleteConfirm(null);
    }
  }

  function handleSaveSuccess(result) {
    setShowAddModal(false);
    setEditingPet(null);
    showToast(result.message);
    refreshAllPets();
  }

  return (
    <div className="adopt-page">
      <section className="adopt-header">
        <h1>Pets For Adoption</h1>
        <p>
          Browse through list of pets up for adoption and find the perfect
          companion waiting to meet you!
        </p>
        {isAdmin && (
          <button
            className="admin-add-btn"
            onClick={() => setShowAddModal(true)}
            disabled={loadingEdit}
          >
            <img src={addIcon} alt="" className="admin-add-icon" />
            Add a New Pet
          </button>
        )}
      </section>

      <section className="adopt-filters">
        <div className="filter-chips">
          {SPECIES_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={
                'filter-chip ' +
                (selectedSpecies === filter.value ? 'filter-chip-active' : '')
              }
              onClick={() => setSelectedSpecies(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="pets-section">
        {loading && <p className="status-message">Loading pets...</p>}

        {error && <p className="status-message error-message">{error}</p>}

        {!loading && !error && availablePets.length === 0 && (
          <p className="status-message">
            No pets match your filters. Try a different search.
          </p>
        )}

        {!loading && !error && availablePets.length > 0 && (
          <div className="pets-grid">
            {availablePets.map((pet) => (
              <div key={pet.pet_id} className="pet-card-wrapper">
                <PetCard pet={pet} />

                {/* admin overlay — edit/delete buttons */}
                {isAdmin && (
                  <div className="pet-card-admin-overlay">
                    <button
                      className="pet-card-admin-btn pet-card-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEdit(pet);
                      }}
                      disabled={loadingEdit}
                      title="Edit pet"
                    >
                      {loadingEdit ? '...' : 'Edit'}
                    </button>
                    <button
                      className="pet-card-admin-btn pet-card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(pet);
                      }}
                      title="Delete pet"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {adoptedPets.length > 0 && (
        <section className="pets-section adopted-section">
          <h2>Successfully Adopted Pets</h2>
          <p className="section-subtitle">
            These pets have found their forever homes!
          </p>
          <div className="pets-grid">
            {adoptedPets.map((pet) => (
              <div key={pet.pet_id} className="pet-card-wrapper">
                <PetCard pet={pet} />

                {/* admin overlay para rin sa adopted pets */}
                {isAdmin && (
                  <div className="pet-card-admin-overlay">
                    <button
                      className="pet-card-admin-btn pet-card-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEdit(pet);
                      }}
                      disabled={loadingEdit}
                      title="Edit pet"
                    >
                      {loadingEdit ? '...' : 'Edit'}
                    </button>
                    <button
                      className="pet-card-admin-btn pet-card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(pet);
                      }}
                      title="Delete pet"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* add modal */}
      {showAddModal && (
        <PetFormModal
          mode="add"
          onSave={handleSaveSuccess}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* edit modal */}
      {editingPet && (
        <PetFormModal
          mode="edit"
          pet={editingPet}
          onSave={handleSaveSuccess}
          onCancel={() => setEditingPet(null)}
        />
      )}

      {/* delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Pet</h2>
            <p className="modal-confirm-text">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              This will also remove all associated photos and cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button className="reject-btn" onClick={confirmDelete}>
                Delete Pet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className={`toast toast-${toast.kind}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdoptionListPage;