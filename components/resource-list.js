import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { 
    Card,
    ResourceList,
    Stack,
    TextStyle,
    Thumbnail,
} from '@shopify/polaris';
//Using local storage for this demo app. Should use a database in a production app
import localStorage from 'store-js';
import { Redirect } from '@shopify/app-bridge/actions';
import * as PropTypes from 'prop-types';

const GET_PRODUCTS_BY_ID = gql`
    query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
            ... on Product {
                title
                handle
                descriptionHtml
                id
                images(first: 1) {
                        edges {
                        node {
                            originalSrc
                            altText
                        }
                    }
                }
                variants(first: 1) {
                        edges {
                        node {
                            price
                            id
                        }
                    }
                }
            }
        }
    }
`;

class ResourceListWithProducts extends React.Component {
    state = {
        item: '',
    };

    static contextTypes = {
        polaris: PropTypes.object
    };
    // Because we're accessing Shopify App Bridge through Polaris, we'll need to access additional Shopify App Bridge methods through Polaris context. 
    // To do this, We'll add context and a redirect for Shopify App Bridge to the ResourceList component from Polaris.
    redirectToProduct = () => {
        const redirect = Redirect.create(this.context.polaris.appBridge);
        redirect.dispatch(
            Redirect.Action.APP,
            '/edit-products'
        );
    };

    // Apollo’s components use the render props pattern in React to show loading and error states.     
    render() {
        // The sample embedded app discounts products for two weeks, so we define a variable for twoWeeksFromNow
        const twoWeeksFromNow = new Date(Date.now() + 12096e5).toDateString();        
        return (
            //Using local storage for this demo app. Should use a database in a production app
            //Sending an array of IDs inside a dictionary with key "ids" because gql specified so above
            <Query query={GET_PRODUCTS_BY_ID} variables={{ids: localStorage.get('ids')}}>
                {({ data, loading, error }) => {
                    if (loading) return <div>Loading…</div>;
                    if (error) return <div>{error.message}</div>;                    
                    return (
                        <Card sectioned>
                            <ResourceList
                                showHeader
                                resourceName={{ singular: 'Product', plural: 'Products' }}
                                items={data.nodes}
                                renderItem={item => {
                                    const media = (
                                    <Thumbnail
                                        source={
                                            item.images.edges[0]
                                            ? item.images.edges[0].node.originalSrc
                                            : ''
                                        }
                                        alt={
                                            item.images.edges[0]
                                            ? item.images.edges[0].node.altText
                                            : ''
                                        }
                                    />
                                    );
                                    const price = item.variants.edges[0].node.price;
                                    return (
                                    <ResourceList.Item
                                        id={item.id}
                                        media={media}
                                        accessibilityLabel={`View details for ${item.title}`}
                                        onClick={() => {
                                            localStorage.set('item', item);
                                            this.redirectToProduct();
                                        }}
                                    >
                                        <Stack>
                                        {/* 'fill' means fill the horizontal space in the stack with children */}
                                        <Stack.Item fill>
                                            <h3>
                                            <TextStyle variation="strong">
                                                {item.title}
                                            </TextStyle>
                                            </h3>
                                        </Stack.Item>
                                        <Stack.Item>
                                            <p>${price}</p>
                                        </Stack.Item>
                                        <Stack.Item>
                                            <p>Expires on {twoWeeksFromNow} </p>
                                        </Stack.Item>
                                        </Stack>
                                    </ResourceList.Item>
                                    );
                                }}
                            />
                        </Card>
                    );
                }}
            </Query>
        );
    }
}
    
export default ResourceListWithProducts;