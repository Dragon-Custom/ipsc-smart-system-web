import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Division, Mutation, MutationCreateShooterArgs, MutationUpdateShooterArgs, Query } from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";


const DivisionArray: { label: string; value: string }[] = [];
for (const key in Division) {
	if (Object.prototype.hasOwnProperty.call(Division, key)) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		DivisionArray.push({ label: key, value: Division[key] });
	}
}

const CreateOneShooterMutation = gql`
	mutation($shooter: CreateShooterShooterInput!) {
		createShooter(shooter: $shooter) {
			id
		}
	}
`;

const UpdateOneShooterMutation = gql`
	mutation($id: Int!, $shooter: UpdateShooterShooterInput!) {
		updateShooter(id: $id, shooter: $shooter) {
			id
		}
	}
`;

export interface ShooterFormDialogProps {
    onClose: () => void;
	open: boolean;
	//if editShooter not null the create mode will be change to edit mode
	editShooter?: {
		id: number,
		name: string,
		division: Division,
		email: string,
		teamId: number,
	};
}

const DataQuery = gql`
	query Teams {
		teams {
			id
			name
			createAt
		}
	}
`;

export default function ShooterFormDialog(props: ShooterFormDialogProps) {
	const [createShooter] = useMutation<Mutation["createShooter"], MutationCreateShooterArgs>(CreateOneShooterMutation);
	const [updateShooter] = useMutation<Mutation["updateShooter"], MutationUpdateShooterArgs>(UpdateOneShooterMutation);
	const query = useQuery<Query>(DataQuery);

	function onCreateShooterFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData).entries());
		console.log(formJson);
		if (props.editShooter) {
			updateShooter({
				variables: {
					id: props.editShooter.id,
					shooter: {
						division: formJson.division as Division,
						email: formJson.email as string,
						name: formJson.name as string,
						teamId: parseInt(formJson.teamId as string),
					},
				},
			})
				.then(props.onClose)
				.catch((e) => {
					alert("Fail to update shooter");
					alert("Error log: " + JSON.stringify(e));
				});
		} else {
			createShooter({
				variables: {
					shooter: {
						division: formJson.division as Division,
						email: formJson.email as string,
						name: formJson.name as string,
						teamId: parseInt(formJson.teamId as string),
					},
				},
			})
				.then(props.onClose)
				.catch((e) => {
					alert("Fail to create shooter");
					alert("Error log: " + JSON.stringify(e));
				});
		}
	}


	return (
		<Dialog
			onClose={props.onClose}
			open={props.open}
			PaperProps={{
				component: "form",
				onSubmit: onCreateShooterFormSubmit,
			}}
		>
			<DialogTitle>{props.editShooter ? "Edit shooter" : "Create new shooter"}</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					required
					margin="normal"
					name="name"
					label="Name"
					type="text"
					fullWidth
					variant="outlined"
					defaultValue={props.editShooter?.name}
				/>
				<TextField
					autoFocus
					required
					margin="normal"
					name="email"
					label="Email"
					type="text"
					fullWidth
					variant="outlined"
					defaultValue={props.editShooter?.email}
				/>
				<FormControl fullWidth margin="normal">
					<InputLabel>Division</InputLabel>
					<Select
						name="division"
						label="Division"
						required
						fullWidth
						defaultValue={props.editShooter ? props.editShooter.division : DivisionArray[0].value}
					>
						{DivisionArray.map((v, k) => (
							<MenuItem value={v.value} key={k}>{v.label}</MenuItem>
						))}
					</Select>
				</FormControl>
				{query.data?.teams && (
					<FormControl fullWidth margin="normal">
						<InputLabel>Team</InputLabel>
						<Select
							name="teamId"
							label="Team"
							fullWidth
							defaultValue={props.editShooter ? props.editShooter.teamId : null}
						>
							<MenuItem value={undefined}>None</MenuItem>
							{query.data.teams.map((v, k) => {
								if (!v)
									return null;
								return <MenuItem value={v.id} key={k}>{v.name}</MenuItem>;
							})}
						</Select>
					</FormControl>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>Cancel</Button>
				{props.editShooter ?
					<Button type="submit">Edit</Button>:
					<Button type="submit">Create</Button>
				}
			</DialogActions>
		</Dialog>
	);
}