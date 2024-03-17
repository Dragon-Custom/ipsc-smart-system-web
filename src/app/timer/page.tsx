"use client";
import { Timer as TimerIcon } from "@mui/icons-material";
import { Button, ButtonProps, Container, Divider, Grid, List, ListItemButton, ListItemButtonProps, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import React from "react";


interface TimerControlButtonProps extends React.PropsWithChildren, ButtonProps { }
function TimerControlButton(props: TimerControlButtonProps) {
	const { children: CHILDREN, ...BTN_PROP } = props;
	return (
		<Grid item xs={1}>
			<Button variant="outlined" fullWidth sx={{height:"100%"}} {...BTN_PROP}>{CHILDREN}</Button>
		</Grid>
	);
}

interface ShotHistoryItemProps extends ListItemButtonProps {
	index: number;
	selectedIndex: number;
	dispatch: (value: number) => unknown;
}
function ShotHistoryItem(props: ShotHistoryItemProps) {
	const { index: INDEX, selectedIndex: SELECTED_INDEX, dispatch, ...BTN_PROP } = props;
	return (
		<ListItemButton
			{...BTN_PROP}
			selected={SELECTED_INDEX === INDEX}
			onClick={() => dispatch(INDEX)}
		>
			<ListItemIcon>
				<TimerIcon />
			</ListItemIcon>
			<ListItemText primary="10.10" secondary={`Shot ${1} / Time split ${(10.0).toFixed(2)}`}/>
		</ListItemButton>
	);
}

function currentShotReducer(
	state: number,
	action: {
		type: "increment" | "decrement" | "set"
		value?: number,
	},
) {
	switch (action.type) {
	case "increment":
		return state+1;
	case "decrement":
		return state - 1;
	case "set":
		return action.value ?? 0;
	default:
		throw Error("Unknown action.");
	}
}
export default function Timer() {
	const [currentShot, currentShotDispatch] = React.useReducer(currentShotReducer, 0);


	return (
		<>
			<Container maxWidth="md">
				<Stack alignItems={"center"}>
					<Typography variant="h1">00.00</Typography>
					<Stack direction={"row"} justifyContent={"space-around"} width={"100%"}>
						<Typography variant="caption">Shot 1/11</Typography>
						<Typography variant="caption">Time split 00.00</Typography>
					</Stack>
				</Stack>
				<Divider sx={{my:2}} />
				<Grid container rowSpacing={1} columnSpacing={1} columns={2} sx={{height:150}}>
					<TimerControlButton>Review</TimerControlButton>
					<TimerControlButton>Start</TimerControlButton>
					<TimerControlButton>Clear</TimerControlButton>
					<TimerControlButton>Settings</TimerControlButton>
				</Grid>
				<Divider sx={{my:2}} />
				<List component="nav" aria-label="main mailbox folders">
					<ShotHistoryItem
						dispatch={(value) => currentShotDispatch({ type: "set", value })}
						index={0}
						selectedIndex={currentShot}
					/>
					<ShotHistoryItem
						dispatch={(value) => currentShotDispatch({ type: "set", value })}
						index={1}
						selectedIndex={currentShot}
					/>
				</List>
			</Container>
		</>
	);
}