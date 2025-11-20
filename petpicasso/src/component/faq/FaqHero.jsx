import React from 'react'
import petsHero from '../../assets/faq/faqheropic.png';

const FaqHero = () => {
    return (
        <section className="bg-[#4DB2E2] pt-8 md:pt-20 flex flex-col md:flex-row items-start justify-evenly px-4">
            <div className="text-center md:text-start mb-6 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 pt-5">FAQs</h1>
                <p className="text-lg text-black">Bring your pet's portrait to life — choose from a curated selection of <br /> 
                high-quality prints, home decor, and gifts featuring your custom artwork.</p>
            </div>
            <div className="flex justify-center  w-full md:w-auto">
                <img src={petsHero} alt="Pets Hero" className="max-h-[250px] object-contain" />
            </div>
        </section>
    )
}

export default FaqHero;