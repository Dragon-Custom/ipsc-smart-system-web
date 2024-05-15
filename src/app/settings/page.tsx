"use client";
import { useLocalSetting } from "@/lib/setting";
import { Container, Divider, Paper, Stack, Switch, Typography, styled } from "@mui/material";
import React from "react";


const Section = styled(Paper, {})(({theme}) => ({
	padding: theme.spacing(2),
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
}));
Section.defaultProps = {
	...Section.defaultProps,
	variant: "outlined",
};


export default function Settings() {
	const { setting, saveSetting } = useLocalSetting();

	return (
		<>
			<Container maxWidth="sm" sx={{height: "100%"}}>
				<Paper sx={{ height: "100%", p: 2 }} elevation={3}>
					<Stack spacing={2} divider={<Divider />}>
						<Section>
							<Typography variant="button">Dark mode</Typography>
							<Switch checked={setting.darkMode} onClick={() => saveSetting({...setting, darkMode: !setting.darkMode})} />
						</Section>
						
					</Stack>
				</Paper>
			</Container>
		</>
	);
}