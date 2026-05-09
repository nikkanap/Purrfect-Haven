const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_PLACEHOLDER = 'https://placehold.co/400x400?text=No+Photo';

export function getPhotoUrl(filePath, fallback = DEFAULT_PLACEHOLDER) {
  if (!filePath) return fallback;
  return `${BASE_URL}/${filePath}`;
}

export function getPetPhotoUrl(filePath, petName) {
  if (!filePath && !petName) return 'https://placehold.co/200x200?text=No+Photo';
  if (petName) {
    const fileName = `${petName.charAt(0).toLowerCase()}${petName.slice(1)}-1.jpg`;
    return getPhotoUrl(`uploads/pets/${fileName}`);
  }
  return getPhotoUrl(filePath);
}

export function getStoryPhotoUrl(filePath, petName) {
  if (petName) {
    const fileName = `${petName.charAt(0).toLowerCase()}${petName.slice(1)}-1.jpg`;
    return getPhotoUrl(`uploads/stories/${fileName}`, null);
  }
  return getPhotoUrl(filePath, null);
}