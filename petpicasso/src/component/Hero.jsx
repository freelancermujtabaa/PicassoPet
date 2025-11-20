import { useState } from "react";
import { Upload, ImageIcon, Loader2, RotateCw, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import frame1 from "../assets/frame1.svg";
import frame2 from "../assets/frame2.svg";
import frame3 from "../assets/frame3.svg";
import frame4 from "../assets/d2.png";
import frame5 from "../assets/frame5.svg";
import AlertSignInModal from "./AlertSignInModal";
import LoginModal from "./LoginModal";


export default function PetArtCreator() {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showSelectStyleModal, setShowSelectStyleModal] = useState(false);
  const [showSignInAlert, setShowSignInAlert] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [generatedImageRotation, setGeneratedImageRotation] = useState(0);
  const [isSavingRotation, setIsSavingRotation] = useState(false);

  const { isLoggedIn, login } = useAuth();

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360); // rotate clockwise for input image
  };

  const handleRotateGenerated = () => {
    setGeneratedImageRotation((prev) => (prev + 90) % 360); // Simple CSS rotation like input image
  };

  const handleSaveGeneratedRotation = async () => {
    if (!generatedImage || generatedImageRotation === 0 || isSavingRotation) return;

    setIsSavingRotation(true);

    try {
      // Call backend to rotate and re-upload to Cloudinary
      const response = await fetch("https://petpicassobackend.onrender.com/api/rotate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          rotation: generatedImageRotation,
        }),
      });

      const result = await response.json();

      if (result.success && result.newImageUrl) {
        setGeneratedImage(result.newImageUrl);
        // Update localStorage so the rotated image persists
        localStorage.setItem("aiImageUrl", result.newImageUrl);
        setGeneratedImageRotation(0); // Reset rotation after saving
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

  const artStyles = [
    {
      id: 1,
      name: "Picasso",
      image: frame1,
      description:
        "A revolutionary style that abandons single-point perspective, fracturing objects into geometric forms to show multiple viewpoints at once.",
      keyElements: [
        "Fragmented forms",
        "Geometric shapes (cubes, cones)",
        "Analytical deconstruction",
        "Simultaneous perspectives",
      ],
      colorPalette: ["Monochromatic (often ochres, greys, blues)", "Muted earth tones"],
      mood: "Intellectual, Analytical, Revolutionary",
    },
    {
      id: 2,
      name: "Van Gogh",
      image: frame2,
      description:
        "A post-impressionist style known for its emotional intensity, bold colors, and dynamic, expressive brushwork that conveys movement and feeling.",
      keyElements: [
        "Thick, impasto brushstrokes",
        "Swirling, rhythmic patterns",
        "Bold, contrasting colors",
        "Emotional expression over realism",
      ],
      colorPalette: ["Vivid Yellows", "Deep Blues", "Lush Greens", "Energetic Contrasts"],
      mood: "Emotional, Turbulent, Passionate, Dynamic",
    },
    {
      id: 3,
      name: "Warhol",
      image: frame3,
      description:
        "An art movement that draws inspiration from commercial and popular culture, using repetition and bold colors to critique and celebrate mass consumerism.",
      keyElements: [
        "Repetition of imagery",
        "Bold outlines",
        "Ben-Day dots/screen print effect",
        "Iconic consumer subjects",
      ],
      colorPalette: ["High-contrast", "Vibrant, saturated colors", "Artificial and flat tones"],
      mood: "Ironic, Celebratory, Bold, Playful",
    },
    {
      id: 4,
      name: "Monet",
      image: frame4,
      description:
        "A pioneer of Impressionism, focused on capturing the transient effects of light and atmosphere in the moment, often en plein air (outdoors).",
      keyElements: [
        "Visible, broken brushstrokes",
        "Play of light and reflection",
        "Depiction of atmosphere",
        "Everyday subject matter",
      ],
      colorPalette: ["Soft pastels", "Luminous light effects", "Natural and blended colors"],
      mood: "Tranquil, Ephemeral, Calm, Fleeting",
    },
    {
      id: 5,
      name: "Hokusai",
      image: frame5,
      description:
        "A master of Japanese woodblock printing (ukiyo-e), known for dynamic compositions, strong lines, and beautiful, flat color areas that greatly influenced Western art.",
      keyElements: [
        "Strong, organic lines",
        "Flat areas of color",
        "Dynamic perspectives",
        "Nature and everyday life themes",
      ],
      colorPalette: ["Indigo blues", "Berries and reds", "Greens from the landscape", "Earth pigments"],
      mood: "Serene, Powerful, Balanced, Mythical",
    },
  ];



  // Helper: rotate base64 image into a File
  const getRotatedImageFile = async (imageUrl, rotation) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const angle = (rotation * Math.PI) / 180;

        // Swap width/height for 90/270 rotations
        if (rotation % 180 === 0) {
          canvas.width = img.width;
          canvas.height = img.height;
        } else {
          canvas.width = img.height;
          canvas.height = img.width;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          const file = new File([blob], "rotated-pet.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
    });
  };



  //  IMPORTANT: style check happens BEFORE login check
  const handleCreatePetArt = () => {
    if (!uploadedImage) return; // guard, button normally disabled without an image

    // 1) If no style selected -> show the select-style modal first
    if (!selectedStyle) {
      setShowSelectStyleModal(true);
      return;
    }

    // 2) Only after style is selected, check auth and show sign-in alert if needed
    if (!isLoggedIn) {
      setShowSignInAlert(true);
      return;
    }

    // 3) If style selected and logged in -> generate
    generatePetArt();
  };

  const generatePetArt = async () => {
    if (!uploadedImage || !selectedStyle) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const selectedArtStyle = artStyles.find((s) => s.id === selectedStyle);
      const prompt = `A beautiful portrait of this pet, ${selectedArtStyle.description}. The image must feature ${selectedArtStyle.keyElements.join(
        ", "
      )}, using a color palette of ${selectedArtStyle.colorPalette.join(", ")} to create a ${selectedArtStyle.mood} mood. High quality, detailed, artistic masterpiece.`;

      console.log("Starting image-to-image generation...");
      console.log("Selected style:", selectedArtStyle.name);
      console.log("Prompt:", prompt);

      let file;

      // If rotation is applied, generate rotated file
      if (rotation !== 0) {
        file = await getRotatedImageFile(uploadedImage, rotation);
        console.log("Rotated file created:", file.name, file.size, "bytes");
      } else {
        // Otherwise, use original image
        const response = await fetch(uploadedImage);
        const blob = await response.blob();
        file = new File([blob], "pet-image.jpg", { type: "image/jpeg" });
        console.log("Original file created:", file.name, file.size, "bytes");
      }

      console.log("Image file created:", file.name, file.size, "bytes");

      // Create FormData for the request
      const formData = new FormData();
      formData.append("image", file);
      formData.append("prompt", prompt);
      formData.append("style", selectedArtStyle.name);
      formData.append("isImageToImage", "true");

      const apiResponse = await fetch("https://petpicassobackend.onrender.com/api/generate", {
        method: "POST",
        body: formData,
      });


      const result = await apiResponse.json();

      if (result.success && result.image) {
        setGeneratedImage(result.image);
        setGeneratedImageRotation(0); // Reset rotation for new image
        console.log("Generated image URL:", result.image);
        localStorage.setItem("aiImageUrl", result.image); // Store for checkout
      } else {
        setError(result.error || "No image was generated. Please try again.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setGeneratedImage(null); // Reset generated image when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setGeneratedImage(null); // Reset generated image when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:px-24 ">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Picasso Pet</span>
            <span className="text-gray-800"> - Turn Your Pet into a Masterpiece</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload a photo and transform your pet into custom art inspired by the world's most iconic painters – from Van Gogh to Warhol and beyond.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
          {/* Left Panel - Pick a Style */}
          <div className="flex-initial bg-[#57A5c9] rounded-2xl p-6 text-white">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Pick a Style</h2>
              <p className="text-blue-100 text-sm">Turn your pet photo into art with your favorite look. Tap a style to preview how it'll appear.</p>
            </div>

            {/* Art Style Grid  */}
            <div id="style-grid" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:h-96 h-auto mb-6 rounded-lg p-2 backdrop-blur-sm bg-white/30 gap-2 sm:gap-3">
              {artStyles.map((style) => (
                <div
                  key={style.id}
                  className={`relative cursor-pointer transition-all duration-200
        ${selectedStyle === style.id ? "" : "hover:scale-105"}
      `}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    if (showSelectStyleModal) setShowSelectStyleModal(false);
                  }}
                >
                  <div className="aspect-square rounded-lg flex items-center justify-center">
                    <div
                      className={`rounded-lg flex items-center justify-center 
            ${selectedStyle === style.id ? "border border-white shadow-lg " : ""}`}
                    >
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-32 h-32 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-36 object-contain border-2 border-white/30 rounded-lg"
                      />
                    </div>
                  </div>
                  <p className="text-center text-[12px] sm:text-xs mt-1 md:mt-2 font-medium lg:text-[15px]">{style.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Make Pet Art */}
          <div className="flex-1 bg-[#57A5C9] rounded-2xl p-6 text-white">
            <div className="mb-3">
              <h2 className="text-xl font-semibold mb-1 flex items-center">
                {/* <span className="w-2 h-2 bg-white rounded-full mr-2"></span> */}
                Create Your Art
              </h2>
              <p className="text-blue-100 text-sm">Upload a photo of your pet to get started.</p>
            </div>

            {/* Rotate Button - positioned above image area */}
            {uploadedImage && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <p className="text-blue-100 text-xs italic text-center sm:text-left">
                  Make sure your image is upright and properly oriented
                </p>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2 transition-all transform hover:scale-105 w-full sm:w-auto"
                  onClick={handleRotate}
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-white/40 rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-white/60 transition-colors relative overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              {uploadedImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded pet"
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">Click to change image</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-white font-medium mb-1 text-center">Click or drag an image here</p>
                  <p className="text-white/60 text-sm text-center px-4">
                    Choose from your photos or drag and drop
                  </p>
                  <div className="mt-4 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  </div>
                </>
              )}
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Create Button */}
            <button
              className="w-full mt-6 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              disabled={!uploadedImage || isGenerating}
              onClick={handleCreatePetArt}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Art...
                </>
              ) : !isLoggedIn ? (
                "Transform My Pet"
              ) : (
                "Transform My Pet"
              )}
            </button>


          </div>
        </div>

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="mt-8 max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Your Pet Masterpiece
              </h3>

              {/* Rotation notification and save button */}
              {generatedImageRotation !== 0 && (
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-orange-700 text-sm font-medium text-center sm:text-left">
                    Image rotated {generatedImageRotation}° - Save to apply permanently
                  </p>
                  <button
                    onClick={handleSaveGeneratedRotation}
                    disabled={isSavingRotation}
                    className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full sm:w-auto"
                  >
                    {isSavingRotation ? (
                      <>
                        <Save className="w-4 h-4 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Rotation
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* Fixed Container that won't move */}
                <div className="relative bg-gray-50 rounded-lg p-4">
                  {/* Image wrapper with fixed aspect ratio */}
                  <div className="relative w-full aspect-square max-w-2xl mx-auto">
                    <img
                      src={generatedImage}
                      alt="Generated pet art"
                      className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-md transition-transform duration-300"
                      draggable="false"
                      style={{
                        transform: `rotate(${generatedImageRotation}deg)`,
                        transformOrigin: 'center'
                      }}
                    />
                    {/* Rotate Button - positioned relative to the image container */}
                    <button
                      onClick={handleRotateGenerated}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 border border-gray-200 z-10"
                      title="Rotate image 90°"
                    >
                      <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all font-medium text-center"
                    onClick={() => window.location.href = '/shop'}
                  >
                    Go to Shop Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Select Style Modal */}
      {showSelectStyleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSelectStyleModal(false)} />
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 z-10">
            <h3 className="text-lg font-semibold mb-2">Choose an Art Style</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please select an art style before creating your pet artwork. Click any style on the left to pick it.
            </p>
            <div className="flex gap-3 justify-end">
              {/* <button
                className="px-4 py-2 rounded-lg bg-gray-200"
                onClick={() => {
                  setShowSelectStyleModal(false);
                  const el = document.getElementById("style-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Go to Styles
              </button> */}
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 text-white" onClick={() => setShowSelectStyleModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Sign In Modal (shows AFTER style is selected and user clicks Create) */}
      {showSignInAlert && (
        <AlertSignInModal
          onClose={() => setShowSignInAlert(false)}
          onSignIn={() => {
            setShowSignInAlert(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            // open signup if you have one
          }}
          onLoginSuccess={(user) => {
            setShowLoginModal(false);
            login(user); // This will update navbar immediately!
            // After login you can call generatePetArt() if you want to auto-start generation
          }}
        />
      )}
    </div>
  );
}
