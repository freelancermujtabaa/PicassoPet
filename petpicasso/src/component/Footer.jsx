import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.svg";
import callIcon from '../assets/footerCallIcon.png';
import locationIcon from '../assets/footerLocationIcon.png';
import mailIcon from '../assets/footerMailIcon.png';
import { subscribeToNewsletter } from '../utils/api';

const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setModalMessage("Please enter your email");
            setShowModal(true);
            return;
        }

        setIsLoading(true);

        try {
            const result = await subscribeToNewsletter(email);
            
            if (result.success) {
                setModalMessage("🎉 Thanks for subscribing! Check your email for confirmation.");
                setEmail(""); // Clear the input
            } else {
                setModalMessage(result.error || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            setModalMessage("You have already subscribed to our newsletter");
        } finally {
            setIsLoading(false);
            setShowModal(true);
        }
    };
    return (
        <>
        <div className="bg-gradient-to-r from-[#51A5C9] to-[#4A90A4] py-8 px-6 rounded-2xl shadow-lg flex flex-col lg:flex-row items-center justify-between max-w-4xl mx-auto relative z-50 gap-6">
            <div className="text-white text-center lg:text-left flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold mb-3">Stay in the Loop</h2>
                <p className="text-sm lg:text-base text-white/90">Be the first to hear about new art styles, limited-edition releases, and exclusive discounts.</p>
            </div>
            <div className="relative w-full sm:w-80 lg:w-96">
                <form onSubmit={handleSubscribe}>
                <input
                    type="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 pr-24 rounded-lg border-none focus:outline-none bg-gray-100/80 text-gray-800 placeholder-gray-500"
                    disabled={isLoading}
                    />
                <button
                    type="submit"
                    disabled={isLoading}
                 className="absolute right-1 top-6 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
                </form>
            </div>
        </div>

         {/* Modal */}
         {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center mx-4">
                    <p className="text-gray-600 mb-4">{modalMessage}</p>
                    <button
                        onClick={() => setShowModal(false)}
                        className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-200">
                        Close
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

const FooterColumn = ({ title, items, isContact = false }) => {
    const handleLinkClick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // or 'auto' for instant scroll
        });
    };

    return (
        <div className="text-black">
            <h3 className="font-bold mb-4 text-lg text-black text-center md:text-left">{title}</h3>
            <ul className="space-y-3 text-center md:text-left">
                {items.map((item, index) => (
                    <li key={index} className={`text-sm hover:text-gray-600 cursor-pointer transition-colors ${isContact ? 'text-purple-600' : 'text-black'}`}>
                        {item.link ? (
                            <Link 
                                to={item.link} 
                                className="hover:text-gray-600 transition-colors"
                                onClick={handleLinkClick}
                            >
                                {item.text}
                            </Link>
                        ) : (
                            item.text || item
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Footer = () => {
    const companyItems = [
        { text: 'About us', link: '/about' },
        { text: 'Contact us', link: '/contactus' },
        { text: 'FAQs', link: '/faqs' }
    ];

    return (
        <footer className="bg-white text-black">
            <div className="max-w-7xl mx-auto pt-20 pb-8 px-4 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {/* Pet Picasso Brand Information */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className=" mb-4">
                            <img src={logo} alt="Pet Picasso Logo" className="w-32" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed text-center md:text-left max-w-xs">
                            We transform your pet's photo into a stunning piece of art inspired by legendary painters like Picasso, Van Gogh, and more. Digital files, prints, and gifts – made with love and colour.
                        </p>
                    </div>

                    {/* Company Links */}
                    <div className="flex justify-center md:justify-start">
                        <FooterColumn
                            title="Company"
                            items={companyItems}
                        />
                    </div>

                    {/* Contact Information */}
                    <div className="flex justify-center md:justify-start">
                        <div className="text-black">
                            <h3 className="font-bold mb-4 text-lg text-black text-center md:text-left">Contact</h3>
                            <div className="space-y-3 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start">
                                    <img
                                        src={mailIcon}
                                        alt="Email"
                                        className="w-4 h-4 mr-3"
                                    />
                                    <span className="text-sm text-purple-600">info@picassopet.com</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <img
                                        src={callIcon}
                                        alt="Phone"
                                        className="w-4 h-4 mr-3"
                                    />
                                    <span className="text-sm text-purple-600">+1 (267) 567-4199</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <img
                                        src={locationIcon}
                                        alt="Website"
                                        className="w-4 h-4 mr-3"
                                    />
                                    <span className="text-sm text-purple-600">www.picassopet.com</span>
                                </div>
                                <div className="flex items-start justify-center md:justify-start">
                                    <img
                                        src={locationIcon}
                                        alt="Location"
                                        className="w-4 h-4 mr-3 mt-0.5"
                                    />
                                    <span className="text-sm text-purple-600">Based in the U.S. – shipping worldwide</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 py-4 px-4 sm:px-8 lg:px-12">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    <p>© 2025 PicassoPet. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// Usage component showing how to implement the overlap
const NewsletterFooterSection = () => {
    return (
        <div className="relative">
            {/* Newsletter positioned to overlap footer */}
            <div className="relative z-10 transform translate-y-8 sm:translate-y-10 lg:translate-y-12 px-4">
                <Newsletter />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export { Newsletter, Footer, NewsletterFooterSection };
export default NewsletterFooterSection;