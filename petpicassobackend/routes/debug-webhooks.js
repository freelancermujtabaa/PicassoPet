import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Debug endpoint to check webhook connectivity and data
router.post('/debug', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    console.log('=== WEBHOOK DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);
    console.log('Is Buffer:', Buffer.isBuffer(req.body));
    console.log('Body length:', req.body.length);
    
    // Handle different body types
    let order;
    if (Buffer.isBuffer(req.body)) {
      console.log('Body is Buffer - converting to string');
      order = JSON.parse(req.body.toString());
    } else if (typeof req.body === 'string') {
      console.log('Body is string - parsing JSON');
      order = JSON.parse(req.body);
    } else if (typeof req.body === 'object') {
      console.log('Body is already an object');
      order = req.body;
    } else {
      console.log('Body is unknown type - converting to string');
      order = JSON.parse(req.body.toString());
    }
    
    console.log('Order ID:', order.id);
    console.log('Order email:', order.email);
    console.log('Line items count:', order.line_items?.length);
    
    // Check each line item
    for (const lineItem of order.line_items || []) {
      console.log(`Line Item ${lineItem.id}:`, {
        variant_id: lineItem.variant_id,
        name: lineItem.name,
        properties: lineItem.properties
      });
      
      // Look for AI image URL
      const aiImageProperty = lineItem.properties?.find(prop => 
        prop.name === 'AI_Image_URL' || prop.name === '_AI_Image_URL'
      );
      
      if (aiImageProperty) {
        console.log('Found AI Image URL:', aiImageProperty.value);
      } else {
        console.log('No AI Image URL found in properties');
      }
    }
    
    res.json({ 
      status: 'Debug complete', 
      orderId: order.id,
      lineItemsCount: order.line_items?.length || 0,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body)
    });
    
  } catch (error) {
    console.error('Debug webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test webhook endpoint accessibility
router.get('/test-webhook-endpoint', async (req, res) => {
  try {
    console.log('Testing webhook endpoint accessibility...');
    
    // Test if the webhook endpoint is reachable
    const webhookUrl = 'https://petpicassobackend.onrender.com/api/webhooks/shopify/test';
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('Webhook endpoint is accessible:', result);
      res.json({ 
        status: 'Webhook endpoint accessible', 
        webhookUrl,
        response: result,
        message: 'Your webhook URL is working and accessible from the internet'
      });
    } else {
      console.error('Webhook endpoint not accessible:', response.status, result);
      res.status(400).json({ 
        error: 'Webhook endpoint not accessible', 
        webhookUrl,
        statusCode: response.status,
        response: result
      });
    }
    
  } catch (error) {
    console.error('Webhook endpoint test error:', error);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Make sure your backend is deployed and accessible'
    });
  }
});

