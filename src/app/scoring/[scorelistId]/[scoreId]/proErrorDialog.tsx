import { ProErrorObjects } from "@/gql/graphql";
import { Add, Remove } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import React from "react";


export interface ProErrorDialogProps {
	open: boolean;
	onClose: () => void;
	proErrors: ProErrorObjects[];
	value: ProErrorRecord[],
	onChange: (newVal: ProErrorRecord[]) => void;
}
export interface ProErrorRecord {
	id: number,
	count: number,
}
export default function ProErrorDialog(props: ProErrorDialogProps) {
	const [selectedNewProError, setSelectedNewProError] = React.useState(0);

	function add() {
		if (props.value.findIndex(t => t.id === selectedNewProError) > -1)
			return;
		props.onChange([...props.value, { id: selectedNewProError, count: 0 }]);
	}

	function increament(id: number, val?: number) {
		const newVal = [...props.value];
		const targetIndex = newVal.findIndex(t => t.id === id);
		newVal[targetIndex].count = Math.max(newVal[targetIndex].count + (val ?? 1), 0);
		props.onChange(newVal);
	}

	function decreament(id: number) {
		increament(id, -1);
	}

	return (
		<>
			<Dialog
				open={props.open}
				onClose={props.onClose}
				keepMounted
				fullWidth
				maxWidth="md"
			>
				<DialogTitle>Pro Error</DialogTitle>
				<DialogContent>
					<Stack gap={2}>
						<Paper sx={{ p: 2 }}>
							<Stack divider={<Divider/>}>
								{props.value.map(v => {
									const proError = props.proErrors.find(t => t.id == v.id);
									if (!proError)
										return;
									return <Grid container key={proError.index} alignItems={"center"}>
										<Grid item xs={9}>
											<Typography>{proError.title}</Typography>
										</Grid>
										<Grid item xs={1}>
											<IconButton sx={{width: "100%"}} onClick={() => decreament(v.id)}><Remove/></IconButton>
										</Grid>
										<Grid item xs={1}>
											<Typography alignContent={"center"} textAlign={"center"}>{v.count}</Typography>
										</Grid>
										<Grid item xs={1}>
											<IconButton sx={{width: "100%"}} onClick={() => increament(v.id)}><Add/></IconButton>
										</Grid>
									</Grid>;
								})}
							</Stack>
						</Paper>
						<Paper sx={{ p: 2 }}>
							<FormControl fullWidth>
								<InputLabel>Pro Error</InputLabel>
								<Select
									fullWidth
									label="Pro Error"
									value={selectedNewProError}
									onChange={e => setSelectedNewProError(parseInt(e.target.value as string))}
								>
									{props.proErrors.map(v => {
										if (props.value.findIndex(t => v.id === t.id) > -1)
											return;
										return <MenuItem value={v.id} key={v.index}>{v.title}</MenuItem>;
									})}
								</Select>
							</FormControl>
							<Typography variant="body1">
								{props.proErrors.find(v => v.id == selectedNewProError)?.description}
							</Typography>
							<Button fullWidth variant="contained" onClick={add}>Add</Button>
						</Paper>
					</Stack>
				</DialogContent>
				<DialogActions><Button onClick={props.onClose}>Apply</Button></DialogActions>
			</Dialog>
		</>
	);
}