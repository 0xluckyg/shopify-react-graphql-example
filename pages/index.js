import { EmptyState, Layout, Page, ResourcePicker } from '@shopify/polaris';

//pages/index.js file gets automatically transpiled and rendered by Next.js
//Next.js automatically routes views that are stored in a "pages" directory using the file name
class Index extends React.Component {
    state = { open: false };

    render() {
        return (
                <Page
                    primaryAction={{
                        content: 'Select products',
						onAction: () => this.setState({ open: true }),
                    }}
                >
					<ResourcePicker
						resourceType="Product"
						showVariants={false}
						open={this.state.open}
						onSelection={(resources) => this.handleSelection(resources)}
						onCancel={() => this.setState({ open: false })}
					/>
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
                </Page >
        );
    }
    handleSelection = (resources) => {
		const idsFromResources = resources.selection.map((product) => product.id);
      	this.setState({ open: false })
      	console.log(resources);
    };
}

export default Index;