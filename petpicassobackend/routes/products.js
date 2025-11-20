import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

router.get("/", async (req, res) => {
  try {
    const query = `
      {
        products(first: 12) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    src
                    altText
                  }
                }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    image {
                      src
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!data.data || !data.data.products) {
      throw new Error("Invalid response from Shopify");
    }

    const products = data.data.products.edges.flatMap(edge => {
      const product = edge.node;
      const defaultImage = product.images.edges[0]?.node.src;

      return product.variants.edges.map(variantEdge => {
        const variant = variantEdge.node;
        const variantImage = variant.image?.src || defaultImage;

        return {
          id: variant.id,
          variantId: variant.id,
          name: `${product.title} - ${variant.title || "Default"}`,
          description: product.description,
          price: variant.price.amount,
          currency: variant.price.currencyCode,
          image: variantImage,
        };
      });
    });

    res.json(products);
  } catch (err) {
    console.error("Shopify products fetch error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
