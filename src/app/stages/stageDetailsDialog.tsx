"use client";
import { Mutation, Query, QueryStageArgs } from "@/gql/graphql";
import useGraphqlImage from "@/hooks/useGraphqlImage";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import React from "react";
import StageFormDialog from "./stageFormDialog";

const StageQuery = gql`
    query ($id: Int!){
        stage(id: $id) {
			id
			createAt
			name
			description
			papers
			poppers
			noshoots
			gunCondition
			designerId
			walkthroughTime
			minRounds
			maxScore
			stageType
			designer {
				id
				name
			}
			tags {
				tag {
					id
					title
					color
				}
			}
			image {
				id
			}
		}
    }
`;
const DeleteStageMutation = gql`
    mutation($id: Int!) {
		deleteStage(id: $id) {
			id
		}
	}
`;

export interface StageDetialsDialogProps {
    open: boolean;
    onClose: () => void;
    stageId: number;
}
export default function StageDetialsDialog(props: StageDetialsDialogProps) {
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	function onEditDialogClose() {
		setEditDialogOpen(false);
	}
	function onEditButtonClick() {
		setEditDialogOpen(true);
	}


	const query = useQuery<Query, QueryStageArgs>(StageQuery, {
		variables: {
			id: props.stageId,
		},
	});
	const image = useGraphqlImage(query.data?.stage?.image.id ?? "");
	const confirm = useConfirm();
	const [ deleteStage ] = useMutation<Mutation>(DeleteStageMutation);

	function onDeleteButtonClick() {
		confirm({
			title: `Are you sure you want to delete the stage ${query.data?.stage?.name} ?`,
			confirmationText: "Delete",
			confirmationButtonProps: {
				color: "error",
			},
		})
			.then(() => {
				deleteStage({
					variables: {
						id: props.stageId,
					},
				});
			})
			.catch();
	}
	if (!query.data?.stage) {
		return <>Loading...</>;
	}

	return (
		<>
			<StageFormDialog
				open={editDialogOpen}
				onClose={onEditDialogClose}
				editStage={{
					id: props.stageId,
					description: query.data.stage.description ?? undefined,
					designerId: query.data.stage.designer.id,
					gunCondition: query.data.stage.gunCondition,
					imageId: query.data.stage.image.id,
					name: query.data.stage.name,
					noshoots: query.data.stage.noshoots,
					papers: query.data.stage.papers,
					poppers: query.data.stage.poppers,
					walkthroughTime: query.data.stage.walkthroughTime,
					tags: query.data.stage.tags ? query.data.stage.tags.map(v=> v?.tag?.id ?? 0) : [],
				}}
			/>
			<Dialog
				maxWidth="md"
				fullWidth
				onClose={props.onClose}
				open={props.open}
			>
				{!query.data?.stage ? <>Loading...</> :
					<>
						<DialogTitle>{query.data?.stage.name}</DialogTitle>
						<DialogContent>
							<img src={image} width={"100%"}/>
							<Typography variant="h3">{query.data?.stage.name}</Typography>
							<Typography variant="h6">Designed by: {query.data?.stage.designer.name}</Typography>
							<Divider />
							<Typography variant="overline">{query.data?.stage.description}</Typography>
							<Typography variant="body2">create at:{new Date(query.data?.stage.createAt).toLocaleDateString()}</Typography>
							<Typography variant="body2">Condition {query.data?.stage.gunCondition}</Typography>
							<Divider />
							<Typography variant="body2">Papers: {query.data?.stage.papers}</Typography>
							<Typography variant="body2">No-shoots: {query.data?.stage.noshoots}</Typography>
							<Typography variant="body2">Popper: {query.data?.stage.poppers}</Typography>
							<Divider />
							<Typography variant="body2">Max score: {query.data?.stage.maxScore}</Typography>
							<Typography variant="body2">Min rounds: {query.data?.stage.minRounds}</Typography>
							<Typography variant="body2">Stage type: {query.data?.stage.stageType}</Typography>
							<Typography variant="body2">Walkthrough time: {query.data?.stage.walkthroughTime} minutes</Typography>
						</DialogContent>
					</>
				}
				<DialogActions>
					<Button color="error" variant="contained" onClick={onDeleteButtonClick}>Delete</Button>
					<Button variant="outlined" onClick={onEditButtonClick}>Edit</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}