// Product mapping configuration for Shopify to Printful sync variants
// This file helps manage the mapping between your Shopify product variants and Printful sync variants

// Manual mapping (fastest for small product catalogs)
export const productMapping = {
  // Format: "Shopify Variant ID" : Printful Sync Variant ID
  // 
  // CORRECTED MAPPINGS with real Printful sync variant IDs:
  
  // White glossy mug:
  "52249775178046": 4980193865, // White glossy mug / Default Title
  
  // Framed canvas variants (Black):
  "51871373918526": 4858094038, // Framed canvas / Black / 8″×10″
  "51871373951294": 4858094039, // Framed canvas / Black / 12″×16″
  "51871373984062": 4858094040, // Framed canvas / Black / 18″×24″
  
  // Framed canvas variants (Brown):
  "51871374016830": 4858094041, // Framed canvas / Brown / 8″×10″
  "51871374049598": 4858094042, // Framed canvas / Brown / 12″×16″
  "51871374082366": 4858094043, // Framed canvas / Brown / 18″×24″
  
  // Framed photo paper poster variants (Black):
  "51871562105150": 4858132933, // Framed photo paper poster / Black / 8″×10″
  "51871562137918": 4858132934, // Framed photo paper poster / Black / 12″×16″
  "51871562170686": 4858132935, // Framed photo paper poster / Black / 18″×24″
  
  // Framed photo paper poster variants (Red Oak):
  "51871562203454": 4858132936, // Framed photo paper poster / Red Oak / 8″×10″
  "51871562236222": 4858132937, // Framed photo paper poster / Red Oak / 12″×16″
  "51871562268990": 4858132938, // Framed photo paper poster / Red Oak / 18″×24″
  
  // Tote bag variants:
  "51871440765246": 4858115991, // Tote bag / Black
  "51871440798014": 4858115992, // Tote bag / Yellow
  
  // You can also use the GID format (Shopify uses both):
  "gid://shopify/ProductVariant/52249775178046": 4980193865,
  "gid://shopify/ProductVariant/51871373918526": 4858094038,
  "gid://shopify/ProductVariant/51871373951294": 4858094039,
  "gid://shopify/ProductVariant/51871373984062": 4858094040,
  "gid://shopify/ProductVariant/51871374016830": 4858094041,
  "gid://shopify/ProductVariant/51871374049598": 4858094042,
  "gid://shopify/ProductVariant/51871374082366": 4858094043,
  "gid://shopify/ProductVariant/51871562105150": 4858132933,
  "gid://shopify/ProductVariant/51871562137918": 4858132934,
  "gid://shopify/ProductVariant/51871562170686": 4858132935,
  "gid://shopify/ProductVariant/51871562203454": 4858132936,
  "gid://shopify/ProductVariant/51871562236222": 4858132937,
  "gid://shopify/ProductVariant/51871562268990": 4858132938,
  "gid://shopify/ProductVariant/51871440765246": 4858115991,
  "gid://shopify/ProductVariant/51871440798014": 4858115992,
};

// Cache for automatic mappings
let automaticMappingCache = {};
let lastCacheUpdate = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Automatic mapping by SKU (requires matching SKUs in both platforms)
export const getAutomaticMapping = async (shopifyVariantId) => {
  try {
    // Check cache first
    if (lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_DURATION) {
      return automaticMappingCache[shopifyVariantId] || null;
    }

    // Fetch Shopify products
    const shopifyResponse = await fetch(`https://${process.env.SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
      }
    });
    const shopifyData = await shopifyResponse.json();

    // Fetch Printful sync products
    const printfulResponse = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });
    const printfulData = await printfulResponse.json();

    // Build automatic mapping by matching SKUs
    const newMapping = {};
    
    for (const shopifyProduct of shopifyData.products || []) {
      for (const shopifyVariant of shopifyProduct.variants || []) {
        const shopifyVariantId = `gid://shopify/ProductVariant/${shopifyVariant.id}`;
        const shopifySKU = shopifyVariant.sku;
        
        if (shopifySKU) {
          // Find matching Printful product by SKU
          for (const printfulProduct of printfulData.result || []) {
            for (const printfulVariant of printfulProduct.sync_variants || []) {
              if (printfulVariant.sku === shopifySKU) {
                newMapping[shopifyVariantId] = printfulVariant.id;
                break;
              }
            }
          }
        }
      }
    }

    // Update cache
    automaticMappingCache = newMapping;
    lastCacheUpdate = Date.now();
    
    console.log('Automatic mapping updated:', Object.keys(newMapping).length, 'products mapped');
    
    return newMapping[shopifyVariantId] || null;
    
  } catch (error) {
    console.error('Automatic mapping failed:', error);
    return null;
  }
};

// Helper function to get Printful sync variant ID from Shopify variant ID
export const getPrintfulSyncVariantId = async (shopifyVariantId) => {
  // Try manual mapping first (fastest)
  if (productMapping[shopifyVariantId]) {
    return productMapping[shopifyVariantId];
  }
  
  // Extract numeric ID from Shopify GID format and try again
  const numericId = shopifyVariantId.toString().split('/').pop();
  if (productMapping[numericId]) {
    return productMapping[numericId];
  }
  
  // Try automatic mapping by SKU
  const automaticResult = await getAutomaticMapping(shopifyVariantId);
  if (automaticResult) {
    console.log(`Found automatic mapping for ${shopifyVariantId} → ${automaticResult}`);
    return automaticResult;
  }
  
  // No mapping found
  console.warn(`No Printful mapping found for Shopify variant: ${shopifyVariantId}`);
  return null;
};

// Helper function to validate if a product mapping exists
export const hasProductMapping = (shopifyVariantId) => {
  return getPrintfulSyncVariantId(shopifyVariantId) !== null;
};

// Function to add new product mapping (useful for dynamic mapping)
export const addProductMapping = (shopifyVariantId, printfulSyncVariantId) => {
  productMapping[shopifyVariantId] = printfulSyncVariantId;
  console.log(`Added product mapping: ${shopifyVariantId} → ${printfulSyncVariantId}`);
};

// Get all current mappings (useful for debugging)
export const getAllMappings = () => {
  return { ...productMapping };
};
