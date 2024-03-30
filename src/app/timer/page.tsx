"use client";
import { BLEStopplateService } from "@/ble_stopplate_service";
import { Timer as TimerIcon } from "@mui/icons-material";
import { Button, ButtonProps, Container, Divider, Grid, List, ListItemButton, ListItemButtonProps, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import React from "react";
import StopplateSettngDialog from "./stooplateSettingDialog";
import { BUZZER_WAVEFORM_OBJECT, beep } from "@/buzzer";
import { confirm } from "material-ui-confirm";

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
	value: HitRecord;
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
			<ListItemText primary={props.value.absoluteTime.toFixed(2)} secondary={`Shot ${props.index} / Time split ${(props.value.splitTime).toFixed(2)}`}/>
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
		type: "insert" | "clear" | "get",
		value?: HitRecord
	},
) {
	switch (action.type) {
	case "insert":
		if (action.value)
			return [...[action.value], ...state];
		return state;
	case "clear":
		return [
			{
				absoluteTime: 0,
				splitTime: 0,
			},
		];
	case "get":
		return state;
	default:
		throw Error("Unknown action.");
	}
}

let break_count_down_flag = false;
let hit_callback_id = 0;
let start_time = 0;
export default function Timer() {
	const stopplate = BLEStopplateService.GetInstance();
	const [currentShot, currentShotDispatch] = React.useReducer(currentShotReducer, 0);
	const [hitRecord, hitRecordDispatch] = React.useReducer(hitRecordReducer, [
		{
			absoluteTime: 0,
			splitTime: 0,
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
		if (!stopplate.checkConnectionState()) {
			confirm({
				content: "Please make sure that you have been connect to the stopplate!",
				title: "Error",
				hideCancelButton: true,
				confirmationButtonProps: {
					variant: "contained",
					color: "error",
				},
			});
			return;
		}
		hitRecordDispatch({type: "clear"});
		const setting = await stopplate.getSettings();
		const countDownTime = getRandomArbitrary(setting.countdown_random_time_min, setting.countdown_random_time_max);
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
				if (break_count_down_flag) {
					resolve(null);
					clearInterval(intervalId);
				}
			}, 10);
		});
		setButtonDisableState({ clear: true, review: false, settings: true, start: true });
		setDisplayTime(0);
		if (break_count_down_flag){
			break_count_down_flag = false;
			setButtonDisableState({
				clear: false,
				review: false,
				settings: false,
				start: false,
			});
			setDisplayTime(0);
			return;
		}
		hit_callback_id = stopplate.registerHitCallback(cbFn);
		start_time = stopplate.getPrecisionTime();
		beep(setting.buzzer_frequency,BUZZER_WAVEFORM_OBJECT[setting.buzzer_waveform],setting.buzzer_duration*1000, 1.0);
	}

	function onReviewButtonClick() {
		stopplate.removeHitCallback(hit_callback_id);
		setButtonDisableState({ clear: false, review: false, settings: false, start: false });
	}
	
	function onClearButtonClick() {
		break_count_down_flag = true;
		hitRecordDispatch({type: "clear"});
	}

	function onSettingButtonClick() {
		setSettingDialogOpen(true);
	}


	//NOTE: this ref is important for the callback function which can use the very up-to-date value in the function;
	const hitReacordStateRef = React.useRef(hitRecord);
	hitReacordStateRef.current = hitRecord;
	const cbFn = React.useCallback(function(event: Event, stamp: string)  {
		const time = parseFloat(stamp);
		const calcTime = time - start_time;
		hitRecordDispatch({
			type: "insert",
			value: {
				absoluteTime: calcTime,
				splitTime: calcTime - hitReacordStateRef.current[0].absoluteTime,
			},
		});
	}, [hitRecord]);
	
	
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
							value={v}
						/>,
					)}
				</List>
			</Container>
			{settingDialogOpen ? 
				<StopplateSettngDialog open={settingDialogOpen} onClose={() => setSettingDialogOpen(false)}/>
				: <></>
			}
		</>
	);
}