import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Division, Mutation, MutationCreateOneShooterArgs, MutationUpdateOneShooterArgs } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";


const DivisionArray: { label: string; value: string }[] = [];
for (const key in Division) {
	if (Object.prototype.hasOwnProperty.call(Division, key)) {
		DivisionArray.push({ label: key, value: Division[key] });
	}
}

const CreateOneShooterMutation = gql`
	mutation CreateOneShooter($data: ShooterCreateInput!) {
		createOneShooter(data: $data) {
			id
		}
	}
`;

const UpdateOneShooterMutation = gql`
	mutation UpdateOneShooter($data: ShooterUpdateInput!, $where: ShooterWhereUniqueInput!) {
		updateOneShooter(data: $data, where: $where) {
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
	};
}
export default function ShooterFormDialog(props: ShooterFormDialogProps) {
	const [createShooter] = useMutation<Mutation["createOneShooter"], MutationCreateOneShooterArgs>(CreateOneShooterMutation);
	const [updateShooter] = useMutation<Mutation["updateOneShooter"], MutationUpdateOneShooterArgs>(UpdateOneShooterMutation);

	function onCreateShooterFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData).entries());
		console.log(formJson);
		if (props.editShooter) {
			updateShooter({
				variables: {
					data: {
						name: {
							set: formJson.name as string,
						},
						division: {
							set: formJson.division as Division,
						},
					},
					where: {
						id: props.editShooter.id,
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
					data: {
						name: formJson.name as string,
						division: formJson.division as Division,
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
					margin="dense"
					name="name"
					label="Name"
					type="text"
					fullWidth
					variant="outlined"
					defaultValue={props.editShooter?.name}
				/>
				<FormControl fullWidth>
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