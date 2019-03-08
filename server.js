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
//Used to securely proxy graphQL requests from Shopify
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const processPayment = require('./server/router');
const bodyParser = require('koa-bodyparser');
const validateWebhook = require('./server/webhooks');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
//app refers to the Next.js app, which is the react build
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, APP_URL } = process.env;
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
    const router = new Router();
    server.keys = [SHOPIFY_API_SECRET_KEY];

    //validates webhook and listens for products/create in the store
    router.post('/webhooks/products/create', bodyParser(), validateWebhook);
    router.get('/', processPayment);

    server.use(session(server));    
    server.use(
        // Returns an authentication middleware taking up (by default) the routes /auth and /auth/callback.
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: shopifyScopes,            
            //After authenticating with Shopify redirects to this app through afterAuth
            //Async returns promise to wait for Shopify billing fetch to complete
            async afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;   
                //The app will use a library called Shopify App Bridge to communicate with Shopify by passing in Shopify API key to shopOrigin in Polaris AppProvider
                //shopOrigin (shop) is the myshopify URL of the store that installs the app
                //httpOnly: true tells the cookie that the cookie should only be accessible by the server  
                ctx.cookies.set('shopOrigin', shop, { httpOnly: false })                

                //Subscribing to webhook event 'products/create'
                //In a production app, you would need to store the webhook in a database to access the response on the frontend.
                const stringifiedWebhookParams = JSON.stringify({
                    webhook: {
                        topic: 'products/create',
                        address: `${APP_URL}/webhooks/products/create`,
                        format: 'json',
                    },
                });
                const webhookOptions = {
                    method: 'POST',
                    body: stringifiedWebhookParams,
                    credentials: 'include',
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json',
                    },
                };
                console.log('shop ', shop)
                console.log('shop2 ', webhookOptions)
                fetch(`https://${shop}/admin/webhooks.json`, webhookOptions)
                    .then((response) => { 
                        console.log('webhook res1 ',response)
                        return response.json()
                    })
                    .then((jsonData) => {
                        const data = JSON.stringify(jsonData)
                        console.log('webhook res2 ', data)
                    })
                    .catch((error) => console.log('webhook error', error));

                //Shopify billing API requires 3 variables: price, name, return_url                
                const stringifiedBillingParams = JSON.stringify({
                    recurring_application_charge: {
                        name: 'Recurring charge', //The name of your charge. For example, “Sample embedded app 30-day fee.”
                        price: 9.99,
                        return_url: APP_URL,
                        trial_days: 7, //If merchant doesn't uninstall the app within these days, Shopify charges the merchant
                        test: true //The Billing API also has a test property that simulates successful charges.
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
                //Make Shopify billing request using await
                const confirmationURL = await fetch(
                `https://${shop}/admin/recurring_application_charges.json`, options)
                    .then((response) => {                        
                        return response.json()
                    })
                    .then((jsonData) => {                         
                        return jsonData.recurring_application_charge.confirmation_url 
                    })
                    .catch((error) => console.log('error', error)); 

                ctx.redirect(confirmationURL);                
            },
        }),
    );        
    //Used to securely proxy graphQL requests from Shopify
    server.use(graphQLProxy());
    server.use(bodyParser());
    server.use(router.routes());
    //Returns a middleware to verify requests before letting the app further in the chain.
    //Everything after this point will require authentication
    server.use(verifyRequest({        
        // Path to redirect to if verification fails. defaults to '/auth'
        // authRoute: '/foo/auth',
        // Path to redirect to if verification fails and there is no shop on the query. defaults to '/auth'
        // fallbackRoute: '/install',
    }));
    //Lets next.js prepare all the requests on the React side
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