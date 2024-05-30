import React from "react";
import { Grid, GridOwnProps, Paper, Typography } from "@mui/material";


export interface PieChartBlockProps extends GridOwnProps{
	title: string;
	children: React.ReactNode;
}

export const PieChartBlock = (props: PieChartBlockProps) => {
	return <Grid item xs={12} md={6} {...props}>
		<Paper elevation={2} sx={{ p: 2 }}>
			<Typography variant="h6" textAlign={"center"}>{props.title}</Typography>
			{props.children}
		</Paper>
	</Grid>;
};