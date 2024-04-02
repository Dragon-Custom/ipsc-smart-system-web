

module.exports = {
	client: {
		service: {
			name: "my-graphql-app",
			url: process.env.NEXT_PUBLIC_API_ENDPOINT,
			includes: ["./src/**/*.js"],
			excludes: ["**/__tests__/**"],
		},
	},
};