import { Mutation, MutationCreateOneStageTagArgs, MutationUpdateOneStageTagArgs } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import React from "react";



const CreateOneStageTagMutation = gql`
	mutation($data: StageTagCreateInput!) {
		createOneStageTag(data:$data) {
			id
		}
}
`;
const UpdateOneStageTagMutation = gql`
	mutation($data: StageTagUpdateInput!, $where: StageTagWhereUniqueInput!) {
		updateOneStageTag(data: $data, where: $where) {
			id
		}
	}
`;

interface FormData {
	title: string,
	color: string,
}

export interface StageTagFormDialogProps {
	onClose: () => void;
	open: boolean;
	editTag?: {
		id: number;
		title: string;
		color: string;
	}
}
export default function StageTagFormDialog(props: StageTagFormDialogProps) {
	const [createTag] = useMutation<Mutation["createOneStageTag"], MutationCreateOneStageTagArgs>(CreateOneStageTagMutation);
	const [updateTag] = useMutation<Mutation["updateOneStageTag"], MutationUpdateOneStageTagArgs>(UpdateOneStageTagMutation);
	const [color, setColor] = React.useState("rgb(0,0,0)");

	React.useEffect(() => {
		setColor(props.editTag?.color ?? "rgb(0,0,0)");
	}, [props]);

	const handleChange = (newValue: string) => {
		setColor(newValue);
	};
	return (
		<>
			<Dialog
				open={props.open}
				onClose={props.onClose}
				maxWidth={"xs"}
				fullWidth
				PaperProps={{
					component: "form",
					onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
						event.preventDefault();
						const formData = new FormData(event.currentTarget);
						const formJson: FormData = Object.fromEntries((formData).entries()) as unknown as FormData;

						if (props.editTag) {
							await updateTag({
								variables: {
									data: {
										color: {
											set: formJson.color,
										},
										title: {
											set: formJson.title,
										},
									},
									where: {
										id: props.editTag.id,
									},
								},
							});
						} else {
							await createTag({
								variables: {
									data: {
										color: formJson.color,
										title: formJson.title,
									},
								},
							});
						}
						props.onClose();
					},
				}}
			>
				{props.editTag?
					<DialogTitle>Edit tag</DialogTitle> :
					<DialogTitle>Create a new tag</DialogTitle>
				}
				<DialogContent>
					<TextField
						autoFocus
						required
						margin="dense"
						name="title"
						label="Title"
						type="text"
						fullWidth
						variant="outlined"
						defaultValue={props.editTag?.title}
					/>
					<MuiColorInput
						required
						name="color"
						label="Color"
						fullWidth
						margin="dense"
						variant="filled"
						format="rgb"
						value={color}
						onChange={handleChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					{props.editTag?
						<Button type="submit">Edit</Button> :
						<Button type="submit">Create</Button>
					}
				</DialogActions>
			</Dialog>
		</>
	);
}