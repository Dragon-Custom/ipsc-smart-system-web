"use client";
import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
} from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

/* #region create Websocket link for subscription */
const httpLink = new HttpLink({
	uri: process.env.NEXT_PUBLIC_API_ENDPOINT,
});

// const sseLink = new ServerSentEventsLink({
// 	graphQlSubscriptionUrl: process.env.backendUrl,
// });
// const wsLink = new GraphQLWsLink(
// 	createClient({
// 		url: process.env.NEXT_PUBLIC_wsBackendUrl as string,
// 	})
// );
// const splitLink = split(
// 	({ query }) => {
// 		const definition = getMainDefinition(query);
// 		return (
// 			definition.kind === "OperationDefinition" &&
// 			definition.operation === "subscription"
// 		);
// 	},
// 	wsLink,
// 	httpLink
// );
export const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: httpLink,
});

if (process.env.NODE_ENV !== "production") {
	// Adds messages only in a dev environment
	loadDevMessages();
	loadErrorMessages();
}