import MillionLint from "@million/lint";

/** @type {import('next').NextConfig} */
const NEXT_CONFIG = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		runtime: "edge",
	},
};

// non million lin setup
// export default NEXT_CONFIG;
export default MillionLint.next({
	rsc: true,
	skipTransform: true,
	optimizeDOM: true,
	
})(NEXT_CONFIG);
