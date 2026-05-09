import { useState, useEffect } from 'react';
import FormCard from '../../components/FormCard.jsx';
import Button from '../../components/Button.jsx';
import api from '../../services/api.js'; 
import "../../styles/forms.css";
import "../../styles/rescue.css";
import "../../styles/community.css";
import bg1 from "../../assets/landing-bg-1.jpg";
import bg2 from "../../assets/landing-bg-2.jpg";
import bg3 from "../../assets/landing-bg-3.jpg";
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function CommunityPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        petName: '', age: '', weight: '', gender: '',
        type: '', breed: '', color: '', personality: '',
        organization: '', location: '', health: '', about: '',
    });

    useEffect(() => {
        if(!user) navigate('/login');
    }, []);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Strict Validation: Checks if ANY field in the formData object is empty
        const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');

        if (!allFieldsFilled) {
            setError('Please fill in all required fields.');
            return; // This blocks the submission
        }

        setLoading(true);
        try {
            const response = await api.post('/community', {
                pet_name: formData.petName,
                species_name: formData.type, 
                breed: formData.breed,
                sex: formData.gender,       
                age: parseInt(formData.age) || 0, 
                color: formData.color,
                personality: formData.personality,
                organization: formData.organization,
                health: formData.health,
                location: formData.location,
                description: formData.about,
                
                petName: formData.petName,
                gender: formData.gender,
                type: formData.type,
                about: formData.about
            });

            setSuccess('Community adoption post submitted successfully! Redirecting to confirmation...');
            setFormData({
                petName: '', age: '', weight: '', gender: '',
                type: '', breed: '', color: '', personality: '',
                organization: '', location: '', health: '', about: '',
            });
            console.log(response);

            setTimeout(() => {
                navigate(`/community/${response.data.postId}`, { state: { fromSubmission: true } });
            }, 2500);
        } catch (err) {
            console.log('Error submitting community post submission: ', err);
            setError(
                err.response?.data?.error || 'Failed to submit post. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='cap-main-wrapper-parent'>
            <div className="cap-main-wrapper">
                <section className="cap-info-section">
                    <h1 className="cap-title">Community Adoption</h1>

                    <img src={bg1} alt="Pet Adoption 1" className="cap-featured-img" />

                    <p className="cap-description-text">
                        Have a pet you want to put up for adoption? Put them up for adoption right here at <strong>Purrfect Haven</strong>.<br /><br />
                        Find them a safe, loving home by connecting with responsible adopters who truly care. Our platform makes
                        the process simple, secure, and compassionate. Because every pet deserves a second chance and a forever family.
                    </p>

                    <img src={bg2} alt="Pet Adoption 2" className="cap-featured-img" />
                    <img src={bg3} alt="Pet Adoption 3" className="cap-featured-img" />
                </section>

                <section className="cap-form-section">
                    <FormCard
                        title="Community Adoption Posting Form"
                        maxWidth={900}
                        containerClassName="cap-form-card-wrapper"
                    >
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

                            <div className="report-form-group full">
                                <label htmlFor="petName">Pet Name</label>
                                <input type="text" id="petName" name="petName" placeholder="Enter name of pet"
                                    value={formData.petName} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group cap-third">
                                <label htmlFor="age">Age</label>
                                <input type="text" id="age" name="age" placeholder="e.g. 2 years"
                                    value={formData.age} onChange={handleInputChange} required />
                            </div>
                            <div className="report-form-group cap-third">
                                <label htmlFor="weight">Weight (kg)</label>
                                <input type="text" id="weight" name="weight" placeholder="e.g. 3.5"
                                    value={formData.weight} onChange={handleInputChange} required />
                            </div>
                            <div className="report-form-group cap-third">
                                <label htmlFor="gender">Gender</label>
                                <input type="text" id="gender" name="gender" placeholder="Male / Female"
                                    value={formData.gender} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group">
                                <label htmlFor="type">Type</label>
                                <input type="text" id="type" name="type" placeholder="e.g. Cat, Dog"
                                    value={formData.type} onChange={handleInputChange} required />
                            </div>
                            <div className="report-form-group">
                                <label htmlFor="breed">Breed</label>
                                <input type="text" id="breed" name="breed" placeholder="e.g. Golden Retriever"
                                    value={formData.breed} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="color">Color / Pattern</label>
                                <input type="text" id="color" name="color" placeholder="e.g. black, white, calico"
                                    value={formData.color} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="personality">Personality</label>
                                <input type="text" id="personality" name="personality" placeholder="Enter pet's personality traits"
                                    value={formData.personality} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="organization">Organization / Foster Home</label>
                                <input type="text" id="organization" name="organization" placeholder="Enter organization or foster owner"
                                    value={formData.organization} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="location">Location</label>
                                <input type="text" id="location" name="location" placeholder="Enter current home address of pet"
                                    value={formData.location} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="health">Health & Care</label>
                                <input type="text" id="health" name="health" placeholder="e.g. vaccinated, dewormed, healthy"
                                    value={formData.health} onChange={handleInputChange} required />
                            </div>

                            <div className="report-form-group full">
                                <label htmlFor="about">About The Pet</label>
                                <textarea id="about" name="about" rows="4"
                                    placeholder="Provide history, how they were found, etc."
                                    value={formData.about} onChange={handleInputChange} required></textarea>
                            </div>

                            <div className="report-form-group full">
                                <label>Pet Media</label>
                                <div className="upload-box">
                                    <div className="upload-icon">📷</div>
                                    <p>Upload photos or videos of the animal</p>
                                    <small>JPG, PNG, MP4 up to 10MB each • Max 5 files</small>
                                    <input type="file" multiple accept="image/*,video/*" disabled />
                                    <small style={{ display: 'block', marginTop: '8px', color: '#999' }}>
                                        (Photo uploads coming soon)
                                    </small>
                                </div>
                            </div>

                            <div className="submit-box">
                                {error && <div className="status-message error">{error}</div>}
                                {success && <div className="status-message success">{success}</div>}

                                <Button type="submit" disabled={loading} className="button-full">
                                    {loading ? 'Submitting...' : 'Submit Community Post'}
                                </Button>
                            </div>
                        </form>
                    </FormCard>
                </section>
            </div>
        </div>
    );
}

export default CommunityPage;