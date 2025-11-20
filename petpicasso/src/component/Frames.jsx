import React from "react"
import styles from "../assets/styles.svg"

const Frames = () => {
  return (
    <section className="bg-gradient-to-r from-purple-100 to-orange-100 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
          {/* Left side - One Big Picture */}
          <div className="flex-1 relative w-full flex justify-center lg:justify-start">
            <div className="relative">
              {/* One large image representing the entire pet portrait display */}
              <div className=" rounded-lg p-6">
                <div className="relative">
                  {/* Main large image */}
                  <img
                    src={styles}
                    alt="Pet Portrait Shop Display"
                    className="w-full max-w-md h-auto object-cover rounded-lg"
                  />

                  {/* Overlay to create the wall and shelf effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-50 opacity-20 rounded-lg"></div>

                  {/* Decorative frame effect */}
                  <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-white opacity-30 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 max-w-lg text-center lg:text-left">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Welcome to Our Shop - Find Your Pet's Perfect Portrait
              </h2>

              <p className="text-gray-700 text-base leading-relaxed">
                Your pet's masterpiece deserves more than just a screen. From premium framed prints to mugs, tote bags, and more - you can bring your custom portrait to life on beautiful, high-quality products. Whether you're gifting a friend, remembering a beloved companion, or simply showing off your furry bestie, our shop makes it easy to turn pet love into keepsake magic. Every item is printed with care, made to last, and guaranteed to make tails wag.
              </p>

              <button className="bg-gradient-to-r from-orange-400 to-purple-500 hover:from-orange-500 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-lg transform transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => window.location.href = '/shop'}>
                Explore the Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Frames;