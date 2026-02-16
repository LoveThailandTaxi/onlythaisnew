import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SubscribePage from './pages/SubscribePage';
import DashboardRouter from './pages/DashboardRouter';
import ProfileView from './pages/ProfileView';
import MessagesPage from './pages/MessagesPage';
import ProfileSetup from './pages/ProfileSetup';
import CreatorSignUp from './pages/CreatorSignUp';
import BrowseProfiles from './pages/BrowseProfiles';
import AdminDashboard from './pages/AdminDashboard';
import PayPalDiagnostic from './pages/PayPalDiagnostic';
import VerifyEmail from './pages/VerifyEmail';
import AgeVerification from './components/AgeVerification';
import CookieConsent from './components/CookieConsent';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CommunityGuidelines from './pages/CommunityGuidelines';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AgeVerification />
          <CookieConsent />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/creator-signup" element={<CreatorSignUp />} />
          <Route path="/browse" element={<BrowseProfiles />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/paypal-diagnostic" element={<PayPalDiagnostic />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/guidelines" element={<CommunityGuidelines />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
