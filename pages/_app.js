require('../config/config');
//Polaris CSS, different from components. Determines styles for Polaris components.
import '@shopify/polaris/styles.css';
//Polaris components. Polaris has built in building blocks we can use
import { AppProvider } from '@shopify/polaris';
import App from 'next/app';
import Head from 'next/head';
import Cookies from 'js-cookie'
//Apollo lets React app interact with GraphQL
//Provides Apollo interface. Includes local cache
import ApolloClient from 'apollo-boost';
//Provides Apollo view layer for React
import { ApolloProvider } from 'react-apollo';

//Since the app is already using cookies for login and session management, we can simply reuse these credentials when making requests to the GraphQL endpoint by passing the credentials option
const client = new ApolloClient({
    fetchOptions: {
        credentials: 'include'
    }
});

//_app file overrides Next.js App file.
// Next.js uses an App component to pass down classes to the other files in your app. This saves us from having to add imports to each file
// _app.js file that passes down Apollo and Polaris components, styles, and everything else typically found in an index file
class Gateguard extends App {    
    state = {
        shopOrigin: Cookies.get('shopOrigin')
    }
    render() {
        const { Component, pageProps } = this.props;
        return (
            // React.Fragment lets you add extra children without adding a node to the DOM
            <React.Fragment>
                <Head>
                    <title>Gateguard</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta charSet="utf-8" />
                </Head>
                {/* Polaris AppProvider must wrap the whole app in order for Polaris React components to function */}
                {/* The app will use a library called Shopify App Bridge to enable Shopify embeded app by passing in Shopify API key to shopOrigin in Polaris AppProvider */}
                <AppProvider shopOrigin={this.state.shopOrigin} apiKey={process.env.SHOPIFY_API_KEY} forceRedirect>
                    {/* Wrapping the app with ApolloProvider lets components further down the tree access the Apollo client */}
                    <ApolloProvider client={client}>
                        <Component {...pageProps} />
                    </ApolloProvider>
                </AppProvider>
            </React.Fragment>
        );
    }
}

export default Gateguard;