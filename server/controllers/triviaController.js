// GET /api/trivia/:type

export async function getTrivia(req, res) {
  const { type } = req.params;

  // mga animal types na supported ng some-random-api
  const validTypes = [
    'dog', 'cat', 'panda', 'fox', 'red_panda',
    'koala', 'bird', 'raccoon', 'kangaroo',
  ];

  // fallback sa dog if waleychibels or invalid type
  const lower = type.toLowerCase();
  const animalType = validTypes.includes(lower) ? lower : 'dog';

  try {
    const response = await fetch(`https://some-random-api.com/animal/${animalType}`);

    if (!response.ok) {
      return res.status(502).json({ error: 'Trivia API not available right now.' });
    }

    const data = await response.json();

    return res.status(200).json({
      type: animalType,
      image: data.image,
      fact: data.fact,
    });

  } catch (err) {
    console.error('Get trivia error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}