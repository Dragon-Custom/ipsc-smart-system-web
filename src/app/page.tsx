import React from "react";
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = 3600;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";
export default function Home() {
	return (
		<>
			<h1>Wellcome to IPSC smart system</h1>
			<h1>Click the top-left button to navigate to different pages!</h1>
		</>
	);
}
