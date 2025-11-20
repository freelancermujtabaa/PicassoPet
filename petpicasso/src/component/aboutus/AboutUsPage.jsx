import Faqs from '../Faqs';
import NewsletterFooterSection from '../Footer';
import Navbar from '../Navbar';
import Testimonials from '../Testimonials';
import AboutHero from './AboutHero';
import PetStorySection from './PetStorySection';
import WhyChooseUs from './WhyChooseUs';

const AboutUsPage = () => {
  return (
    <div>
      <Navbar />
      <AboutHero />
      <PetStorySection />
      <WhyChooseUs />
      <Testimonials />
      <Faqs />
      <NewsletterFooterSection />
    </div>
  );
};

export default AboutUsPage;
