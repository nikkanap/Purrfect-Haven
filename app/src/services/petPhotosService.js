import api from './api.js';

// admin only — upload photos for a pet
export async function uploadPetPhotos(petId, photoFiles) {
  const formData = new FormData();
  for (const file of photoFiles) {
    formData.append('photos', file);
  }

  const response = await api.post(`/pets/${petId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// admin only — delete a specific photo
export async function deletePetPhoto(photoId) {
  const response = await api.delete(`/pets/photos/${photoId}`);
  return response.data;
}
