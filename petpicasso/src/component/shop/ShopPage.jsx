import React, { useEffect, useState } from "react";
import Faqs from "../Faqs";
import NewsletterFooterSection from "../Footer";
import Navbar from "../Navbar";
import Testimonials from "../Testimonials";
import ProductListing from "./ProductListing";
import ShopHero from "./ShopHero";
import GeneratedImageSlider from "./GeneratedImageSlider";
import { ImageIcon } from "lucide-react";

const ShopPage = () => {
  const [showSlider, setShowSlider] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("aiImageUrl");
    if (storedImage) {
      setGeneratedImage(storedImage);
      setShowSlider(true); // auto-open when user lands
    }
  }, []);

  return (
    <div>
      <Navbar />
      <ShopHero />
      <ProductListing />
      <Testimonials />
      <Faqs />
      <NewsletterFooterSection />

      {/* Floating button (only shows if image exists) */}
      {generatedImage && !showSlider && (
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={() => setShowSlider(true)}
        >
          <ImageIcon className="w-6 h-6" />
        </button>
      )}

      {/* Slider */}
      <GeneratedImageSlider
        isOpen={showSlider}
        onClose={() => setShowSlider(false)}
        imageUrl={generatedImage}
      />
    </div>
  );
};

export default ShopPage;