// Simple webhook receiver for testing (no authentication)
router.post('/simple-test', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    console.log('=== SIMPLE WEBHOOK TEST RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body length:', req.body.length);
    console.log('Body preview:', req.body.toString().substring(0, 500) + '...');
    
    res.status(200).json({ 
      status: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      bodyLength: req.body.length
    });
    
  } catch (error) {
    console.error('Simple webhook test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sync variants with their correct IDs
router.get('/get-sync-variants', async (req, res) => {
  try {
    console.log('Getting all sync variants...');
    
    // First get the list of sync products
    const productsResponse = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const productsResult = await productsResponse.json();
    console.log('Products response:', JSON.stringify(productsResult, null, 2));
    
    if (!productsResponse.ok) {
      return res.status(400).json({ 
        error: 'Failed to get sync products', 
        details: productsResult 
      });
    }

    const allVariants = [];
    
    // Now fetch each product individually to get sync variants
    for (const product of productsResult.result || []) {
      console.log(`Fetching variants for product: ${product.name} (ID: ${product.id})`);
      
      try {
        const productResponse = await fetch(`https://api.printful.com/sync/products/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        const productResult = await productResponse.json();
        
        if (productResponse.ok && productResult.result) {
          const productData = productResult.result.sync_product;
          const variants = productResult.result.sync_variants || [];
          
          console.log(`Found ${variants.length} variants for ${productData.name}`);
          
          for (const variant of variants) {
            console.log(`  Variant: ${variant.name} (Sync ID: ${variant.id}, External: ${variant.external_id})`);
            allVariants.push({
              productId: productData.id,
              productName: productData.name,
              syncVariantId: variant.id,  // This is what we need for orders
              externalId: variant.external_id,  // This is what you see in dashboard
              variantName: variant.name,
              sku: variant.sku,
              isIgnored: variant.is_ignored || false,
              syncProductId: variant.sync_product_id
            });
          }
        } else {
          console.error(`Failed to get variants for product ${product.id}:`, productResult);
        }
      } catch (error) {
        console.error(`Error fetching product ${product.id}:`, error);
      }
    }
    
    console.log('Total variants found:', allVariants.length);
    res.json({ 
      status: 'Success', 
      message: 'Use syncVariantId for orders, externalId is what you see in dashboard',
      totalProducts: productsResult.result?.length || 0,
      totalVariants: allVariants.length,
      variants: allVariants
    });
    
  } catch (error) {
    console.error('Get sync variants error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Get basic Printful products (alternative method)
router.get('/get-printful-products', async (req, res) => {
  try {
    console.log('Getting basic Printful products...');
    
    const response = await fetch('https://api.printful.com/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('Basic products response:', JSON.stringify(result, null, 2));
    
    res.json({
      status: response.ok ? 'Success' : 'Error',
      statusCode: response.status,
      message: 'Basic Printful products (not sync products)',
      data: result
    });
    
  } catch (error) {
    console.error('Get basic products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test specific sync variant ID
router.get('/test-sync-variant/:syncVariantId', async (req, res) => {
  try {
    const { syncVariantId } = req.params;
    console.log('Testing sync variant ID:', syncVariantId);
    
    // Get specific sync variant from Printful
    const response = await fetch(`https://api.printful.com/sync/variant/${syncVariantId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Sync variant found:', result);
      res.json({ 
        status: 'Sync variant exists', 
        syncVariantId,
        variant: result.result,
        message: 'This sync variant is valid and can be used for orders'
      });
    } else {
      console.error('Sync variant not found:', result);
      res.status(400).json({ 
        error: 'Sync variant not found', 
        syncVariantId,
        details: result,
        suggestion: 'Check if this sync variant exists in your Printful store and is properly configured'
      });
    }
    
  } catch (error) {
    console.error('Sync variant test error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test-printful', async (req, res) => {
  try {
    console.log('Testing Printful API connection...');
    
    // Test API key with sync products endpoint (requires read_products scope)
    const response = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Printful API connected successfully. Products found:', result.result?.length || 0);
      res.json({ 
        status: 'Printful API working', 
        productsCount: result.result?.length || 0,
        message: 'API key is valid and can access sync products'
      });
    } else {
      console.error('Printful API error:', result);
      res.status(400).json({ 
        error: 'Printful API failed', 
        details: result,
        suggestion: 'Check if your API key has the correct scopes: read_orders, write_orders, read_products, write_files'
      });
    }
    
  } catch (error) {
    console.error('Printful test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test product mapping
router.get('/test-mapping/:variantId', async (req, res) => {
  try {
    const { variantId } = req.params;
    console.log('Testing mapping for variant:', variantId);
    
    // Import the mapping function
    const { getPrintfulSyncVariantId } = await import('../utils/printful-mapping.js');
    
    const printfulId = await getPrintfulSyncVariantId(variantId);
    
    res.json({
      shopifyVariantId: variantId,
      printfulSyncVariantId: printfulId,
      hasMappingng: printfulId !== null
    });
    
  } catch (error) {
    console.error('Mapping test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual order test - send a test order to Printful
router.post('/test-order', async (req, res) => {
  try {
    const {
      shopifyVariantId,
      aiImageUrl,
      customerEmail = 'test@example.com',
      customerName = 'Test Customer'
    } = req.body;
    
    console.log('Testing manual order creation...');
    
    // Get mapping
    const { getPrintfulSyncVariantId } = await import('../utils/printful-mapping.js');
    const printfulSyncVariantId = await getPrintfulSyncVariantId(shopifyVariantId);
    
    if (!printfulSyncVariantId) {
      return res.status(400).json({ 
        error: 'No product mapping found',
        shopifyVariantId 
      });
    }
    
    // Create test order
    const printfulOrderData = {
      external_id: `test-${Date.now()}`,
      shipping: "STANDARD",
      recipient: {
        name: customerName,
        address1: "123 Test Street",
        city: "Test City",
        state_code: "CA",
        country_code: "US",
        zip: "90210",
        email: customerEmail
      },
      items: [{
        sync_variant_id: printfulSyncVariantId,
        quantity: 1,
        retail_price: "25.00",
        name: "Test Pet Portrait",
        files: [{
          type: "default",
          url: aiImageUrl,
          filename: `test-pet-portrait-${Date.now()}.jpg`
        }]
      }]
    };
    
    console.log('Sending test order to Printful:', JSON.stringify(printfulOrderData, null, 2));
    
    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PetPicasso/1.0'
      },
      body: JSON.stringify(printfulOrderData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Test order created successfully:', result);
      res.json({ 
        success: true, 
        printfulOrderId: result.result?.id,
        message: 'Test order created successfully',
        data: result 
      });
    } else {
      console.error('Test order failed:', result);
      res.status(400).json({ 
        success: false, 
        error: result.error?.message || 'Printful API error',
        details: result 
      });
    }
    
  } catch (error) {
    console.error('Test order error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
