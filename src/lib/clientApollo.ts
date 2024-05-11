"use client";
import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	split,
	ApolloLink,
	Operation,
	FetchResult,
} from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { Observable, getMainDefinition } from "@apollo/client/utilities";
import { Client, ClientOptions, createClient } from "graphql-sse";

/* #region create Websocket link for subscription */
const httpLink = new HttpLink({
	uri: location.origin + "/api/graphql",
		
});

class SSELink extends ApolloLink {
	private client: Client;
 
	constructor(options: ClientOptions) {
		super();
		this.client = createClient(options);
	}
 
	public request(operation: Operation): Observable<FetchResult> {
		return new Observable((sink) => {
			return this.client.subscribe<FetchResult>(
				{ ...operation, query: operation.query.loc?.source.body ?? ""},
				{
					next: sink.next.bind(sink),
					complete: sink.complete.bind(sink),
					error: sink.error.bind(sink),
				},
			);
		});
	}
}
const sseLink = new SSELink({
	url: location.origin + "/api/graphql",
});

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind == "OperationDefinition" &&
			definition.operation == "subscription"
		);
	},
	sseLink,
	httpLink,
);

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	connectToDevTools: true,
	link: splitLink,
});

if (process.env.NODE_ENV !== "production") {
	// Adds messages only in a dev environment
	loadDevMessages();
	loadErrorMessages();
}