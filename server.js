//https://scottshopify.ngrok.io/auth?shop=bath-niche.myshopify.com

require('./config/config');
require('isomorphic-fetch');
const Koa = require('koa');
const next = require('next');
const session = require('koa-session');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
const shopifyScopes = [
    "read_products",
    "write_products",
    "read_product_listings",
    "read_customers",
    "write_customers",
    "read_orders",
    "write_orders",
    "read_draft_orders",
    "write_draft_orders",
    "read_inventory",
    "write_inventory",
    "read_shipping",
    "write_shipping",
    "read_analytics",
    "read_marketing_events",
    "write_marketing_events",
    "read_resource_feedbacks",
    "write_resource_feedbacks",
    "read_shopify_payments_payouts",
    "unauthenticated_read_product_listings",
    "unauthenticated_write_checkouts",
    "unauthenticated_write_customers",
    // "read_all_orders", //Requires approval from Shopify Partners dashboard
    // "read_users", //Only for Shopify Plus
    // "write_users", //Only for Shopify Plus
]

app.prepare().then(() => {
    const server = new Koa();
    server.use(session(server));
    server.keys = [SHOPIFY_API_SECRET_KEY];

    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: shopifyScopes,
            afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;        
                ctx.redirect('/');
            },
        }),
    );
        
    server.use(verifyRequest());
    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    });

    server.listen(port, () => {
        console.log(`Running on port: ${port}`);
    });
});