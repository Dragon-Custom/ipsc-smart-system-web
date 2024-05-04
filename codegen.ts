import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
	schema: process.env.NEXT_PUBLIC_GRAPHQLAPI_ENDPOINT,
	// documents: ["src/**/*.tsx"],
	emitLegacyCommonJSImports: false,
	ignoreNoDocuments: true, // for better experience with the watcher
	generates: {
		"./src/gql/": {
			preset: "client",
			plugins: [],
		},
	},
};

export default config;