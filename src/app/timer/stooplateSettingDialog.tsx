"use client";
import { BLEStopplateService } from "@/lib/ble_stopplate_service";
import { BUZZER_WAVEFORM_OBJECT } from "@/lib/buzzer";
import { delay } from "@/lib/utils";
import {
	Backdrop,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
	FormControl,
	Grid,
	Input,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Slider,
	Stack,
	Typography,
} from "@mui/material";
import React from "react";

interface SettingItemProps extends SettingItem {
	//when slider or numeric input the value will be the value of component
	//when selector the value will be the index of the selected item
	onChange: (setting_name: string, value: number | number[]) => unknown;
}
function SettingItem(props: SettingItemProps) {

	function onChange(v: string | number) {
		props.onChange(props.setting_name, parseFloat(v as string));
	}

	function onRangeChange(v: number[]) {
		props.onChange(props.setting_name, v);
	}


	return (
		<>
			<Paper elevation={5} sx={{ px: 2, pt: 1, my:1}}>
				<Stack>
					<Typography align="center">{props.display_name}</Typography>
					{(() => {
						switch (props.type) {
						case "selector":
							return (
								<>
									<FormControl fullWidth>
										<InputLabel>Waveform</InputLabel>
										<Select
											value={props.value as number}
											label="Waveform"
											onChange={(v) => onChange(v.target.value)}
										>
											{props.selector_item?.map((v, k) => (
												<MenuItem value={k} key={k}>{v}</MenuItem>
											))}
										</Select>
									</FormControl>
								</>
							);
						case "slider":
							return (
								<>
									<Grid container gap={1}>
										<Grid item xs={9}>
											<Slider
												value={props.value}
												onChange={(e, v) =>
													onChange(
														v as number,
													)
												}
												min={props.min}
												max={props.max}
												step={1}
											/>
										</Grid>
										<Grid item xs={2}>
											<Input
												sx={{ml: 2}}
												fullWidth
												type="number"
												value={props.value}
												onChange={(v) =>
													onChange(
														v.currentTarget.value,
													)
												}
												inputProps={{
													min: props.min,
													max: props.max,
												}}
												endAdornment={props.unit}
												inputMode="decimal"
											/>
										</Grid>
									</Grid>
								</>
							);
						case "range":
							return (
								<>
									<Grid container gap={1}>
										<Grid item xs={2}>
											<Input
												sx={{mr: 1}}
												fullWidth
												type="number"
												value={(props.value as number[])[0]}
												onChange={(v) =>
													onChange(
														v.currentTarget.value,
													)
												}
												inputProps={{
													min: props.min,
													max: props.max,
												}}
												inputMode="decimal"
												endAdornment={props.unit}
											/>
										</Grid>
										<Grid item xs={7}>
											<Slider
												value={props.value}
												onChange={(e, v) =>
													onRangeChange(
														v as number[],
													)
												}
												min={props.min}
												max={props.max}
												valueLabelDisplay="auto"
												step={1}
											/>
										</Grid>
										<Grid item xs={2}>
											<Input
												sx={{ml: 1}}
												fullWidth
												type="number"
												value={(props.value as number[])[1]}
												onChange={(v) =>
													onChange(
														v.currentTarget.value,
													)
												}
												inputProps={{
													min: props.min,
													max: props.max,
												}}
												endAdornment={props.unit}
												inputMode="decimal"
											/>
										</Grid>
									</Grid>
								</>
							);
						}
					})()}
				</Stack>
			</Paper>
		</>
	);
}


interface SettingItem {
	setting_name: string;
	display_name: string;
	type: "slider" | "selector" | "range"
	max?: number;
	min?: number;
	selector_item?: string[];
	value: number | number[];
	unit?: string;
}

