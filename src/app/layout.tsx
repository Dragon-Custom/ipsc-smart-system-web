"use client";
import React from "react";
import { Inter as inter } from "next/font/google";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import GlobalLayoutAppBar from "@/components/GlobalLayout/GlobalLayoutAppBar";
import { Grid, Paper, Stack, ThemeProvider, createTheme } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import GlobalLayoutSideBar from "@/components/GlobalLayout/GlobalLayoutSideBar";

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
                    <ConfirmProvider>
                        <GlobalLayoutSideBar
                            open={sideBarState}
                            onClose={() => dispatch("close")}
                            onOpen={() => dispatch("open")}
                        />
                        <GlobalLayoutAppBar
                            onMenuClick={() => dispatch("open")}
                        />
                        <Paper elevation={0}>{children}</Paper>
                    </ConfirmProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
