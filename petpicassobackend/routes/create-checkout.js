import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

router.post('/', async (req, res) => {
    const { variantId, quantity, aiImageUrl, userEmail } = req.body;

    if (!variantId) {
        return res.status(400).json({ error: "variantId is required" });
    }

    try {
        // First create a cart
        const cartMutation = `
            mutation cartCreate($input: CartInput!) {
                cartCreate(input: $input) {
                    cart {
                        id
                        checkoutUrl
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const variables = {
            input: {
                lines: [
                    {
                        merchandiseId: variantId,
                        quantity: parseInt(quantity) || 1,
                        attributes: [
                            { key: "AI_Image_URL", value: aiImageUrl },
                            { key: "User_Email", value: userEmail }
                        ]
                    }
                ]
            }
        };

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query: cartMutation, variables }),
        });

        const data = await response.json();

        console.log('Shopify response:', JSON.stringify(data, null, 2));

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            return res.status(400).json({ error: data.errors[0].message });
        }

        if (data.data.cartCreate.userErrors && data.data.cartCreate.userErrors.length > 0) {
            console.error('Cart user errors:', data.data.cartCreate.userErrors);
            return res.status(400).json({ error: data.data.cartCreate.userErrors[0].message });
        }

        const cart = data.data.cartCreate.cart;
        if (cart && cart.checkoutUrl) {
            res.json({ url: cart.checkoutUrl });
        } else {
            res.status(400).json({ error: "Failed to create cart" });
        }

    } catch (err) {
        console.error('Cart creation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;