export interface StopplateSettngDialogProps extends DialogProps{
	onClose: () => void,
}
export default function StopplateSettngDialog(props: StopplateSettngDialogProps) {
	const stopplate = BLEStopplateService.GetInstance();
	const [connectState, setConnectState] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [setting, setSetting] = React.useState<SettingItem[]>([
		{
			setting_name: "indicator_light_up_duration",
			display_name: "Stopplate indicator light up duration",
			type: "slider",
			max: 10,
			min: 0,
			value: 0,
			unit: "s",
		},
		{
			setting_name: "countdown_random_time",
			display_name: "Timer countdown time random range",
			type: "range",
			max: 10,
			min: 0,
			value: [0, 0],
			unit: "s",
		},
		{
			setting_name: "buzzer_duration",
			display_name: "Buzer (beep sound) duration",
			type: "slider",
			max: 10,
			min: 0,
			value: 0,
			unit: "s",
		},
		{
			setting_name: "buzzer_frequency",
			display_name: "Buzzer frequency",
			type: "slider",
			max: 2048,
			min: 0,
			value: 0,
			unit: "Hz",
		},
		{
			setting_name: "buzzer_waveform",
			display_name: "Buzzer waveform",
			type: "selector",
			selector_item: BUZZER_WAVEFORM_OBJECT,
			value: 0,
		},
	]);

	function onSettingChange(settingName: string, value: number | number[]) {
		const newSetting = setting;
		const index = newSetting.findIndex(v => v.setting_name === settingName);
		newSetting[index].value = value;
		setSetting([...newSetting]);
	}

	async function onConnectButtonClick() {
		setLoading(true);
		if (await stopplate.scanAndConnectToStopplate() === false) {
			setTimeout(() => setLoading(false), 2000);
			setLoading(false);
			await delay(530);
			await updateSetting();
			return;
		}
		setTimeout(() => setLoading(false), 2000);
		await delay(530);
		await updateSetting();
		await delay(250);
		await updateSetting();
		setLoading(false);
	}

	async function updateSetting() {
		setLoading(true);
		const remoteSetting = await stopplate.getSettings();
		console.log(remoteSetting);
		setSetting([
			{...setting[0], value:remoteSetting.indicator_light_up_duration},
			{...setting[1], value:[remoteSetting.countdown_random_time_min, remoteSetting.countdown_random_time_max]},
			{...setting[2], value:remoteSetting.buzzer_duration},
			{...setting[3], value:remoteSetting.buzzer_frequency},
			{...setting[4], value:remoteSetting.buzzer_waveform},
		]);
		setLoading(false);
	}

	function onDisconnectButtonClick() {
		stopplate.disconnect();
	}

	function updateConnectionState() {
		const STATE = stopplate.checkConnectionState();
		setConnectState(STATE);
		console.log(`update stopplate connection state to ${STATE}`);
		return STATE;
	}

	async function onApplyButtonClick() {
		await stopplate.writeSetting(
			setting[0].value as number,
			(setting[1].value as number[])[0],
			(setting[1].value as number[])[1],
			setting[2].value as number,
			setting[3].value as number,
			setting[4].value as number,
		);
		props.onClose();
	}

	React.useEffect(() => {
		if (updateConnectionState()) {
			updateSetting();
		}
		const intervalId = setInterval(() => {
			updateConnectionState();
		}, 1000);
		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return (
		<>
			<Dialog {...props} fullWidth maxWidth="sm">
				<DialogTitle>Stopplate Settings</DialogTitle>
				<DialogContent>
					<Stack>
						{!connectState ?
							<Button fullWidth variant="contained" onClick={onConnectButtonClick}>Connect</Button> :
							<Button fullWidth variant="outlined" onClick={onDisconnectButtonClick}>Disconnect</Button>
						}
						{connectState ?
							setting.map((v, k) => {
								return <SettingItem
									key={k}
									display_name={v.display_name}
									setting_name={v.setting_name}
									type={v.type}
									onChange={onSettingChange}
									value={v.value}
									min={v.min}
									max={v.max}
									selector_item={v.selector_item}
								/>;
							}): <></>
						}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose} variant="contained" color="error" fullWidth>Cancel</Button>
					{connectState ?
						<Button type="submit" onClick={onApplyButtonClick} variant="contained" color="success" fullWidth>Apply</Button> : <></>
					}
				</DialogActions>
			</Dialog>
			<Backdrop
				sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1000000000 }}
				open={loading}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</>
	);
}
