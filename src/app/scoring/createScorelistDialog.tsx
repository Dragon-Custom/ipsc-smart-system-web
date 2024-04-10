import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Mutation, MutationCreateOneScorelistArgs, Query } from "@/gql/graphql";
import StageCard from "../stages/stageCard";

const FindManyStageQuery = gql`
	query{
		findManyStage {
			id
			name
			designer {
				name
			}
			description
			gunCondition
			imageId
			stageType
			createAt
			tags {
                id
                tag{
                    color
                    id
                    title
                }
            }
		}
	}
`;

const FindManyScoreboardQuery = gql`
	query {
		findManyScoreboard {
			id
			lastUpdate
			name
			createAt
		}
	}
`;

const CreateOneScorelistMutation = gql`
	mutation ($data: ScorelistCreateInput!){
		createOneScorelist(data: $data) {
			id
		}
}
`;

export interface CreateScorelistDialogProps {
	open: boolean;
	onClose?: () => void;
}

export default function CreateScorelistDialog(props: CreateScorelistDialogProps) {
	const allStage = useQuery<Query>(FindManyStageQuery);
	const allScoreboard = useQuery<Query>(FindManyScoreboardQuery);
	const [createScorelist] = useMutation<Mutation["createOneScorelist"], MutationCreateOneScorelistArgs>(CreateOneScorelistMutation);

	async function onCreateScorelistSubmit (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData).entries()) as unknown as { stageId: string, scoreboardId: string };
		createScorelist({
			variables: {
				data: {
					stage: {
						connect: {
							id: parseInt(formJson.stageId),
						},
					},
					scoreboard: {
						connect: {
							id: parseInt(formJson.scoreboardId),
						},
					},
				},
			},
		});
	}
	
	return (
		<>
			<Dialog
				open={props.open}
				onClose={props.onClose}
				maxWidth="md"
				fullWidth
				PaperProps={{
					component: "form",
					onSubmit: onCreateScorelistSubmit,
				}}
			>
				<DialogTitle>Select the stage</DialogTitle>
				<DialogContent>
					<Stack gap={2}>
						<FormControl fullWidth sx={{mt:1}}>
							<InputLabel>Select the scoreboard</InputLabel>
							<Select
								label={"Select the scoreboard"}
								name="scoreboardId"
								required
							>
								{allScoreboard.data ? 
									allScoreboard.data.findManyScoreboard.map(v => {
										return <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>;
									})
									: <></>}
							</Select>
						</FormControl>
						<FormControl fullWidth>
							<InputLabel>Select the stage</InputLabel>
							<Select
								label={"Select the stage"}
								name="stageId"
								required
							>
								{allStage.data ? 
									allStage.data.findManyStage.map(v => {
										return <MenuItem key={v.id} value={v.id}>
											<StageCard
												createAt={v.createAt}
												description={v.description ?? ""}
												designerName={v.designer.name}
												gunConditon={v.gunCondition}
												id={v.id}
												imageId={v.imageId}
												name={v.name}
												stageType={v.stageType}
												tags={v.tags.map(v => v.tag)}
												disableOnClick
											/>
										</MenuItem>;
									})
									: <></>}
							</Select>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button type="submit">Create</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}