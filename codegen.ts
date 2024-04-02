import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
	schema: process.env.API_ENDPOINT,
	documents: ["src/**/*.tsx"],
	ignoreNoDocuments: true, // for better experience with the watcher
	generates: {
		"./src/gql/": {
			preset: "client",
			plugins: [],
		},
	},
};

export default config;