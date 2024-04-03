"use client";
import React from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Division, Mutation, MutationCreateOneShooterArgs, Query } from "@/gql/graphql";
// import { AgGridReact } from "ag-grid-react";
import ShooterCard from "./shooterCard";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, List, Menu, MenuItem, Select, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

const FindManyShooterQuery = gql`
	query FindManyShooter{
		findManyShooter {
			division
			id
			createAt
			name
		}
	}
`;
const CreateOneShooterMutation = gql`
	mutation CreateOneShooter($data: ShooterCreateInput!) {
		createOneShooter(data: $data) {
			id
		}
	}
`;

const DivisionArray: { label: string; value: string }[] = [];
for (const key in Division) {
	if (Object.prototype.hasOwnProperty.call(Division, key)) {
		DivisionArray.push({ label: key, value: Division[key] });
	}
}

export default function Shooters() {
	const { data } = useQuery<Query>(FindManyShooterQuery);
	const [ createShooter ] = useMutation<Mutation["createOneShooter"], MutationCreateOneShooterArgs>(CreateOneShooterMutation);
	const [createShooterFormOpen, setCreateShooterFormOpen] = React.useState(false);

	function onCreateShooterButtonClick() {
		setCreateShooterFormOpen(true);
	}

	function onCreateShooterFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData).entries());
		console.log(formJson);
		createShooter({
			variables: {
				data: {
					name: formJson.name as string,
					division: formJson.division as Division,
				},
			},
		})
			.then(closeCreateShooterForm)
			.catch((e) => {
				alert("Fail to create shooter");
				alert("Error log: " + JSON.stringify(e));
			});
	}

	function closeCreateShooterForm() {
		setCreateShooterFormOpen(false);
	}

	return (
		<>
			<Typography variant="h4" p={2}>Shooter list: </Typography>
			<List>
				{data?.findManyShooter.map((v, k) => (
					<ShooterCard
						key={k}
						createDate={new Date(v.createAt).toLocaleDateString()}
						division={v.division}
						name={v.name}
						id={v.id}
						showMutationButton
					/>
				))}
			</List>
			<SpeedDial
				ariaLabel="Shooters operation"
				sx={{ position: "absolute", bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create shooter"}
					tooltipOpen
					onClick={onCreateShooterButtonClick}
				/>
			</SpeedDial>
			<Dialog
				onClose={closeCreateShooterForm}
				open={createShooterFormOpen}
				PaperProps={{
					component: "form",
					onSubmit: onCreateShooterFormSubmit,
				}}
			>
				<DialogTitle>Create new shooter</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						required
						margin="dense"
						name="name"
						label="Name"
						type="text"
						fullWidth
						variant="outlined"
					/>
					<FormControl fullWidth>
						<InputLabel>Division</InputLabel>
						<Select
							name="division"
							label="Division"
							required
							fullWidth
							defaultValue={DivisionArray[0].value}
						>
							{DivisionArray.map((v, k) => (
								<MenuItem value={v.value} key={k}>{v.label}</MenuItem>
							))}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button >Cancel</Button>
					<Button type="submit">Create</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
