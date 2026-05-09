import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/LandingPage.jsx';
import Login from './pages/auth/LoginPage.jsx';
import Signup from './pages/auth/SignupPage.jsx';
import AdoptionList from './pages/pets/AdoptionListPage.jsx';
import PetDetail from './pages/pets/PetDetailPage.jsx';
import RequestRescue from './pages/rescue/RequestRescue.jsx'; //delete when done testing
import RequestDetailsPage from './pages/rescue/RequestDetailsPage.jsx';
import CommunityPage from './pages/community/CommunityPage.jsx'; //delete when done testing
import CommunityDetailsPage from './pages/community/CommunityDetailsPage.jsx';
import AdoptionFormPage from './pages/pets/AdoptionFormPage.jsx';
import AdoptionDetailsPage from './pages/pets/AdoptionDetailsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotificationPage from './pages/NotificationPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import AboutDevelopersPage from './pages/AboutDevelopersPage.jsx';

// Redirects admins to /dashboard; renders the given element for regular users.
function UserOnlyRoute({ element }) {
  const { user } = useAuth();
  if (user?.is_admin === 1) return <Navigate to="/dashboard" replace />;
  return element;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes — anyone can view */}
          <Route path="/" element={<UserOnlyRoute element={<Landing />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pets" element={<AdoptionList />} />
          <Route path="/pets/:id"  element={<PetDetail />} />
          
          <Route
            path="/rescue"
            element={
                <RequestRescue />
            }
          />

          <Route
            path="/rescue/:reportId"
            element={
              <ProtectedRoute>
                <RequestDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
                <CommunityPage />
            }
          />

          <Route
            path="/community/:postId"
            element={
              <ProtectedRoute>
                <CommunityDetailsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/adopt/:id"
            element={
                <AdoptionFormPage />
            }
          />

          <Route
            path="/adopt/application/:adoption_id"
            element={
              <ProtectedRoute>
                <AdoptionDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Refactored user.name dropdown */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
         
          {/* Protected routes — only for logged-in users */}
          {/* Add back protected routes after testing */}

          {/* 404 — named route + catch-all */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/about-us" element={<AboutDevelopersPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;