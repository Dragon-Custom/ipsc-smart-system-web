"use client";
import { BLEStopplateService } from "@/ble_stopplate_service";
import { Timer as TimerIcon } from "@mui/icons-material";
import { Button, ButtonProps, Container, Divider, Grid, List, ListItemButton, ListItemButtonProps, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import React from "react";
import StopplateSettngDialog from "./stooplateSettingDialog";

function getRandomArbitrary(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

interface TimerControlButtonProps extends React.PropsWithChildren, ButtonProps { }
function TimerControlButton(props: TimerControlButtonProps) {
	const { children: CHILDREN, ...BTN_PROP } = props;
	return (
		<Grid item xs={1}>
			<Button variant="outlined" fullWidth sx={{height:"100%"}} {...BTN_PROP}>{CHILDREN}</Button>
		</Grid>
	);
}

interface HitRecordItemProps extends ListItemButtonProps {
	index: number;
	selectedIndex: number;
	dispatch: (value: number) => unknown;
	hitRecord: HitRecord;
}
function HitRecordItem(props: HitRecordItemProps) {
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
			<ListItemText primary={props.hitRecord.absoluteTime} secondary={`Shot ${props.index} / Time split ${(props.hitRecord.splitTime).toFixed(2)}`}/>
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


interface HitRecord {
	absoluteTime: number,
	splitTime: number,
}
function hitRecordReducer(
	state: HitRecord[],
	action: {
		type: "insert" | "clear",
		value?: HitRecord
	},
): HitRecord[] {
	switch (action.type) {
	case "insert":
		if (action.value)
			return [...state, ...[action.value]];
		return state;
	case "clear":
		return [
			{
				absoluteTime: 0,
				splitTime: 0,
			},
		] as HitRecord[];
	default:
		throw Error("Unknown action.");
	}
}

let count_down_flag = false;
export default function Timer() {
	const stopplate = BLEStopplateService.GetInstance();
	// const [countDownFlag, setCountDownFlag] = React.useState(false);
	const [currentShot, currentShotDispatch] = React.useReducer(currentShotReducer, 0);
	const [hitRecord, hitRecordDispatch] = React.useReducer(hitRecordReducer, [
		{
			absoluteTime: 0,
			splitTime: 1,
		},
		{
			absoluteTime: 10,
			splitTime: 11,
		},
	]);
	const [displayTime, setDisplayTime] = React.useState(0);
	const [buttonDisableState, setButtonDisableState] = React.useState({
		review: false,
		start: false,
		clear: false,
		settings: false,
	});
	const [settingDialogOpen, setSettingDialogOpen] = React.useState(false);



	async function onStartButtonClick() {
		hitRecordDispatch({type: "clear"});
		//TODO: implemnent the stopplate connect feature to use this setting
		// const setting = await stopplate.getSettings();
		const minRandTime = 1, maxRandTime = 4;
		const countDownTime = getRandomArbitrary(minRandTime, maxRandTime);
		setButtonDisableState({ clear: false, review: true, settings: true, start: true });
		await new Promise((resolve) => {
			let left_time = countDownTime;
			function breakOut() {
				clearInterval(intervalId);
				resolve(null);
			}
			setTimeout(breakOut, countDownTime * 1000);
			const intervalId = setInterval(() => {
				left_time = left_time - 0.01;
				setDisplayTime(left_time);
				if (count_down_flag) {
					resolve(null);
					clearInterval(intervalId);
				}
			}, 10);
		});
		setButtonDisableState({ clear: true, review: false, settings: true, start: true });
		setDisplayTime(0);
		if (count_down_flag){
			count_down_flag = false;
			setButtonDisableState({
				clear: false,
				review: false,
				settings: false,
				start: false,
			});
			setDisplayTime(0);
		}
	}

	function onReviewButtonClick() {
		//TODO: implemnent the stopplate connect feature to use this setting
		// stopplate.removeHitCallback();
		setButtonDisableState({ clear: false, review: false, settings: false, start: false });
	}
	
	function onClearButtonClick() {
		count_down_flag = true;
		hitRecordDispatch({type: "clear"});
	}

	function onSettingButtonClick() {
		setSettingDialogOpen(true);
	}

	React.useEffect(() => {
		setDisplayTime(hitRecord[currentShot].absoluteTime);
	}, [currentShot, hitRecord]);

	return (
		<>
			<Container maxWidth="md">
				<Stack alignItems={"center"}>
					<Typography variant="h1">{displayTime.toFixed(2)}</Typography>
					<Stack direction={"row"} justifyContent={"space-around"} width={"100%"}>
						<Typography variant="caption">Shot: {currentShot+1}/{hitRecord.length}</Typography>
						<Typography variant="caption">Time split: {hitRecord[currentShot].splitTime.toFixed(2)}</Typography>
					</Stack>
				</Stack>
				<Divider sx={{my:2}} />
				<Grid container rowSpacing={1} columnSpacing={1} columns={2} sx={{height:150}}>
					<TimerControlButton disabled={buttonDisableState.review} onClick={onReviewButtonClick}>Review</TimerControlButton>
					<TimerControlButton disabled={buttonDisableState.start} onClick={onStartButtonClick}>Start</TimerControlButton>
					<TimerControlButton disabled={buttonDisableState.clear} onClick={onClearButtonClick}>Clear</TimerControlButton>
					<TimerControlButton disabled={buttonDisableState.settings} onClick={onSettingButtonClick}>Settings</TimerControlButton>
				</Grid>
				<Divider sx={{my:2}} />
				<List component="nav" aria-label="main mailbox folders">
					{hitRecord.map((v, k) =>
						<HitRecordItem
							key={k}
							dispatch={(value) => currentShotDispatch({ type: "set", value })}
							index={k}
							selectedIndex={currentShot}
							hitRecord={v}
						/>,
					)}
				</List>
			</Container>
			<StopplateSettngDialog open={settingDialogOpen} onClose={() => setSettingDialogOpen(false)}/>
		</>
	);
}