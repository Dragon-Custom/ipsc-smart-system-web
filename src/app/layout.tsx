import React from "react";
import type { Metadata } from "next";
import { Inter as inter } from "next/font/google";
import "./globals.css";

const INTER = inter({ subsets: ["latin"] });

export const METADATA: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function rootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={INTER.className}>{children}</body>
		</html>
	);
}
