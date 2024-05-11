import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Mutation, MutationCreateScorelistArgs, Query } from "@/gql/graphql";
import StageCard from "../stages/stageCard";

const FetchDataQuery = gql`
	query {
		stages {
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
			image {
				id
			}
			designer {
				name
			}
			tags {
				id
				tag {
					id
					title
					color
				}
			}
		}
		scoreboards {
			id
			createAt
			lastUpdate
			name
		}
	}
`;
const CreateScorelistMutation = gql`
	mutation ($scorelist: CreateScorelistInput!){
		createScorelist(scorelist: $scorelist) {
			id
		}
	}
`;

export interface CreateScorelistDialogProps {
	open: boolean;
	onClose?: () => void;
}

export default function CreateScorelistDialog(props: CreateScorelistDialogProps) {
	const query = useQuery<Query>(FetchDataQuery);
	const [createScorelist] = useMutation<Mutation["createScorelist"], MutationCreateScorelistArgs>(CreateScorelistMutation);

	async function onCreateScorelistSubmit (event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData).entries()) as unknown as { stageId: string, scoreboardId: string };
		await createScorelist({
			variables: {
				scorelist: {
					scoreboardId: parseInt(formJson.scoreboardId),
					stageId: parseInt(formJson.stageId),
				},
			},
		});
		props.onClose?.();
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
								{query.data ? 
									query.data.scoreboards?.map(v => {
										if (!v) return <></>;
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
								{query.data ? 
									query.data.stages?.map(v => {
										if (!v) return <></>;
										return <MenuItem key={v.id} value={v.id}>
											<StageCard
												createAt={v.createAt}
												description={v.description ?? ""}
												designerName={v.designer.name}
												gunConditon={v.gunCondition}
												id={v.id}
												imageId={v.image.id}
												name={v.name}
												stageType={v.stageType}
												tags={v.tags?.map(v => v?.tag)}
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