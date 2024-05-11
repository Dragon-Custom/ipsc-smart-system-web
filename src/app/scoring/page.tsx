"use client";
import { Mutation, MutationCreateScoreboardArgs, MutationDeleteScoreboardArgs, MutationUpdateScoreboardArgs, Query } from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Grid, IconButton, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import React from "react";
import CreateScorelistDialog from "./createScorelistDialog";
import ScorelistCard from "./scorelistCard";


const FetchDataQuery = gql`
	query Scoreboards {
		scoreboards {
			id
			createAt
			lastUpdate
			name
			scorelists {
				id
				createAt
				lastUpdate
				stageId
				scoreboardId
				rounds
				stage {
					name
					image {
						id
					}
				}
				scores {
					id
				}
			}
		}
	}
`;

const UpdateScoreboardMutation = gql`
	mutation UpdateScoreboard($id: Int!, $name: String!){
		updateScoreboard(id: $id, name: $name) {
			id
			createAt
			lastUpdate
			name
		}
	}
`;

const CreateScoreboardMutation = gql`
	mutation CreateScoreboard($name: String!){
		createScoreboard(name: $name) {
			id
			createAt
			lastUpdate
			name
		}
	}
`;

const DeleteScoreboardMutation = gql`
	mutation DeleteScoreboard($id: Int!){
		deleteScoreboard(id: $id) {
			id
		}
	}
`;

const ScoreboardChangedSubscription = gql`
	subscription {
		scoreboardsChange
	}
`;

const ScorelistChangedSubscription = gql`
	subscription {
		scorelistsChange
	}
`;

export default function Scoring() {
	const query = useQuery<Query>(FetchDataQuery);
	const [ createScoreboard ] = useMutation<Mutation["createScoreboard"], MutationCreateScoreboardArgs>(CreateScoreboardMutation);
	const [ updateScoreboard ] = useMutation<Mutation["updateScoreboard"], MutationUpdateScoreboardArgs>(UpdateScoreboardMutation);
	const [ deleteScoreboard ] = useMutation<Mutation["deleteScoreboard"], MutationDeleteScoreboardArgs>(DeleteScoreboardMutation);
	const muiConfirm = useConfirm();

	useSubscription(ScoreboardChangedSubscription, {
		onData() {
			query.refetch();
		},
	});
	useSubscription(ScorelistChangedSubscription, {
		onData() {
			query.refetch();
		},
	});

	const [selectedScoreBoard, setSelectedScoreBoard] = React.useState(0);
	function onScoreboardTabChange(e: unknown, v: number) {
		setSelectedScoreBoard(v);
	}

	function onCreateScoreboardButtonClick() {
		const name = prompt("Scoreboard name:");
		if (!name)
			return;
		createScoreboard({
			variables: {
				name,
			},
		});
	}

	function onDeleteButtonClick() {
		muiConfirm({
			title: `Are you sure you want to delete scoreboard (${query.data?.scoreboards?.find(v => v?.id == selectedScoreBoard)?.name})`,
			content: "This will also DELETE ALL OF THE SCORE inside of this scoreboard",
			confirmationText: "Delete",
			confirmationButtonProps: {
				color: "error",
			},
		})
			.then(() => {
				deleteScoreboard({
					variables: {
						id: selectedScoreBoard,
					},
				});
				setSelectedScoreBoard(0);
			}).catch();
	}
	function onEditButtonClick() {
		const name = prompt("Scoreboard name:");
		if (!name)
			return;
		updateScoreboard({
			variables: {
				name,
				id: selectedScoreBoard,
			},
		});
	}
	const [createScorelistDialogOpen, setCreateScorelistDialogOpen] = React.useState(false);

	function closeCreateScorelistDialog() {
		setCreateScorelistDialogOpen(false);
	}
	function openCreateScorelistDialog() {
		setCreateScorelistDialogOpen(true);
	}

	return (
		<>
			<Paper elevation={5} >
				<Paper elevation={2}>
					<Stack direction={"row"} justifyContent={"space-between"}>
						<Typography variant="h5" p={2}>Scoreboard: {query.data?.scoreboards?.find(v=>v?.id==selectedScoreBoard)?.name ?? "All"}</Typography>
						{selectedScoreBoard == 0 ? <></> :
							<Paper elevation={10} sx={{mr:2, alignSelf: "center"}}>
								<IconButton color="primary" onClick={onEditButtonClick}>
									<Edit />
								</IconButton>
								<IconButton color="error" onClick={onDeleteButtonClick}>
									<Delete />
								</IconButton>
							</Paper>
						}
					</Stack>
				</Paper>
				<Grid container>
					<Grid item xs={4} md={2}>
						<Tabs
							value={selectedScoreBoard}
							orientation="vertical"
							sx={{borderRight: 1, borderColor: "divider",  width:"100%"}}
							onChange={onScoreboardTabChange}
						>
							<Tab label="Scoreboard list" disabled value={-1} sx={{backgroundColor: (theme) => theme.palette.background.paper}} />
							<Tab label="All" value={0} />
							{query.data ? 
								query.data.scoreboards?.map(v => {
									return <Tab
										key={v?.id}
										value={v?.id}
										label={v?.name}
									/>;
								})
								:<Tab label="Loading..." />}
						</Tabs>
					</Grid>
					<Grid item xs={8} md={10}>
						<Paper elevation={5} sx={{ p: 2 }}>
							{query.data ? 
								query.data.scoreboards?.map(scoreboard => {
									return scoreboard?.scorelists?.map(scorelist => {
										if (scoreboard.id !== selectedScoreBoard && selectedScoreBoard !== 0) 
											return;
										return (
											<>
												<ScorelistCard
													key={scorelist.id}
													imageId={scorelist.stage?.image.id ?? ""}
													scorelistName={`${new Date(scorelist.createAt).toLocaleDateString()} ${scorelist.stage?.name}`}
													scoreCount={(scorelist?.scores ?? []).length}
													scorelistId={scorelist.id}
												/>
											</>
										);
									});
								})
								:<Typography>Loading...</Typography>}
						</Paper>	
					</Grid>
				</Grid>
			</Paper>
			<SpeedDial
				ariaLabel="Scoreboard operation"
				sx={{ position: "fixed", bottom: 20, right: 20 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create scoreboard"}
					tooltipOpen
					onClick={onCreateScoreboardButtonClick}
				/>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create scorelist"}
					tooltipOpen
					onClick={openCreateScorelistDialog}
				/>
			</SpeedDial>
			<CreateScorelistDialog
				open={createScorelistDialogOpen}
				onClose={closeCreateScorelistDialog}
			/>
		</>
	);
}