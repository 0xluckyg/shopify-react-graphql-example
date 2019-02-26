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
import { TextStyle } from '@shopify/polaris';

const Index = () => (
	<div>
		<TextStyle variation="positive">
			Sample app using React and Next.js
		</TextStyle>
    </div>
);
  
export default Index;