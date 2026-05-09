import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bg1 from '../assets/landing-bg-1.jpg';
import bg2 from '../assets/landing-bg-2.jpg';
import bg3 from '../assets/landing-bg-3.jpg';
import Button from './Button.jsx';

// This component is the Hero section used in Landing page
function Hero() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [bg1, bg2, bg3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const heroStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(94, 48, 35, 0.6) 0%, rgba(232, 180, 148, 0.6) 100%), url(${images[currentImageIndex]})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1s ease-in-out'
  };

  return (
    <section className="hero-section" style={heroStyle}>
      <div className="hero-content">
        <h1>Every Pet Deserves a Loving Home</h1>
        <p>Browse adoptable pets around Tacloban City, report animals in need, or post community adoptions. Together, we can make a difference for our Tacloban fur babies.</p>
        <div className="hero-buttons">
          <Button variant="hero" onClick={() => navigate('/pets')}>Find a pet</Button>
          <Button variant="hero" onClick={() => navigate('/rescue')}>Request a rescue</Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
