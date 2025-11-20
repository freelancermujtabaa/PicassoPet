import { X, RotateCw, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function GeneratedImageSlider({ isOpen, onClose, imageUrl }) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [rotation, setRotation] = useState(0);
  const [isSavingRotation, setIsSavingRotation] = useState(false);

  // Update currentImageUrl when imageUrl prop changes
  useEffect(() => {
    setCurrentImageUrl(imageUrl);
    setRotation(0); // Reset rotation when new image loads
  }, [imageUrl]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360); // Simple CSS rotation like input image
  };

  const handleSaveRotation = async () => {
    if (!currentImageUrl || rotation === 0 || isSavingRotation) return;

    setIsSavingRotation(true);

    try {
      // Call backend to rotate and re-upload to Cloudinary
      const response = await fetch("https://petpicassobackend.onrender.com/api/rotate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          rotation: rotation,
        }),
      });

      const result = await response.json();

      if (result.success && result.newImageUrl) {
        setCurrentImageUrl(result.newImageUrl);
        // Update localStorage so the rotated image persists
        localStorage.setItem("aiImageUrl", result.newImageUrl);
        setRotation(0); // Reset rotation after saving
        console.log("Image rotated and uploaded to Cloudinary:", result.newImageUrl);
        alert("Rotation saved successfully!");
      } else {
        console.error("Failed to rotate image:", result.error);
        alert("Failed to save rotation. Please try again.");
      }
    } catch (error) {
      console.error("Error rotating image:", error);
      alert("Failed to save rotation. Please try again.");
    } finally {
      setIsSavingRotation(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end items-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/5"
        onClick={onClose}
      ></div>

      {/* Slider Panel (bottom-right) */}
      <div
        className={`relative w-[18rem] lg:w-96 max-w-full max-h-[80vh] bg-white shadow-2xl transform transition-transform duration-300 rounded-t-2xl rounded-l-2xl overflow-y-auto
        ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ marginRight: "1.5rem", marginBottom: "1.5rem" }} // matches floating button spacing
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Generated Image
          </h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {currentImageUrl ? (
            <div className="space-y-3">
              {/* Rotate instruction */}
              {rotation !== 0 && (
                <div className="flex items-center justify-between text-sm bg-orange-50 p-2 rounded-lg">
                  <p className="text-orange-700">Image rotated {rotation}°</p>
                  <button
                    onClick={handleSaveRotation}
                    disabled={isSavingRotation}
                    className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    {isSavingRotation ? (
                      <>
                        <Save className="w-3 h-3 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save Rotation
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Image with rotate button */}
              <div className="relative">
                <img
                  src={currentImageUrl}
                  alt="Generated"
                  className="w-full rounded-lg shadow-md transition-transform duration-300"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                {/* Rotate Button Overlay */}
                <button
                  onClick={handleRotate}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  title="Rotate image 90°"
                >
                  <RotateCw className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-20">
              No image available.
            </p>
          )}
        </div>

        {/* Footer */}
        {currentImageUrl && (
          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-2 rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
