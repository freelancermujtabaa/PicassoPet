import React from 'react';
import catFrame from '../../assets/aboutus/whychooseusframe.png';

const WhyChooseUs = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-10">
        {/* Text Content */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why choose us?</h2>
          <p className="text-gray-700 leading-7 mb-4">
            We create beautiful, high-quality pet portraits that are as unique as your furry (or feathery or scaly!) friends.
            Whether you want a playful cartoon-style piece, a regal renaissance look, or a minimalist modern design, will bring your vision to life.
          </p>
          <ul className="text-gray-800 space-y-2">
            <li>✔️ 100% custom artwork</li>
            <li>✔️ High-resolution printing & durable frames</li>
            <li>✔️ Made with love by real pet people</li>
          </ul>
        </div>

        {/* Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img src={catFrame} alt="Why Choose Us Frame" className="w-[300px] md:w-[400px] object-contain" />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
