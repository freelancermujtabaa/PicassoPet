import React from 'react';

import stepdog from "../assets/image800.png";
import cat1 from "../assets/cat1.svg"
import cat2 from "../assets/cat2.svg";
import cat3 from "../assets/cat3.svg";
import upload from "../assets/upload.svg";
import bag from "../assets/shop/bag.png";
import frame1 from "../assets/shop/framestyle.png";
import frame2 from "../assets/shop/framestyle2.png";

const StepCard = ({ number, title, description, hasCardEffect = false }) => {
  if (hasCardEffect) {
    return (
      <div className="flex flex-col items-center text-center p-4 relative">
        {/* Stacked Cards Effect */}
        <div className="relative mb-4 group">
          <div className="flex">
            {number === "2" ? (
              // Step 2 - Upload step with colorful cards
              <>
                <div className="-mr-32 sm:-mr-40 md:-mr-48 lg:-mr-52 hover:-mr-2 hover:rotate-0 rotate-3 transition-all duration-300 ease-in-out overflow-hidden w-32 h-40 sm:w-40 sm:h-48 md:w-44 md:h-52 lg:w-48 lg:h-60">
                  <img src={upload} alt="upload" className="w-full h-full object-cover" />
                </div>
                <div className="hover:-mr-2 hover:rotate-0 rotate-0 transition-all duration-300 ease-in-out overflow-hidden w-32 h-40 sm:w-40 sm:h-48 md:w-44 md:h-52 lg:w-48 lg:h-60">
                  <img src={upload} alt="upload" className="w-full h-full object-cover" />
                </div>
              </>
            ) : number === "4" ? (
              // Step 4 - Shop items (bag + frames)
              <>
                <div className="-mr-32 sm:-mr-36 md:-mr-40 lg:-mr-48 hover:-mr-2 hover:rotate-0 rotate-0 transition-all duration-300 ease-in-out">
                  <img src={frame2} alt="Bag" className="w-36 h-40 sm:w-40 sm:h-48 md:w-44 md:h-52 lg:w-52 lg:h-60 object-contain" />
                </div>
                <div className="-mr-32 sm:-mr-36 md:-mr-40 lg:-mr-48 hover:-mr-2 hover:rotate-0 rotate-1 transition-all duration-300 ease-in-out">
                  <img src={bag} alt="Frame Style 1" className="w-38 h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 lg:w-56 lg:h-60 object-contain" />
                </div>
                <div className="hover:-mr-2 hover:rotate-0 rotate-2 transition-all duration-300 ease-in-out">
                  <img src={frame1} alt="Frame Style 2" className="w-38 h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 lg:w-56 lg:h-60 object-contain" />
                </div>
              </>
            ) : (
              // Step 3 - Cat images (existing)
              <>
                <div className="-mr-32 sm:-mr-36 md:-mr-40 lg:-mr-48 hover:-mr-2 hover:rotate-0 rotate-0 transition-all duration-300 ease-in-out">
                  <img src={cat1} alt="Cat 1" className="w-36 h-40 sm:w-40 sm:h-48 md:w-44 md:h-52 lg:w-52 lg:h-60 object-contain" />
                </div>
                <div className="-mr-32 sm:-mr-36 md:-mr-40 lg:-mr-48 hover:-mr-2 hover:rotate-0 rotate-1 transition-all duration-300 ease-in-out">
                  <img src={cat2} alt="Cat 2" className="w-38 h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 lg:w-56 lg:h-60 object-contain" />
                </div>
                <div className="hover:-mr-2 hover:rotate-0 rotate-2 transition-all duration-300 ease-in-out">
                  <img src={cat3} alt="Cat 3" className="w-38 h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 lg:w-56 lg:h-60 object-contain" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#385A99] text-white rounded-full flex items-center justify-center mb-2 text-sm sm:text-base">{number}</div>
        <h3 className="text-lg sm:text-xl font-bold text-[#385A99] mb-2">{title}</h3>
        <p className="text-gray-600 p-2 px-4 sm:p-4 sm:px-6 md:px-8 lg:px-10 text-sm sm:text-base">{description}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-32 h-40 sm:w-40 sm:h-48 md:w-44 md:h-52 lg:w-48 lg:h-60 mb-4 rounded-lg overflow-hidden">
        <img src={stepdog} alt={title} className="w-full h-full object-contain" />
      </div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#385A99] text-white rounded-full flex items-center justify-center mb-2 text-sm sm:text-base">{number}</div>
      <h3 className="text-lg sm:text-xl font-bold text-[#385A99] mb-2">{title}</h3>
      <p className="text-gray-600 p-2 px-4 sm:p-4 sm:px-6 md:px-8 lg:px-10 text-sm sm:text-base">{description}</p>
    </div>
  );
};

const Steps = () => {
  const steps = {
    step1: {
      number: "3",
      title: "Generate Your Unique Pet Portrait",
      // description: "Train your model by uploading a few recent photos of your pet.",
      image: "stepdog",
    },
    step2: {
      number: "2",
      title: "Upload A Picture Of Your Pet",
      // description: "Select an album from our extensive list to create stunning images.",
      image: "upload",
      hasCardEffect: true,
    },
    step3: {
      number: "1",
      title: "Select An Artist",
      // description: "Get your personalized photo pack and start using them on your phone.",
      hasCardEffect: true,
    },
    step4: {
      number: "4",
      title: "Checkout With Your Pet Memorabilia",
      // description: "Get your personalized photo pack and start using them on your phone.",
      hasCardEffect: true,
    },
  };

  return (
    <div className=" flex flex-col items-center py-8 sm:py-12 lg:py-16 lg:px-32">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E1E1E] mb-4 text-center px-4">How It Works</h2>
      <div className="flex flex-col lg:flex-row justify-around w-full max-w-[90rem] gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6">
        <StepCard {...steps.step3} />
        <StepCard {...steps.step2} />
        <StepCard {...steps.step1} />
        <StepCard {...steps.step4} />
      </div>
    </div>
  );
};

export default Steps;