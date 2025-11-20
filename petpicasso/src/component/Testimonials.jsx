import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Emily B.",
      location: "USA",
      rating: 5,
      text: "The whole process took under 10 minutes and I got a digital file instantly. I ended up getting it on a mug too. Totally coming back for my other pets!",
    },
    {
      name: "Jason M.",
      location: "USA",
      rating: 5,
      text: "She's obsessed with her cat, so I surprised her with a Picasso style version. She screamed when she saw it and now it's her favorite thing in the house.",
    },
    {
      name: "Lily T.",
      location: "UK",
      rating: 5,
      text: "I chose the Warhol inspired style and it turned out so cool. People actually ask where I got it painted.",
    },
    {
        name: "Ryan B.",
        location: "Canada",
        rating: 5,
        text: "I ordered a Van Gogh portrait of my golden retriever and it almost made me cry! The brushwork and colors captured his personality perfectly. We hung it above the fireplace.",
    }
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Loved by Pet Parents Worldwide</h2>

        {/* Marquee Container */}
        <div className="relative overflow-hidden lg:p-4">
          {/* Marquee Track */}
          <div className="flex animate-marquee">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 w-80 mx-3">
                <div className="bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-100 h-64 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.location}</div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed flex-1 overflow-hidden">{testimonial.text}</p>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 w-80 mx-3">
                <div className="bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-100 h-64 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500 text-sm">{testimonial.location}</div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed flex-1 overflow-hidden">{testimonial.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
