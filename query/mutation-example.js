import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_PRICE = gql`
    mutation productVariantUpdate($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
            product {
                title
            }
            productVariant {
                id
                price
            }
        }
    }
`;

class EditProduct extends React.Component {
    state = {
        discount: '',
        price: '',
        variantId: '',
    };
  
    componentDidMount() {
      this.setState({discount: this.setUpItemToBeConsumedByForm()});
    }
    
    render() {
        const {name, price, discount, variantId} = this.state;
            return (
            <Mutation mutation={UPDATE_PRICE}>
                {(handleSubmit, {error, data}) => {
                    return (
                        <Page>
                            <Layout>
                                <Layout.Section>
                                {/* content */}
                                </Layout.Section>
                            </Layout>
                        </Page>
                    );
                }}
            </Mutation>
        );
    };
}
  
export default EditProduct
