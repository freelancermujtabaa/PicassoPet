import Faqs from '../Faqs';
import NewsletterFooterSection from '../Footer';
import Navbar from '../Navbar';
import Testimonials from '../Testimonials';
import ContactUsForm from './ContactUsForm';
import ContactUsHero from './ContactUsHero';

const ContactUsPage = () => {
  return (
    <div>
        <Navbar />
        <ContactUsHero />
        <ContactUsForm />
        <Faqs />
        <Testimonials />
        <NewsletterFooterSection />
    </div>
  )
}

export default ContactUsPage