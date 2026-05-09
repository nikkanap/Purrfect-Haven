/**
 * ResponsiveImage Component
 * Handles lazy loading for optimized images
 * 
 * Usage:
 * <ResponsiveImage
 *   name="callie"
 *   type="pets"
 *   alt="Callie adoption pet"
 *   lazy={true}
 *   className="pet-image"
 * />
 */

export default function ResponsiveImage({ name, type, alt, lazy = true, className = '' }) {
  // Edit the imagePath as you go (may change based on optimization to be done)
  const imagePath = `/src/assets/pets/${name}.jpg`;
  
  return (
    <img
      src={imagePath}
      alt={alt}
      className={className}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
}
