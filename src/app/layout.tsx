"use client";
import React from "react";
import { Inter as inter } from "next/font/google";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import GlobalLayoutAppBar from "@/components/GlobalLayout/GlobalLayoutAppBar";
import { Paper, Stack, ThemeProvider, Toolbar, createTheme } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import GlobalLayoutSideBar from "@/components/GlobalLayout/GlobalLayoutSideBar";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apolloClient";


const INTER = inter({ subsets: ["latin"] });

const THEME = createTheme({
	palette: {
		mode: "dark",
	},
});





type SidebarAction = "close" | "open";
function sideBarReducer(state: boolean, action: SidebarAction): boolean {
	switch (action) {
	case "close":
		return false;
	case "open":
		return true;
	default:
		throw Error("Unknown action.");
	}
}
export default function RootLayout({
	children,
}: Readonly<{
    children: React.ReactNode;
}>) {
	const [sideBarState, dispatch] = React.useReducer(sideBarReducer, false);

	return (
		<html lang="en">
			<body className={INTER.className}>
				<ThemeProvider theme={THEME}>
					<ApolloProvider client={client}>
						<ConfirmProvider>
							<GlobalLayoutSideBar
								open={sideBarState}
								onClose={() => dispatch("close")}
								onOpen={() => dispatch("open")}
							/>
							<GlobalLayoutAppBar
								onMenuClick={() => dispatch("open")}
							/>
							<Stack sx={{width:"100%", top:0}}>
								<Toolbar />
								<Paper elevation={1} sx={{height:"100%", p:2}}>{children}</Paper>
							</Stack>
							<Paper
								elevation={1}
								style={{
									top: 0,
									right: 0,
									left: 0,
									bottom: 0,
									position: "absolute",
									zIndex: -1000,
								}}/>
						</ConfirmProvider>
					</ApolloProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
