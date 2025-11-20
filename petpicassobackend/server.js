import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import exifr from 'exifr';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import sharp from 'sharp';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import productsRoutes from './routes/products.js';
import createCheckoutRoutes from './routes/create-checkout.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import shopifyWebhooksRoutes from './routes/shopify-webhooks.js';
import debugWebhooksRoutes from './routes/debug-webhooks.js';
import { uploadImageFromUrl } from './utils/cloudinary.js';


// Load environment variables
dotenv.config();


// Function to normalize image orientation (add this near your other imports)
async function normalizeImageOrientation(imageBuffer) {
  try {
    // Read EXIF orientation
    const orientation = await exifr.orientation(imageBuffer);
    
    if (orientation && orientation > 1) {
      console.log(`📸 EXIF Orientation detected: ${orientation}, applying correction`);
      
      // Apply rotation based on EXIF orientation
      let rotatedBuffer = imageBuffer;
      switch (orientation) {
        case 2:
          rotatedBuffer = await sharp(imageBuffer).flop().toBuffer();
          break;
        case 3:
          rotatedBuffer = await sharp(imageBuffer).rotate(180).toBuffer();
          break;
        case 4:
          rotatedBuffer = await sharp(imageBuffer).flip().toBuffer();
          break;
        case 5:
          rotatedBuffer = await sharp(imageBuffer).flip().rotate(-90).toBuffer();
          break;
        case 6:
          rotatedBuffer = await sharp(imageBuffer).rotate(90).toBuffer();
          break;
        case 7:
          rotatedBuffer = await sharp(imageBuffer).flop().rotate(-90).toBuffer();
          break;
        case 8:
          rotatedBuffer = await sharp(imageBuffer).rotate(270).toBuffer();
          break;
        default:
          // Orientation 1 is normal, no rotation needed
          break;
      }
      return rotatedBuffer;
    }
    
    return imageBuffer; // No orientation change needed
  } catch (error) {
    console.error('Error reading EXIF orientation:', error);
    return imageBuffer; // Return original if EXIF reading fails
  }
}

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const styleModels = {
  "Picasso": "google/nano-banana",    // Nano Banana for Picasso Synthetic Cubist style
  "Van Gogh": "google/nano-banana",   // Nano Banana for Van Gogh style
  "Warhol": "google/nano-banana",     // Nano Banana for Warhol style
  "Monet": "google/nano-banana",      // Nano Banana for Monet style
  "Hokusai": "google/nano-banana",    // Nano Banana for Hokusai style
  "Default": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",     // fallback
};


// Middleware
app.use(cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : (process.env.NODE_ENV === 'production' ? ['https://petpicasso.vercel.app'] : ['http://localhost:5173', 'http://localhost:5174', 'https://petpicasso.vercel.app']),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));



// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Root route for Railway health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'PetPicasso Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/create-checkout', createCheckoutRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/webhooks/shopify', shopifyWebhooksRoutes);
app.use('/api/debug', debugWebhooksRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PetPicasso Backend is running' });
});


