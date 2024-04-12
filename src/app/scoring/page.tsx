"use client";
import { Mutation, MutationCreateOneScoreboardArgs, MutationDeleteOneScoreboardArgs, MutationUpdateOneScoreboardArgs, Query } from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Grid, IconButton, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import React from "react";
import CreateScorelistDialog from "./createScorelistDialog";
import ScorelistCard from "./scorelistCard";



const FetchDataQuery = gql`
	query {
		findManyScoreboard {
			id
			lastUpdate
			name
			createAt
			scorelists {
				id
				createAt
				stage {
					name
					imageId
				}
				_count {
                	scores
            	}
			}
		}
	}
`;
const CreateOneScoreboardMutation = gql`
	mutation($data: ScoreboardCreateInput!) {
		createOneScoreboard(data: $data){
			id
		}
	}
`;
const UpdateOneScoreboardMutation = gql`
	mutation($data: ScoreboardUpdateInput!, $where: ScoreboardWhereUniqueInput!) {
		updateOneScoreboard(data: $data, where: $where){
			id
		}
	}
`;
const DeleteOneScoreboardMutation = gql`
	mutation($where: ScoreboardWhereUniqueInput!) {
		deleteOneScoreboard(where: $where){
			id
		}
	}
`;
const SubscriptScoreboardsChangeSubscription= gql`
	subscription {
		subscriptScoreboardsChange
	}
`;
const SubscriptScorelistChangeSubscription= gql`
	subscription {
		subscriptScorelistChange
	}
`;

export default function Scoring() {
	const scoreboard = useQuery<Query>(FetchDataQuery);
	const [ createScoreboard ] = useMutation<Mutation["createOneScoreboard"], MutationCreateOneScoreboardArgs>(CreateOneScoreboardMutation);
	const [ updateScoreboard ] = useMutation<Mutation["updateOneScoreboard"], MutationUpdateOneScoreboardArgs>(UpdateOneScoreboardMutation);
	const [ deleteScoreboard ] = useMutation<Mutation["deleteOneScoreboard"], MutationDeleteOneScoreboardArgs>(DeleteOneScoreboardMutation);
	useSubscription(SubscriptScoreboardsChangeSubscription, {
		onData() {
			scoreboard.refetch();
		},
	});
	useSubscription(SubscriptScorelistChangeSubscription, {
		onData() {
			scoreboard.refetch();
		},
	});
	const muiConfirm = useConfirm();

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
				data: {
					name,
				},
			},
		});
	}

	function onDeleteButtonClick() {
		muiConfirm({
			title: `Are you sure you want to delete scoreboard (${scoreboard.data?.findManyScoreboard.find(v => v.id == selectedScoreBoard)?.name})`,
			content: "This will also DELETE ALL OF THE SCORE inside of this scoreboard",
			confirmationText: "Delete",
			confirmationButtonProps: {
				color: "error",
			},
		})
			.then(() => {
				deleteScoreboard({
					variables: {
						where: {
							id: selectedScoreBoard,
						},
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
				data: {
					name: {
						set: name,
					},
				},
				where: {
					id: selectedScoreBoard,
				},
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
						<Typography variant="h5" p={2}>Scoreboard: {scoreboard.data?.findManyScoreboard.find(v=>v.id==selectedScoreBoard)?.name ?? "All"}</Typography>
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
							{scoreboard.data ? 
								scoreboard.data.findManyScoreboard.map(v => {
									return <Tab
										key={v.id}
										value={v.id}
										label={v.name}
									/>;
								})
								:<Tab label="Loading..." />}
						</Tabs>
					</Grid>
					<Grid item xs={8} md={10}>
						<Paper elevation={5} sx={{ p: 2 }}>
							{scoreboard.data ? 
								scoreboard.data.findManyScoreboard.map(scoreboard => {
									return scoreboard.scorelists.map(scorelist => {
										if (scoreboard.id !== selectedScoreBoard && selectedScoreBoard !== 0) 
											return;
										return (
											<>
												<ScorelistCard
													key={scorelist.id}
													imageId={scorelist.stage?.imageId ?? ""}
													scorelistName={`${new Date(scorelist.createAt).toLocaleDateString()} ${scorelist.stage?.name}`}
													scoreCount={scorelist._count.scores}
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