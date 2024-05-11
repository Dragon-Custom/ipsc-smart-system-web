import { Mutation, MutationCreateStageTagArgs, MutationUpdateStageTagArgs } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import React from "react";



const CreateStageTagMutation = gql`
	mutation CreateStageTag($stageTag: CreateStageTagInput!) {
		createStageTag(stageTag: $stageTag) {
			id
			title
			color
		}
	}
`;
const UpdateStageTagMutation = gql`
	mutation UpdateStageTag($id: Int!, $stageTag: UpdateStageTagInput!) {
		updateStageTag(id: $id, stageTag: $stageTag) {
			id
			title
			color
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
	const [ createTag ] = useMutation<Mutation["createStageTag"], MutationCreateStageTagArgs>(CreateStageTagMutation);
	const [ updateTag ] = useMutation<Mutation["updateStageTag"], MutationUpdateStageTagArgs>(UpdateStageTagMutation);
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
									id: props.editTag.id,
									stageTag: {
										color: formJson.color,
										title: formJson.title,
									},
								},
							});
						} else {
							await createTag({
								variables: {
									stageTag: {
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