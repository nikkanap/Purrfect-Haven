import api from './api.js';

// kunin ang trivia para sa isang animal type (dog, cat, bird, etc.)
export async function getTrivia(type) {
  const response = await api.get(`/trivia/${type}`);
  return response.data;
}