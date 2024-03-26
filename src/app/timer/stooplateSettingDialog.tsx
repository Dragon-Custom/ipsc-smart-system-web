import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
	Grid,
	Input,
	Paper,
	Slider,
	Stack,
	Typography,
} from "@mui/material";
import React from "react";

interface SettingItemProps extends SettingItem {
    //when slider or numeric input the value will be the value of component
    //when selector the value will be the index of the selected item
    onChange: (setting_name: string, value: number) => unknown;
}
function SettingItem(props: SettingItemProps) {

	function onChange(v: string | number) {
		props.onChange(props.setting_name, parseFloat(v as string));
	}

	return (
		<>
			<Paper elevation={5} sx={{ p: 2 }}>
				<Stack>
					<Typography align="center">{props.display_name}</Typography>
					{(() => {
						switch (props.type) {
						case "selector":
							return <>dwa</>;
							break;
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
												inputMode="decimal"
											/>
										</Grid>
									</Grid>
								</>
							);
							break;
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
    type: "slider" | "selector"
    max?: number;
    min?: number;
	selector_item?: string[];
    value: number;
}
export default function StopplateSettngDialog(props: DialogProps) {

	const [setting, setSetting] = React.useState<SettingItem[]>([
		{
			setting_name: "setting",
			display_name: "display",
			type: "slider",
			max: 10,
			min: 0,
			value: 0,
		},
	]);

	function onSettingChange(settingName: string, value: number) {
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
							/>;
						})}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button type="submit">Subscribe</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
