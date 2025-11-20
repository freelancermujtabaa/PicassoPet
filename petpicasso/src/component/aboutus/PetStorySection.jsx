import React from 'react';
import petFrames from '../../assets/aboutus/Groupframes.png';

const PetStorySection = () => {
  return (
    <>
      {/* Main Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-10">
          {/* Image */}
          <div className="flex-shrink-0">
            <img src={petFrames} alt="Pet Frames" className="w-[300px] md:w-[400px] object-contain" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Celebrating Pets Through Custom Portraits
            </h2>
            <p className="text-gray-700 leading-7">
              At Pet Picasso, we turn your pet’s photo into a one-of-a-kind portrait inspired by history’s greatest artists -
              from bold Picasso-style Cubism to dreamy Van Gogh brushstrokes and vibrant Warhol pop art.
              Whether it’s a playful gift or a cherished memorial, our mission is simple: celebrate the bond between you
              and your pet through timeless, custom art.
              <br /><br />
              We believe every pet has a story - and it deserves to be told in color. That’s why we create custom portraits that
              transform your companion into stunning works of art.
              <br />
              From digital brush to printed frame, every piece is thoughtfully crafted to highlight your pet’s unique charm,
              personality, and spirit. Whether you’re celebrating a new puppy, remembering a beloved cat, or just want something
              joyful on your wall, we make it easy - and fun.
              <br />
              You upload the photo. We handle the art. You get a museum-worthy portrait you’ll treasure forever.
            </p>
          </div>
        </div>
      </section>

      {/* Gradient Bottom Info Section */}
      <section className="bg-gradient-to-r from-[#F1E5FC] to-[#FDECF4] py-12 max-w-6xl mx-auto px-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-800 text-lg leading-8">
          <p>
            We offer a range of signature styles inspired by iconic artists - whether you're into Cubism, Impressionism,
            or bold pop-art color.
            <br />
            Each portrait is made with care, printed on high-quality materials, and ready to hang or gift. It’s a keepsake you’ll be proud to show off - or share with someone who loves their pet as much as you do.
            <br />
            Whether you're shopping for yourself or someone special, we're here to help you celebrate your furry, feathered,
            or scaly friend with artwork that truly speaks to the heart.
          </p>
        </div>
      </section>
    </>
  );
};

export default PetStorySection;
