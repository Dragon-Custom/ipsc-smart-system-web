/** @type {import('next').NextConfig} */
const NEXT_CONFIG = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		runtime: "edge", // 'node.js' (default) | experimental-edge
	},
	
};

export default NEXT_CONFIG;
