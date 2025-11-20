import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Faqs from './component/Faqs.jsx';
import NewsletterFooterSection from './component/Footer.jsx';
import Frames from './component/Frames.jsx';
import HeroSection from './component/Hero.jsx';
import Navbar from "./component/Navbar.jsx";
import Steps from './component/Steps.jsx';
import Styles from './component/Styles.jsx';
import Testimonials from './component/Testimonials.jsx';
import AboutUsPage from './component/aboutus/AboutUsPage.jsx';
import ContactUsPage from './component/contactus/ContactUsPage.jsx';
import FaqPage from './component/faq/FaqPage.jsx';
import ShopPage from './component/shop/ShopPage.jsx';
import OAuthSuccess from './component/OAuthSuccess.jsx';
import OAuthError from './component/OAuthError.jsx';
import { useEffect } from 'react';
// Home page component
const HomePage = () => {
  return (
    <>
      <Navbar />
      <HeroSection/>
      <Steps/>
      <Styles/>
      <Frames/>
      <Testimonials/>
      <Faqs/>
      <NewsletterFooterSection/>
    </>
  );
};

function App() {
  useEffect(() => {
    // Ping backend when app loads to wake it up
    const wakeUpBackend = () => {
      fetch('https://petpicassobackend.onrender.com/api/health')
        .then(() => console.log('✅ Backend warmed up'))
        .catch(err => console.log('❌ Backend warming failed:', err));
    };
    // Initial wake-up call
    wakeUpBackend();
    
    // Ping every 5 minutes while user is on site
    const interval = setInterval(wakeUpBackend, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contactus" element={<ContactUsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/auth/error" element={<OAuthError />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
