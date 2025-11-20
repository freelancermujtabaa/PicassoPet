import React, { useEffect, useState } from "react";

const ProductListing = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://petpicassobackend.onrender.com/api/products")
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const handleBuyNow = async (variantId) => {
    const aiImageUrl = localStorage.getItem("aiImageUrl");
    let userEmail = "";

    // Parse user object from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    if (!aiImageUrl) {
      alert("Please generate your pet art first before purchasing.");
      return;
    }

    try {
      const res = await fetch("https://petpicassobackend.onrender.com/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1, aiImageUrl, userEmail }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            {/* <p className="text-gray-600 text-sm flex-grow">{product.description}</p> */}
            <p className="mt-2 font-medium">${product.price}</p>
            <button
              className="mt-4 w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-lg"
              onClick={() => handleBuyNow(product.variantId)}
            >
              Buy Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductListing;
