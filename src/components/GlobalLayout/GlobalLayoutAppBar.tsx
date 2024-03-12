import React from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { Menu } from "@mui/icons-material";

export interface GlobalLayoutAppBarProps {
    onMenuClick?: () => void;
}

export default function GlobalLayoutAppBar(props:GlobalLayoutAppBarProps) {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={props.onMenuClick}
					>
						<Menu />
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }} >
						<>{process.env.NEXT_PUBLIC_APP_TITLE}</>
					</Typography>
				</Toolbar>
			</AppBar>
		</Box>
	);
}