// Image Rotation endpoint - rotates and re-uploads to Cloudinary
app.post('/api/rotate-image', async (req, res) => {
  try {
    const { imageUrl, rotation } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    console.log('Rotating image:', imageUrl, 'by', rotation, 'degrees');

    // Download the image from Cloudinary
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from Cloudinary');
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Rotate the image using sharp
    // Convert rotation to sharp's rotation method
    let rotatedBuffer;
    if (rotation === 90) {
      rotatedBuffer = await sharp(imageBuffer).rotate(90).toBuffer();
    } else if (rotation === 180) {
      rotatedBuffer = await sharp(imageBuffer).rotate(180).toBuffer();
    } else if (rotation === 270) {
      rotatedBuffer = await sharp(imageBuffer).rotate(270).toBuffer();
    } else {
      // No rotation needed or rotation is 0/360
      rotatedBuffer = imageBuffer;
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64Image = rotatedBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    // Upload rotated image to Cloudinary
    const cloudinaryResult = await uploadImageFromUrl(dataUri, 'pet-portraits');

    if (cloudinaryResult.success) {
      console.log('Rotated image uploaded to Cloudinary:', cloudinaryResult.url);
      res.json({
        success: true,
        newImageUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId
      });
    } else {
      throw new Error(cloudinaryResult.error || 'Failed to upload to Cloudinary');
    }

  } catch (error) {
    console.error('Error rotating image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Image Generation endpoint
app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    const { prompt, style, isImageToImage } = req.body;
    const imageFile = req.file;


    // ✅ NEW: Normalize image orientation before any processing
    let normalizedImageBuffer = imageFile?.buffer;
    let originalWidth, originalHeight, orientation;
    let normalizedWidth, normalizedHeight;

    if (imageFile) {
      try {
        // Get image metadata including dimensions BEFORE normalization
        const originalMetadata = await sharp(imageFile.buffer).metadata();
        originalWidth = originalMetadata.width;
        originalHeight = originalMetadata.height;
        orientation = originalMetadata.orientation;

        // ✅ EXIF NORMALIZATION
        normalizedImageBuffer = await normalizeImageOrientation(imageFile.buffer);
        
        // Get metadata AFTER normalization
        const normalizedMetadata = await sharp(normalizedImageBuffer).metadata();
        normalizedWidth = normalizedMetadata.width;
        normalizedHeight = normalizedMetadata.height;

      } catch (metadataError) {
        console.error('❌ Failed to read image metadata:', metadataError.message);
        normalizedImageBuffer = imageFile.buffer; // Fallback to original
      }
    }

    // ✅ ENHANCED: Comprehensive image logging with BEFORE/AFTER EXIF normalization
    console.log('=== FRONTEND IMAGE ANALYSIS ===');
    console.log('Image file received:', imageFile ? {
      originalname: imageFile.originalname,
      mimetype: imageFile.mimetype,
      size: imageFile.size + ' bytes',
      bufferLength: imageFile.buffer.length + ' bytes'
    } : 'No image uploaded');

    if (imageFile) {
      // Ensure we have normalized dimensions even if normalization failed
      if (!normalizedWidth || !normalizedHeight) {
        normalizedWidth = originalWidth;
        normalizedHeight = originalHeight;
        console.log('⚠️  Using original dimensions due to normalization error');
      }
      console.log('📐 ORIGINAL IMAGE METADATA:');
      console.log(`   Original size: ${originalWidth} x ${originalHeight}`);
      console.log(`   Aspect ratio: ${(originalWidth / originalHeight).toFixed(2)}`);
      console.log(`   EXIF Orientation: ${orientation || '1 (normal)'}`);
      
      if (orientation && orientation > 1) {
        const orientationMap = {
          1: 'Normal (0°)',
          2: 'Mirrored horizontal',
          3: 'Rotated 180°',
          4: 'Mirrored vertical',
          5: 'Mirrored horizontal then rotated 90° CCW',
          6: 'Rotated 90° CW',
          7: 'Mirrored horizontal then rotated 90° CW',
          8: 'Rotated 90° CCW'
        };
        console.log(`   🔄 EXIF Interpretation: ${orientationMap[orientation] || 'Unknown'}`);
      }
      
      // Determine original orientation
      if (originalWidth > originalHeight) {
        console.log('   📷 PIXEL ORIENTATION: LANDSCAPE (width > height)');
      } else if (originalHeight > originalWidth) {
        console.log('   📷 PIXEL ORIENTATION: PORTRAIT (height > width)');
      } else {
        console.log('   📷 PIXEL ORIENTATION: SQUARE');
      }

      // ✅ NEW: Log normalized results
      console.log('🔄 AFTER EXIF NORMALIZATION:');
      console.log(`   Normalized size: ${normalizedWidth} x ${normalizedHeight}`);
      console.log(`   Normalized aspect ratio: ${(normalizedWidth / normalizedHeight).toFixed(2)}`);
      
      if (normalizedWidth > normalizedHeight) {
        console.log('   📷 NORMALIZED ORIENTATION: LANDSCAPE');
      } else if (normalizedHeight > normalizedWidth) {
        console.log('   📷 NORMALIZED ORIENTATION: PORTRAIT');
      } else {
        console.log('   📷 NORMALIZED ORIENTATION: SQUARE');
      }

      // Log if orientation changed
      if (originalWidth !== normalizedWidth || originalHeight !== normalizedHeight) {
        console.log('✅ EXIF ORIENTATION APPLIED: Image dimensions were adjusted');
      } else {
        console.log('ℹ️  No EXIF orientation adjustment needed');
      }
    }
    console.log('=== END FRONTEND IMAGE ANALYSIS ===');

    
    // console.log('Request body:', req.body);
    
    console.log('Image file:', imageFile ? {
      originalname: imageFile.originalname,
      mimetype: imageFile.mimetype,
      size: imageFile.size
    } : 'No image uploaded');

    const modelId = styleModels[style] || styleModels["Default"];

    let finalPrompt = prompt;
    let styleSpecificParams = {};

    // ✅ STEP 1: Detect animal with BLIP-2 - USE NORMALIZED BUFFER
    let detectedAnimal = "";
    if (imageFile && normalizedImageBuffer) {
      try {
        // Safety check - ensure buffer is valid
        if (normalizedImageBuffer.length === 0) {
          throw new Error('Normalized image buffer is empty');
        }
        
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        });

        // Resize NORMALIZED image for BLIP-2 input
        const resizedBufferForBlip = await sharp(normalizedImageBuffer) 
          .resize(512, 512, { fit: 'inside' })
          .toFormat('jpeg')
          .toBuffer();

        const base64ImageForBlip = resizedBufferForBlip.toString('base64');
        const blipImage = `data:image/jpeg;base64,${base64ImageForBlip}`;

        console.log("Sending NORMALIZED image to BLIP-2 for animal detection...");

        const blipOutput = await replicate.run(
          "andreasjansson/blip-2:f677695e5e89f8b236e52ecd1d3f01beb44c34606419bcc19345e046d8f786f9",
          {
            input: {
              image: blipImage,
              caption: false,
              question: "What is in this picture?",
              temperature: 0.7,
              use_nucleus_sampling: false
            }
          }
        );

        console.log("BLIP-2 raw output:", blipOutput);
        if (Array.isArray(blipOutput) && blipOutput.length > 0) {
          detectedAnimal = blipOutput[0];
        } else if (typeof blipOutput === "string") {
          detectedAnimal = blipOutput;
        }

        console.log("Detected animal:", detectedAnimal);
      } catch (blipError) {
        console.error("BLIP-2 model failed:", blipError.message);
        detectedAnimal = "";
      }
    }

    // ✅ STEP 2: Merge detected animal into user's prompt
    if (detectedAnimal) {
      finalPrompt = `Portrait of ${detectedAnimal}, ${prompt}`;
      console.log("Final prompt:", finalPrompt);
    }
    
         // Style-specific prompt and parameter optimizations
     switch (style) {
       case "Van Gogh":
         if (detectedAnimal) {
           finalPrompt = `${detectedAnimal} painted in Vincent van Gogh's expressive post-impressionist style — swirling brushstrokes, thick impasto texture, vivid yellows, deep blues, and emotional energy. Dynamic movement and glowing light. Background reimagined in Van Gogh's rhythmic, textured strokes.

Create Van Gogh style pet portrait with swirling brushstrokes and emotional intensity. Transform ${detectedAnimal} into post-impressionist masterpiece:

- **Maintain the exact aspect ratio and orientation (strictly vertical/portrait) of the original source image.**
- Apply Van Gogh's post-impressionist style to both pet and background
- Thick, impasto brushstrokes with visible texture
- Swirling, rhythmic patterns and dynamic movement
- Bold, contrasting colors - vivid yellows, deep blues, lush greens
- Emotional expression over realistic representation
- Dramatic lighting and shadow play
- Textured paint application with visible brush marks
- Warm, passionate color palette with energetic contrasts
- **The entire scene's composition, subject placement, and background details must be maintained, merely rendered in the specified art style.**
- **DO NOT** replace, remove, or drastically alter the original background composition, objects, or scene.
- Style: Vincent van Gogh post-impressionist technique
- Convey emotion and movement through brushwork

Capture the soul and energy of ${detectedAnimal} in Van Gogh's passionate style.`;

            console.log('🎨 Van Gogh Final Prompt:', finalPrompt);
         } else {
           finalPrompt = `Create Van Gogh style pet portrait with swirling brushstrokes and emotional intensity. Transform pet into post-impressionist masterpiece:

- Apply Van Gogh’s post-impressionist style to both pet and background
- Thick, impasto brushstrokes with visible texture
- Swirling, rhythmic patterns and dynamic movement
- Bold, contrasting colors - vivid yellows, deep blues, lush greens
- Emotional expression over realistic representation
- Dramatic lighting and shadow play
- Textured paint application with visible brush marks
- Warm, passionate color palette with energetic contrasts
- Original background preserved but reimagined with Van Gogh’s expressive brushwork
- Style: Vincent van Gogh post-impressionist technique
- Convey emotion and movement through brushwork

Capture the soul and energy of pets in Van Gogh's passionate style.`;
         }
         styleSpecificParams = {
           // Nano Banana parameters are set in modelInput
         };
         break;
      case "Picasso":
        if (detectedAnimal) {
          finalPrompt = `${detectedAnimal} as a cubist portrait inspired by Picasso's 1912–1915 synthetic cubism. Angular geometric shapes, warm oranges and browns, bold outlines, multiple facets showing different angles. Background as abstract color blocks harmonizing with the subject.

Create Synthetic Cubist pet portrait with colorful geometric fragmentation. Transform ${detectedAnimal} into angular faceted forms with rich warm colors:

- **Maintain the exact aspect ratio and orientation of the original source image.**
- Angular geometric fragments in oranges, yellows, browns, warm earth tones
- Each ${detectedAnimal} built from 15-20 colorful geometric facets (not ultra-minimal)
- Crystalline fragmentation - like looking through a kaleidoscope
- Thick black outlines separating colored geometric segments
- Faces with geometric features but still recognizable as ${detectedAnimal}
- Rich color variety - multiple warm tones per ${detectedAnimal}
- **The entire scene's composition, subject placement, and background details must be maintained, merely rendered as complementary geometric color blocks.**
- **DO NOT** replace, remove, or drastically alter the original background composition, objects, or scene.
- Style: Picasso 1912-1915 synthetic cubism, colorful and decorative
- Maintain geometric abstraction but with rich color complexity

Bring back the warm colors and geometric richness - not minimal monochrome.`;

            console.log('🎨 Picasso Final Prompt:', finalPrompt);
         } else {
           finalPrompt = `Create Synthetic Cubist pet portrait with colorful geometric fragmentation. Transform pet into angular faceted forms with rich warm colors:

- Angular geometric fragments in oranges, yellows, browns, warm earth tones
- Each pet built from 15-20 colorful geometric facets (not ultra-minimal)
- Crystalline fragmentation - like looking through a kaleidoscope
- Thick black outlines separating colored geometric segments
- Faces with geometric features but still recognizable as pets
- Rich color variety - multiple warm tones per pet
- Background of complementary geometric color blocks
- Style: Picasso 1912-1915 synthetic cubism, colorful and decorative
- Maintain geometric abstraction but with rich color complexity

Bring back the warm colors and geometric richness - not minimal monochrome.`;
         }
         styleSpecificParams = {
           // Nano Banana parameters are set in modelInput
         };
         break;
      case "Warhol":
        if (detectedAnimal) {
          finalPrompt = `${detectedAnimal} transformed into Andy Warhol pop art — bold, flat color blocks, strong outlines, halftone texture, neon pinks, yellows, blues. Simplified graphic portrait with screenprint effect and commercial poster feel.

Create Andy Warhol Pop Art style pet portrait with bold graphic design. Transform ${detectedAnimal} into iconic pop art masterpiece:

- **Maintain the exact aspect ratio and orientation of the original source image.**
- Apply Warhol's pop art style to both pet and background
- Bold, high-contrast portrait with flat vibrant color blocks
- Repeated panel layout with screenprint aesthetic
- Simplified facial features with strong outlines
- Halftone texture and high saturation colors
- Minimal shadows with graphic design approach
- Bright, artificial colors - electric blues, hot pinks, neon greens
- Clean, commercial art style with sharp edges
- **The entire scene's composition, subject placement, and background details must be maintained, merely reimagined in Warhol's pop art technique.**
- **DO NOT** replace, remove, or drastically alter the original background composition, objects, or scene.
- Style: Andy Warhol pop art technique
- Museum-quality graphic design with mass media aesthetic

Transform ${detectedAnimal} into a pop culture icon in Warhol's signature style.`;

      console.log('🎨 Warhol Final Prompt:', finalPrompt);
         } else {
           finalPrompt = `Create Andy Warhol Pop Art style pet portrait with bold graphic design. Transform pet into iconic pop art masterpiece:

- Apply Warhol’s pop art style to both pet and background
- Bold, high-contrast portrait with flat vibrant color blocks
- Repeated panel layout with screenprint aesthetic
- Simplified facial features with strong outlines
- Halftone texture and high saturation colors
- Minimal shadows with graphic design approach
- Bright, artificial colors - electric blues, hot pinks, neon greens
- Clean, commercial art style with sharp edges
- Original background preserved but reimagined in Warhol’s pop art technique
- Style: Andy Warhol pop art technique
- Museum-quality graphic design with mass media aesthetic

Transform pets into pop culture icons in Warhol's signature style.`;
         }
         styleSpecificParams = {
           // Nano Banana parameters are set in modelInput
         };
         break;
      case "Monet":
        if (detectedAnimal) {
          finalPrompt = `${detectedAnimal} painted in Claude Monet's impressionist style — soft brushstrokes, pastel colors, natural light, and gentle blending. Dreamy atmosphere with outdoor lighting and broken color technique. Preserve scene composition but stylize softly.

Create Claude Monet Impressionist style pet portrait with soft brushstrokes and natural lighting. Transform ${detectedAnimal} into impressionist masterpiece:

- **Maintain the exact aspect ratio and orientation of the original source image.**
- Apply Monet's impressionist style to both pet and background
- Soft, loose brushstrokes with visible paint texture
- Natural outdoor lighting effects adapted to the original scene
- Pastel color palette - soft blues, greens, pinks, purples
- Atmospheric perspective with hazy, dreamy quality
- Broken color technique with small brush marks
- Light and shadow play creating depth and movement
- Impressionist technique capturing fleeting moments
- Soft edges and blended colors
- **The entire scene's composition, subject placement, and background details must be maintained, merely stylized in Monet's signature impressionist manner.**
- **DO NOT** replace, remove, or drastically alter the original background composition, objects, or scene.
- Style: Claude Monet impressionist painting

Keep the original background composition intact, only stylized in Monet's signature impressionist manner.`;

           console.log('🎨 Monet Final Prompt:', finalPrompt);
         } else {
           finalPrompt = `Create Claude Monet Impressionist style pet portrait with soft brushstrokes and natural lighting. Transform pet into impressionist masterpiece:

- Soft, loose brushstrokes with visible paint texture
- Natural outdoor lighting with dappled sunlight effects
- Water lily pond or garden background with reflections
- Pastel color palette - soft blues, greens, pinks, purples
- Atmospheric perspective with hazy, dreamy quality
- Broken color technique with small brush marks
- Light and shadow play creating depth and movement
- Impressionist technique capturing fleeting moments
- Soft edges and blended colors
- Style: Claude Monet impressionist painting

Transform pets into peaceful impressionist scenes in Monet's signature style.`;
         }
         styleSpecificParams = {
           // Nano Banana parameters are set in modelInput
         };
         break;
      case "Hokusai":
        if (detectedAnimal) {
          finalPrompt = `${detectedAnimal} in Hokusai's ukiyo-e woodblock print style — bold black outlines, flat indigo and vermillion colors, wave-like curves, and Japanese composition. Paper texture with crisp shapes and traditional aesthetic.

Create Katsushika Hokusai Ukiyo-e woodblock print style pet portrait with traditional Japanese art elements. Transform ${detectedAnimal} into Japanese masterpiece:

- **Maintain the exact aspect ratio and orientation of the original source image.**
- Apply traditional ukiyo-e woodblock print technique to both pet and background
- Strong black outlines with bold, clean lines
- Flat areas of color with no gradients or shading
- Traditional Japanese color palette - indigo blues, vermillion reds, gold yellows
- Japanese paper texture with subtle grain
- Dynamic composition with flowing curves
- Simplified forms with emphasis on line and shape
- **The entire scene's composition, subject placement, and background details must be maintained, merely stylized in Hokusai's ukiyo-e manner.**
- **DO NOT** replace, remove, or drastically alter the original background composition, objects, or scene.
- Style: Katsushika Hokusai ukiyo-e woodblock print

Transform ${detectedAnimal} into a traditional Japanese woodblock print in Hokusai's signature style.`;

           console.log('🎨 Hokusai Final Prompt:', finalPrompt);
         } else {
           finalPrompt = `Create Katsushika Hokusai Ukiyo-e woodblock print style pet portrait with traditional Japanese art elements. Transform pet into Japanese masterpiece:

- Traditional ukiyo-e woodblock print technique
- Strong black outlines with bold, clean lines
- Flat areas of color with no gradients or shading
- Traditional Japanese color palette - indigo blues, vermillion reds, gold yellows
- Japanese paper texture with subtle grain
- Dynamic composition with flowing curves
- Traditional Japanese landscape or wave background
- Simplified forms with emphasis on line and shape
- Mount Fuji or wave motifs in background
- Style: Katsushika Hokusai ukiyo-e woodblock print

Transform pets into traditional Japanese woodblock prints in Hokusai's signature style.`;
         }
         styleSpecificParams = {
           // Nano Banana parameters are set in modelInput
         };
         break;
       default:
         styleSpecificParams = {
           guidance_scale: 7.5,
           num_inference_steps: 25
         };
     }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Sending request to Replicate...');
    console.log('API Token:', process.env.REPLICATE_API_TOKEN ? 'Present' : 'Using fallback');
    console.log('Style:', style);
    console.log('Model ID:', modelId);

     // ✅ NEW: Log the input dimensions being sent to the AI model
    console.log('🎯 INPUT IMAGE FOR AI MODEL:');
    console.log(`   Normalized: ${normalizedWidth} x ${normalizedHeight}`);
    if (normalizedWidth && normalizedHeight) {
      console.log(`   Orientation: ${normalizedWidth > normalizedHeight ? 'LANDSCAPE' : 'PORTRAIT'}`);
    }
    
    // Create model input based on the model type
    let modelInput;
    
    if (style === "Picasso" || style === "Van Gogh" || style === "Warhol" || style === "Monet" || style === "Hokusai") {
      // Nano Banana input format
      modelInput = {
        prompt: finalPrompt,
        image_input: undefined, // Will be set below for image-to-image
        output_format: "jpg"
      };
      console.log(`🎨 Nano Banana ${style} Mode: Using ${style} transformation for pet photos.`);
    } else {
      // SDXL model input format
      modelInput = {
        width: 768,
        height: 768,
        prompt: finalPrompt,
        refine: "expert_ensemble_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: styleSpecificParams.guidance_scale || 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt: "blurry, low quality, distorted, different animal, wrong species",
        prompt_strength: 0.75, // Increased for better subject preservation
        num_inference_steps: styleSpecificParams.num_inference_steps || 25
      };
    }

    // Add image for image-to-image generation - USE NORMALIZED BUFFER
    if (isImageToImage === 'true' && imageFile && normalizedImageBuffer) {
      // Validate image format
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(imageFile.mimetype)) {
        throw new Error(`Unsupported image format. Please use JPEG, PNG, or WebP. Received: ${imageFile.mimetype}`);
      }

      let resizedBuffer;
      if (style === "Picasso" || style === "Van Gogh" || style === "Warhol" || style === "Monet" || style === "Hokusai") {
        // Nano Banana image input format - USE NORMALIZED BUFFER
        resizedBuffer = await sharp(normalizedImageBuffer) // ← CHANGED HERE
          .resize(1024, 1024, { fit: 'inside' })
          .toFormat('jpeg')
          .toBuffer();
        
        const base64Image = resizedBuffer.toString('base64');
        const mimeType = 'image/jpeg';
        modelInput.image_input = [`data:${mimeType};base64,${base64Image}`];
        console.log(`🎨 Nano Banana ${style} Mode: Using ${style} transformation for pet photos.`);
      } else {
        // SDXL image input format - USE NORMALIZED BUFFER
        resizedBuffer = await sharp(normalizedImageBuffer) // ← CHANGED HERE
          .resize(768, 768, { fit: 'inside' })
          .toFormat('jpeg')
          .toBuffer();
        
        const base64Image = resizedBuffer.toString('base64');
        const mimeType = 'image/jpeg';
        modelInput.image = `data:${mimeType};base64,${base64Image}`;
      }
      
      // ✅ NEW: Log the resized dimensions from NORMALIZED image
      const resizedMetadata = await sharp(resizedBuffer).metadata();
      console.log(`   Resized to: ${resizedMetadata.width} x ${resizedMetadata.height} for AI processing`);
    }


    let output;
    try {
      output = await replicate.run(
        modelId,
        {
          input: modelInput
        }
      );
    } catch (modelError) {
      console.log(`Style-specific model failed for ${style}, trying fallback...`);
      console.error('Model error:', modelError.message);
      
      // Fallback to default SDXL model
      const fallbackModelId = styleModels["Default"];
      console.log('Using fallback model:', fallbackModelId);
      
      // Convert Nano Banana input to SDXL input for fallback
      let fallbackInput = modelInput;
      if (style === "Picasso" || style === "Van Gogh" || style === "Warhol" || style === "Monet" || style === "Hokusai") {
        fallbackInput = {
          width: 768,
          height: 768,
          prompt: modelInput.prompt,
          refine: "expert_ensemble_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "blurry, low quality, distorted, different animal, wrong species",
          prompt_strength: 0.75,
          num_inference_steps: 25
        };
        // Add image if it exists
        if (modelInput.image_input && modelInput.image_input[0]) {
          fallbackInput.image = modelInput.image_input[0];
        }
      }
      
      output = await replicate.run(
        fallbackModelId,
        {
          input: fallbackInput
        }
      );
    }

    console.log('Replicate response type:', typeof output);
    console.log('Is array:', Array.isArray(output));
    if (Array.isArray(output)) {
      console.log('Array length:', output.length);
      console.log('First item type:', typeof output[0]);
      console.log('First item constructor:', output[0]?.constructor?.name);
    }

    if (!output || (Array.isArray(output) && output.length === 0)) {
      throw new Error('No output received from Replicate API');
    }

    // Handle FileOutput response from SDXL
    let imageUrl;
    if (Array.isArray(output) && output[0]) {
      const firstItem = output[0];
      
      // If it's a FileOutput object, convert to string to get URL
      if (firstItem && typeof firstItem === 'object') {
        imageUrl = String(firstItem);
        console.log('Converted FileOutput to URL:', imageUrl);
      } else if (typeof firstItem === 'string') {
        imageUrl = firstItem;
      } else {
        imageUrl = firstItem;
      }
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      imageUrl = String(output);
    }
    
    console.log('Final image URL:', imageUrl);

    // Validate that we have a proper URL
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error(`Invalid image URL received: ${imageUrl}`);
    }

    // ✅ NEW: Log generated image dimensions before uploading to Cloudinary
    console.log('📊 ANALYZING GENERATED IMAGE:');
    try {
      const generatedImageResponse = await fetch(imageUrl);
      if (generatedImageResponse.ok) {
        const imageBuffer = Buffer.from(await generatedImageResponse.arrayBuffer());
        const generatedMetadata = await sharp(imageBuffer).metadata();
        console.log(`   Generated image dimensions: ${generatedMetadata.width} x ${generatedMetadata.height}`);
        console.log(`   Generated aspect ratio: ${(generatedMetadata.width / generatedMetadata.height).toFixed(2)}`);
        
        // Compare input vs output orientation
        if (originalWidth && originalHeight) {
          const inputOrientation = originalWidth > originalHeight ? 'LANDSCAPE' : 'PORTRAIT';
          const outputOrientation = generatedMetadata.width > generatedMetadata.height ? 'LANDSCAPE' : 'PORTRAIT';
          console.log(`   🔄 ORIENTATION COMPARISON:`);
          console.log(`      Input: ${inputOrientation} (${originalWidth} x ${originalHeight})`);
          console.log(`      Output: ${outputOrientation} (${generatedMetadata.width} x ${generatedMetadata.height})`);
          
          if (inputOrientation !== outputOrientation) {
            console.log(`   ⚠️  WARNING: ORIENTATION MISMATCH DETECTED!`);
            console.log(`      The AI model changed the image orientation from ${inputOrientation} to ${outputOrientation}`);
          } else {
            console.log(`   ✅ Orientation maintained correctly`);
          }
        }
      }
    } catch (dimensionError) {
      console.error('   Could not analyze generated image dimensions:', dimensionError.message);
    }

    // Upload the generated image to Cloudinary for permanent storage
    try {
      console.log('Uploading image to Cloudinary...');
      const cloudinaryResult = await uploadImageFromUrl(imageUrl, 'pet-portraits');
      
      console.log('Cloudinary upload result:', cloudinaryResult);
      
      if (cloudinaryResult.success) {
        console.log('Cloudinary upload successful:', cloudinaryResult.url);
        
        // Return the Cloudinary URL instead of the temporary Replicate URL
        res.json({ 
          success: true, 
          image: cloudinaryResult.url, 
          detectedAnimal,
          cloudinaryPublicId: cloudinaryResult.publicId
        });
      } else {
        console.error('Cloudinary upload failed:', cloudinaryResult.error);
        // Fallback to original URL if Cloudinary upload fails
        res.json({ 
          success: true, 
          image: imageUrl, 
          detectedAnimal,
          cloudinaryError: cloudinaryResult.error
        });
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      // Fallback to original URL if Cloudinary upload fails
      res.json({ 
        success: true, 
        image: imageUrl, 
        detectedAnimal,
        cloudinaryError: cloudinaryError.message
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  
  // Don't interfere with OAuth redirects
  if (req.url.includes('/auth/google')) {
    console.error('OAuth route error - not handling in global middleware');
    return next(err);
  }
  
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
