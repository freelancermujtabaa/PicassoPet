import React, { useState } from "react";
import formBg from '../../assets/contactus/formbg.png';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

const ContactUsForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("https://petpicassobackend.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("❌ Error submitting contact form:", err);
      setStatus("error");
    }
  };


  return (
    <section className="bg-white py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Get In Touch</h2>
      <div className="max-w-6xl mx-auto px-4 py-4 grid lg:grid-cols-2 gap-8 shadow-2xl rounded-2xl bg-white">
        {/* Contact Info Panel with background image */}
        <div
          className="text-white rounded-xl p-8 shadow-lg relative overflow-hidden bg-cover bg-bottom"
          style={{ backgroundImage: `url(${formBg})` }}
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-3xl font-semibold mb-1">Contact Information</h3>
              <p className="mb-6 text-lg">Get in Touch with PicassoPet</p>
            </div>
            <div className="">
              <ul className="space-y-6 text-lg">
                <li className="flex items-center gap-3 ">
                  <FaEnvelope /> info@picassopet.com
                </li>
                <li className="flex items-center gap-3 ">
                  <FaPhone /> +1 (267) 567-4199
                </li>
                <li className="flex items-center gap-3 ">
                  <FaMapMarkerAlt /> Based in the U.S. — proudly shipping worldwide
                </li>
              </ul>

              {/* Social Icons */}
              <div className="flex gap-4 mt-8 text-xl">
                <a href="#" className="hover:text-gray-200"><FaFacebook /></a>
                <a href="#" className="hover:text-gray-200"><FaInstagram /></a>
                <a href="#" className="hover:text-gray-200"><FaTiktok /></a>
              </div>
            </div>
          </div>

          {/* Optional dark overlay for better text readability */}
          <div className="absolute inset-0 bg-[#4DB2E2]/80 z-0 rounded-xl"></div>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-xl p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name<span className="text-red-500">*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter First Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name<span className="text-red-500">*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter Last Name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email<span className="text-red-500">*</span></label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Email address"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Subject<span className="text-red-500">*</span></label>
              <input
                name="subject" value={formData.subject} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Subject"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange}
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Write your message..."
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition"
              >
                Submit
              </button>
            </div>
          </form>

          {status === "loading" && <p className="mt-3 text-blue-500">Sending...</p>}
          {status === "success" && <p className="mt-3 text-green-600">✅ Your message has been sent!</p>}
          {status === "error" && <p className="mt-3 text-red-600">❌ Something went wrong. Try again.</p>}
        </div>
      </div>
    </section>
  );
};

export default ContactUsForm;
