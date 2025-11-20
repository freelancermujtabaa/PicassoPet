import React from 'react'
import Navbar from '../Navbar';
import FaqHero from './FaqHero'
import Faqs from '../Faqs';
import Testimonials from '../Testimonials';
import NewsletterFooterSection from '../Footer';

const FaqPage = () => {
  return (
    <div>
        <Navbar />
        <FaqHero />
        <Faqs />
        <Testimonials />
        <NewsletterFooterSection />
    </div>
  )
}

export default FaqPage