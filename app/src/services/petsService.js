import api from './api.js';

// =====================================================
// public — kunin ang pets list with optional filters
// =====================================================
export async function getPets(filters = {}) {
  const params = {};
  if (filters.species)  params.species  = filters.species;
  if (filters.breed)    params.breed    = filters.breed;
  if (filters.age)      params.age      = filters.age;
  if (filters.location) params.location = filters.location;

  const response = await api.get('/pets', { params });
  return response.data.pets;
}

export async function getPetById(id) {
  const response = await api.get(`/pets/${id}`);
  return response.data.pet;
}

export async function getAdoptedPets({ species, location } = {}) {
  const response = await api.get('/pets/adopted', { params: { species, location } });
  return response.data.pets;
}

// kunin lahat ng species — para sa dropdown sa pet form
export async function getSpecies() {
  const response = await api.get('/pets/species');
  return response.data.species;
}

// =====================================================
// admin only — pet management
// =====================================================

// gumawa ng bagong pet, kasama na ang photos
export async function createPet(petData, photoFiles = []) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(petData)) {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  }
  for (const file of photoFiles) {
    formData.append('photos', file);
  }

  const response = await api.post('/pets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// i-update ang pet details (text fields lang)
export async function updatePet(petId, petData) {
  const response = await api.put(`/pets/${petId}`, petData);
  return response.data;
}

// i-delete ang pet
export async function deletePet(petId) {
  const response = await api.delete(`/pets/${petId}`);
  return response.data;
}