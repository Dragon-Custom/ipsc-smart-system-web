import { BUZZER_WAVEFORM_OBJECT } from "@/buzzer";
import {
	Button,
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
												step={0.1}
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
												step={0.1}
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
export default function StopplateSettngDialog(props: DialogProps) {

	const [setting, setSetting] = React.useState<SettingItem[]>([
		{
			setting_name: "stopplate_indicator_light_duration",
			display_name: "Stopplate indicator light up duration",
			type: "slider",
			max: 10,
			min: 0,
			value: 0,
			unit: "s",
		},
		{
			setting_name: "timer_count_down_range",
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
			max: 10,
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

	return (
		<>
			<Dialog {...props} fullWidth maxWidth="sm">
				<DialogTitle>Stopplate Settings</DialogTitle>
				<DialogContent>
					<Stack>
						<Button fullWidth variant="outlined">Connect</Button>
						{setting.map((v, k) => {
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
						})}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose} variant="contained" color="error" fullWidth>Cancel</Button>
					<Button type="submit" onClick={props.onClose} variant="contained" color="success" fullWidth>Apply</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
