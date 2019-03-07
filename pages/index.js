// https://polaris.shopify.com/components/get-started

import { EmptyState, Layout, Page, ResourcePicker } from '@shopify/polaris';
//Using local storage for this demo app. Should use a database in a production app
import localStorage from 'store-js';
import ResourceListWithProducts from '../components/resource-list';

//pages/index.js file gets automatically transpiled and rendered by Next.js
//Next.js automatically routes views that are stored in a "pages" directory using the file name
class Index extends React.Component {
    state = { open: false };

    render() {
        const emptyState = !localStorage.get('ids');
        return (
                <Page
                    primaryAction={{
                        content: 'Select products',
						onAction: () => this.setState({ open: true }),
                    }}
                >
                    {/* ResourcePicker lets you pick Shopify products. Triggers on state.open. Only works for embedded apps */}
					<ResourcePicker
						resourceType="Product"
						showVariants={false}
						open={this.state.open}
						onSelection={(resources) => this.handleSelection(resources)}
						onCancel={() => this.setState({ open: false })}
					/>
                    {/* Checks if there are products selected */}
                    {emptyState ? (
                        <Layout>
                            <EmptyState
                                heading="Select products to start"
                                action={{
                                    content: 'Select products',
                                    onAction: () => this.setState({ open: true }),
                                }}
                                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
                            >
                                <p>Select products and change their price temporarily</p>
                            </EmptyState>                        
                        </Layout>
                    ) : (
                        <ResourceListWithProducts />
                    )}
                </Page >
        );
    }
    handleSelection = (resources) => {
        //Passes data from the ResourcePicker
		const idsFromResources = resources.selection.map((product) => product.id);
      	this.setState({ open: false });
      	localStorage.set('ids', idsFromResources);
    };
}

export default Index;