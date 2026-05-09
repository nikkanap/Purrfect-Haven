import { useState } from 'react';
import Button from '../components/Button.jsx';
import '../styles/aboutdevelopers.css';
import cameraIcon from '../assets/icons/camera.svg';

function AboutDevelopersPage() {
  const [hoveredId, setHoveredId] = useState(null);

  const developers = [
    {
      id: 1,
      name: 'Angela Almazan',
      role: 'Role',
      bio: 'Short biography',
      image: null,
    },
    {
      id: 2,
      name: 'Eugene Esguerra',
      role: 'Role',
      bio: 'Short biography',
      image: null,
    },
    {
      id: 3,
      name: 'Nikka Naputo',
      role: 'Role',
      bio: 'Short biography',
      image: null,
    },
    {
      id: 4,
      name: 'Elizah Sumbeling',
      role: 'Role',
      bio: 'Short biography',
      image: null,
    }
  ];

  return (
    <div className="about-developers-page">
      <section className="about-header">
        <h1>Meet the Team</h1>
        <p className="about-subtitle">
          Meet the passionate developers behind Purrfect Haven, dedicated to helping rescue and rehome pets in Tacloban City.
        </p>
      </section>

      <section className="developers-grid">
        {developers.map((dev) => (
          <div
            key={dev.id}
            className="developer-card"
            onMouseEnter={() => setHoveredId(dev.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="developer-image">
              <div className="placeholder-icon">
                <img src={cameraIcon} alt="Camera Icon" />
              </div>
            </div>
            <div className="developer-info">
              <h3>{dev.name}</h3>
              <p className="role">{dev.role}</p>
              {hoveredId === dev.id && (
                <p className="bio">{dev.bio}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="about-vision">
        <h2>Our Vision</h2>
        <p>
          A Tacloban City where no rescued animal goes without a safe, loving home — where every stray
          has a chance, every community member can make a difference, and the bond between people and
          pets is celebrated and protected.
        </p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          Purrfect Haven connects Tacloban City's community with rescued animals through a simple,
          accessible platform for pet adoption, rescue reporting, and community re-homing. We make it
          easier for residents to find their perfect companion, flag animals in need, and support a
          network of care — one adoption at a time.
        </p>
      </section>

      <section className="about-cta">
        <h2>Want to Help?</h2>
        <p>Join us in making a difference in the lives of rescued animals.</p>
        <div className="about-buttons">
          <Button>Donate</Button>
          <Button onClick={() => window.location.href = '/pets'} className="secondary">Browse Pets</Button>
        </div>
      </section>
      
    </div>
  );
}

export default AboutDevelopersPage;
