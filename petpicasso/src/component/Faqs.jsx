import React from "react"


export default function Faqs() {
    const faqs = [
      {
        id: "01",
        question: "How do I turn my pet photo into art?",
        answer:
          "Just upload a clear photo of your pet, choose your favorite art style (inspired by artists like Picasso, Van Gogh, and more), and we'll generate a custom portrait in seconds. No apps or tech skills needed!",
      },
      {
        id: "02",
        question: "Can I preview the artwork before buying?",
        answer:
          "Yes! We'll see a digital preview of your portrait before committing to any purchase. Love it? Then you can order prints, mugs, and more.",
      },
      {
        id: "03",
        question: "What products can I order my portrait on?",
        answer:
          "You can print your custom pet artwork on framed prints, canvas, mugs, tote bags, and more products to come soon! We use premium materials to make sure every piece is gallery-worthy.",
      },
      {
        id: "04",
        question: "Do you support more than one pet in a portrait?",
        answer:
          "Absolutely. Some styles allow for two or more pets in one composition. Great for sibling pets, pet & owner duos, or a family portrait with your whole crew.",
      },
      {
        id: "05",
        question: "What if my photo isn't perfect?",
        answer:
          "No problem! As long as your pet is clearly visible, we'll create something beautiful.",
      },
      {
        id: "06",
        question: "How many styles can I choose from?",
        answer:
          "We offer a handful of styles inspired by world-famous artists. New styles are added all the time — so you can always come back for a fresh look.",
      },
      {
        id: "07",
        question: "Can I gift a portrait to someone else?",
        answer:
          "Yes! You can create a portrait on their behalf or send a digital gift card so they can upload their own photo and choose their style. Perfect for birthdays, holidays, or pet memorials.",
      },
      {
        id: "08",
        question: "Do you offer refunds or revisions?",
        answer:
          "If you're not happy with your result, we'll work with you to fix it. Customer satisfaction is our priority — just reach out and we'll make it right.",
      },
    ]
  
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-100 to-orange-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions About Picasso Pet
            </h1>
            <p className="text-gray-600 text-lg">Have another question? Contact us by email.</p>
          </div>
  
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {faqs.map((faq) => (
              <div key={faq.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {faq.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  