import React from "react"
import cat1 from "../assets/c1.svg"
import cat2 from "../assets/c2.svg"
import cat3 from "../assets/c3.svg"
import dog1 from "../assets/d2.png"

export default function Styles() {
  const artStyles = [
    {
      id: "van-gogh",
      name: "Van Gogh",
      color: "bg-orange-500",
      description: "Swirling, textured, and emotional - perfect for dreamy pets with soulful eyes.",
      image: cat2,
    },
    {
      id: "picasso",
      name: "Picasso",
      color: "bg-yellow-500",
      description: "Bold, colorful and full of personality - for the quirky, unforgettable companion.",
      image: cat1,
    },
    {
      id: "monet",
      name: "Monet",
      color: "bg-purple-500",
      description: "Soft, light, gentle strokes, and peaceful energy - ideal for serene pets with a calm nature.",
      image: dog1,
    },
    {
      id: "warhol",
      name: "Warhol",
      color: "bg-red-500",
      description: "Vibrant pop-art energy in punchy colors - a loud and fun tribute to your pet's bold personality.",
      image: cat3,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className=" mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pick Your Pet's Artistic Destiny</h1>
        <p className="text-lg text-gray-600  mx-auto">
          Choose a style that fits your pet's soul. Over 100+ iconic looks - from moody Impressionism to bold Cubism.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {/* Marquee Track */}
        <div className="flex animate-marquee">
          {/* First set of cards */}
          {artStyles.map((style) => (
            <div
              key={`first-${style.id}`}
              className="flex-shrink-0 w-64 mx-3"
            >
              <div className="overflow-hidden border-[1px] border-[#ECE8DD] transition-shadow duration-300 bg-[#FAF8F5] rounded-lg ">
                {/* Image Container - Top Half */}
                <div className="aspect-auto relative overflow-hidden lg:p-1">
                  <img
                    src={style.image}
                    alt={`Pet portrait in ${style.name} style`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content - Bottom Half */}
                <div className="p-2">
                  {/* Style Name with Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{style.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{style.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">{style.description}</p>

                  {/* Try Button */}
                  <button
                    className="w-full justify-start mb-2 p-0 h-auto font-medium text-gray-900 hover:text-gray-700 hover:bg-transparent bg-transparent border-none cursor-pointer text-left"
                  >
                    {style.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {artStyles.map((style) => (
            <div
              key={`second-${style.id}`}
              className="flex-shrink-0 w-64 mx-3"
            >
              <div className="overflow-hidden border-[1px] border-[#ECE8DD] transition-shadow duration-300 bg-[#FAF8F5] rounded-lg ">
                {/* Image Container - Top Half */}
                <div className="aspect-auto relative overflow-hidden lg:p-1">
                  <img
                    src={style.image}
                    alt={`Pet portrait in ${style.name} style`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content - Bottom Half */}
                <div className="p-2">
                  {/* Style Name with Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{style.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">{style.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">{style.description}</p>

                  {/* Try Button */}
                  <button
                    className="w-full justify-start mb-2 p-0 h-auto font-medium text-gray-900 hover:text-gray-700 hover:bg-transparent bg-transparent border-none cursor-pointer text-left"
                  >
                    {style.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}