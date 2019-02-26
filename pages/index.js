//Running App
//npm run dev
// Shopify Partners Login
// https://partners.shopify.com
// For development use ngrok tunnelling 
// ~/ngrok http 3000
// If ngrok pro option
// ~/ngrok http 3000 -subdomain=scottshopify
// https://scottshopify.ngrok.io
// React Auth Help
// https://help.shopify.com/en/api/tutorials/build-a-shopify-app-with-node-and-react/set-up-your-app
// To Run App
// {forwarding address}/shopify?shop={shop name}.myshopify.com
// http://scottshopify.ngrok.io/shopify?shop=bath-niche.myshopify.com
import { EmptyState, Layout, Page, TextStyle } from '@shopify/polaris';

const Index = () => (
	<Page primaryAction={{
		content: 'Select products',
	}}>
		<Layout>
			<EmptyState
				heading="Header Text"
				action={{
				content: 'Button Text',
					onAction: () => console.log('clicked'),
				}}
				image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg">
				<p>Content text example.</p>
			</EmptyState>
		</Layout>		
    </Page>
);
  
export default Index;