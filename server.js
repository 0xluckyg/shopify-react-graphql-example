// Shopify Partners Login
// https://partners.shopify.com
// For development use ngrok tunnelling 
// ~/ngrok http 3000
// If ngrok pro option
// ~/ngrok http 3000 -subdomain=scottshopify
// https://scottshopify.ngrok.io
// Node Auth Help
// https://help.shopify.com/en/api/tutorials/build-a-shopify-app-with-node-and-express#step-2-create-and-configure-your-app-in-the-partner-dashboard
// To Run App
// {forwarding address}/shopify?shop={shop name}.myshopify.com
// https://scottshopify.ngrok.io/auth?shop=miraekomerco.myshopify.com

// next.js takes care of:
// webpack configuration
// hot module replacement
// server-side rendering
// production setup
// client-side routing
// updating babel configuration
// code splitting

require('./config/config');
require('isomorphic-fetch');
//koa and koa-session will take care of Shopify OAuth and create a custom server
const Koa = require('koa');
const session = require('koa-session');
const next = require('next');
//package exposes "shopifyAuth" by default. We're changing that to "createShopifyAuth"
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
//app refers to the Next.js app, which is the react build
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, TUNNEL_URL } = process.env;
//List of Shopify access permissions available
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

//Prepare next.js react app
app.prepare().then(() => {

    //Koa acts like "app" in express
    const server = new Koa();    
    server.keys = [SHOPIFY_API_SECRET_KEY];

    server.use(session(server));    
    server.use(
        // Returns an authentication middleware taking up (by default) the routes /auth and /auth/callback.
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: shopifyScopes,            
            //After authenticating with Shopify redirects to this app through afterAuth
            afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;      
                //shopOrigin (shop) is the myshopify URL of the store that installs the app
                //httpOnly: true tells the cookie that the cookie should only be accessible by the server  
                ctx.cookies.set('shopOrigin', shop, { httpOnly: false })

                //Shopify billing set up
                const stringifiedBillingParams = JSON.stringify({
                        recurring_application_charge: {
                        name: 'Recurring charge',
                        price: 9.99,
                        // return_url: TUNNEL_URL,
                        test: true
                    }
                })
                const options = {
                    method: 'POST',
                    body: stringifiedBillingParams,
                    credentials: 'include',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json',
                    },
                };


                ctx.redirect('/');
            },
        }),
    );        
    server.use(graphQLProxy());
    //Returns a middleware to verify requests before letting the app further in the chain.
    //Everything after this point will require authentication
    server.use(verifyRequest({
        // Path to redirect to if verification fails. defaults to '/auth'
        // authRoute: '/foo/auth',
        // Path to redirect to if verification fails and there is no shop on the query. defaults to '/auth'
        // fallbackRoute: '/install',
    }));
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