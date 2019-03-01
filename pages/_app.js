require('../config/config');
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/styles.css';
import Cookies from 'js-cookie'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
    fetchOptions: {
        credentials: 'include'
    }
});

class Gateguard extends App {
    state = {
        shopOrigin: Cookies.get('shopOrigin')
    }
    render() {
        const { Component, pageProps } = this.props;
        return (
            <React.Fragment>
                <Head>
                    <title>Gateguard</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta charSet="utf-8" />
                </Head>                
                <AppProvider shopOrigin={this.state.shopOrigin} apiKey={process.env.SHOPIFY_API_KEY} forceRedirect>
                    <ApolloProvider client={client}><Component {...pageProps} /></ApolloProvider>
                </AppProvider>
            </React.Fragment>
        );
    }
}

export default Gateguard;