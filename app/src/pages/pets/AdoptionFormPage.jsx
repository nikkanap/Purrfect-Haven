import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAdoptionApplication } from '../../services/adoptionsService.js';
import { getPetById } from '../../services/petsService.js';
import { getPetPhotoUrl } from '../../utils/photoUrl.js';
import FormCard from '../../components/FormCard.jsx';
import Button from '../../components/Button.jsx';
import { Paperclip } from 'lucide-react';
import '../../styles/forms.css';
import '../../styles/rescue.css';
import '../../styles/adoptform.css';
import '../../styles/petdetail.css';

function AdoptFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fullname, setFullname]               = useState('');
  const [phoneNo, setPhoneNo]                 = useState('');
  const [email, setEmail]                     = useState('');
  const [location, setLocation]               = useState('');
  const [aboutSelf, setAboutSelf]             = useState('');
  const [financialCapTxt, setFinancialCapTxt] = useState('');
  const [homeOwnership, setHomeOwnership]     = useState('');

  const [firstPet, setFirstPet]           = useState(false);
  const [petExperience, setPetExperience] = useState(false);
  const [otherPets, setOtherPets]         = useState(false);
  const [hasChildren, setHasChildren]     = useState(false);

  const [pet, setPet]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
      fullname: '', phoneNo: '', email: '', location: '',
      aboutSelf: '', financialCapTxt: '', homeOwnership: '', firstPet: '',
      petExperience: '', otherPets: '', hasChildren: ''
  });

  useEffect(() => {
    async function fetchPet() {
      setLoading(true);
      setError('');
      try {
        const fetched = await getPetById(id);
        setPet(fetched);
      } catch (err) {
        console.error('Failed to load pet:', err);
        setError(err.response?.status === 404 ? 'Pet not found.' : 'Could not load pet details.');
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    console.log('handleSubmit');
    /*
    if (!formData.fullname || !formData.phoneNo || !formData.email || !formData.location || !formData.financialCapTxt || !formData.homeOwnership ) {
      setError('Please fill in all required fields.');
      return;
    }
    */

    setLoading(true);
    try {
      const response = await submitAdoptionApplication({
        pet_id:              parseInt(id),
        applicant_address:   location,
        is_first_pet:        firstPet,
        has_experience:      petExperience,
        has_other_pets:      otherPets,
        has_children:        hasChildren,
        owns_home:           homeOwnership === 'own',
        financial_capability: financialCapTxt,
        motivation:          aboutSelf,
      });
      console.log(response);

      setSuccess('Adoption request submitted successfully! Redirecting to confirmation...');
      console.log('clearing form data');

      setFormData({
        fullname: '', phoneNo: '', email: '', location: '',
        aboutSelf: '', financialCapTxt: '', homeOwnership: '', firstPet: '',
        petExperience: '', otherPets: '', hasChildren: ''
      });

      console.log('navigating...');
      setTimeout(() => {
          navigate(`/adopt/application/${response.adoption_id}`, { state: { fromSubmission: true } });
          console.log('done');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !pet) return <p className="status-message">Loading pet details...</p>;
  if (error && !pet)   return <p className="status-message error">{error}</p>;
  if (!pet)            return null;

  const mainPhotoUrl = pet.photos?.length > 0
    ? getPetPhotoUrl(pet.photos[0].file_path, pet.name)
    : getPetPhotoUrl(null, pet.name);

  return (
    <div className="adoptpet-container">
      {/* Pet info card */}
        <div className="af-info-card">
          <img
            src={mainPhotoUrl}
            alt={pet.name}
            className="af-detail-main-photo"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200?text=No+Photo'; }}
          />
          <div>
            <h2 className="info-card-name">{pet.name}</h2>
            {pet.location_held && (
              <p className="info-card-location">{pet.location_held}</p>
            )}
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
        </div>

      {/* Application form */}
      <FormCard 
        title="Adoption Application" 
        maxWidth={800}
        subtitle={
          `Thank you for your interest in adopting ${pet.name}! Please fill out the
          form below to start the adoption process.
        `}>
        <form
          onSubmit={handleSubmit}
          className="report-form"
        >
          {/* Contact Info */}
          <div className="report-form-group full">
            <h3>Your Contact Info</h3>
          </div>

          <div className="report-form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              placeholder="e.g. Juan dela Cruz"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="report-form-group">
            <label htmlFor="phoneNo">Phone No.</label>
            <input
              id="phoneNo"
              type="text"
              placeholder="09xxx-xxx-xxxx"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </div>

          <div className="report-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="text"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="report-form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Barangay 83-B, San Jose, Tacloban City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* About */}
          <div className="report-form-group full">
            <h3>Tell Us About Yourself</h3>
          </div>

          <div className="report-form-group full">
            <label htmlFor="aboutSelf">Why do you want to adopt {pet.name}?</label>
            <textarea
              id="aboutSelf"
              placeholder="Share your experience with pets, living situation, and why you'd be a great fit..."
              value={aboutSelf}
              onChange={(e) => setAboutSelf(e.target.value)}
              required
            />
          </div>

          <div className="report-form-group full">
            <label>Please check all that apply:</label>
            <div className="checkbox-group">
              <input
                id="firstPet"
                type="checkbox"
                checked={firstPet}
                onChange={(e) => setFirstPet(e.target.checked)}
              />
              <label htmlFor="firstPet">This would be my first pet</label>
            </div>
            <div className="checkbox-group">
              <input
                id="petExperience"
                type="checkbox"
                checked={petExperience}
                onChange={(e) => setPetExperience(e.target.checked)}
              />
              <label htmlFor="petExperience">I have experience taking care of a cat/dog</label>
            </div>
            <div className="checkbox-group">
              <input
                id="otherPets"
                type="checkbox"
                checked={otherPets}
                onChange={(e) => setOtherPets(e.target.checked)}
              />
              <label htmlFor="otherPets">I have other pets at home</label>
            </div>
            <div className="checkbox-group">
              <input
                id="hasChildren"
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
              />
              <label htmlFor="hasChildren">I have children at home</label>
            </div>
          </div>

          {/* Verification */}
          <div className="report-form-group full">
            <h3>Verification Information</h3>
          </div>

          <div className="report-form-group full">
            <label>Home Ownership</label>
            <div className="radio-group">
              <input
                id="ownHome"
                type="radio"
                name="homeOwnership"
                checked={homeOwnership === 'own'}
                onChange={() => setHomeOwnership('own')}
                required
              />
              <label htmlFor="ownHome">I own my home</label>
            </div>
            <div className="radio-group">
              <input
                id="rentHome"
                type="radio"
                name="homeOwnership"
                checked={homeOwnership === 'rent'}
                onChange={() => setHomeOwnership('rent')}
              />
              <label htmlFor="rentHome">
                I rent/lease my home (with landlord approval for pets)
              </label>
            </div>
          </div>

          <div className="report-form-group full">
            <label htmlFor="financialCapTxt">Financial Capability</label>
            <textarea
              id="financialCapTxt"
              placeholder="Provide proof such as employment details, LinkedIn profile, or veterinary care history."
              value={financialCapTxt}
              onChange={(e) => setFinancialCapTxt(e.target.value)}
              required
            />
          </div>

          <div className="report-form-group full">
            <label>Supporting Documents</label>
            <div className="upload-box">
              <Paperclip size={28} />
              <p>Upload Proof of Financial Capability</p>
              <small>PDF, Doc up to 10MB each · Max 5 files</small>
              <input type="file" multiple disabled />
              <small style={{ display: 'block', marginTop: '8px', color: '#999' }}>
                (File uploads coming soon)
              </small>
            </div>
          </div>

          {error && <div className="status-message error">{error}</div>}
          {success && <div className="status-message success">{success}</div>}  

          <div className="submit-box">
            <Button type="submit" disabled={loading} className="button-full">
              {loading ? 'Submitting...' : 'Submit Adoption Application'}
            </Button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}

export default AdoptFormPage;
