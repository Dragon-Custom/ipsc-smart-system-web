import React from "react";
import { Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Mutation, MutationDeleteTeamArgs, Query, Team } from "@/gql/graphql";
import { Delete, Edit } from "@mui/icons-material";
import { useConfirm } from "material-ui-confirm";

export interface TeamsManageDialogProps {
	onClose: () => void;
	open: boolean;
}

const DataQuery = gql`
	query Teams {
		teams {
			id
			name
			createAt
			shooters {
				id
			}
		}
	}
`;

const DeleteTeamMutation = gql`
	mutation DeleteTeam($id: Int!) {
		deleteTeam(id: $id) {
			id
		}
	}
`;


function TeamCard(props: { team: Required<Team> }) {
	const confirm = useConfirm();
	const [ deleteTeam ] = useMutation<Mutation["deleteTeam"], MutationDeleteTeamArgs>(DeleteTeamMutation);

	function onDeleteTeamButtonClick() {
		confirm({
			title: "Are you sure?",
			description: "Do you want to delete this team?",
			confirmationButtonProps: { color: "error", variant: "contained" },
			cancellationButtonProps: { color: "primary" },
		}).then(() => {
			deleteTeam({ variables: { id: props.team.id } });
		}).finally();
	}
	return (
		<>
			<Paper sx={{ px: 0.5, py: 1 }} elevation={2}>
				<Grid container direction="row" columnGap={{xs: 0.5, sm:1, md:2}}>
					<Grid item xs={1} alignSelf="center">
						<Paper variant="outlined" sx={{ py: 0.5, textAlign: "center" }}>
							<Typography variant="caption" textAlign="center" color={"InactiveCaptionText"}>#{props.team.id}</Typography>
						</Paper>
					</Grid>
					<Grid item xs alignSelf="center">
						<Typography variant="h6">{props.team.name}</Typography>
					</Grid>
					<Grid xs={"auto"} alignSelf="center">
						<IconButton color="primary">
							<Edit/>
						</IconButton>
						<IconButton color="error" onClick={onDeleteTeamButtonClick}>
							<Delete/>
						</IconButton>
					</Grid>
				</Grid>
			</Paper>
		</>
	);
}


export default function TeamsManageDialog(props: TeamsManageDialogProps) {
	const query = useQuery<Query>(DataQuery);
	return (
		<Dialog
			onClose={props.onClose}
			open={props.open}
			PaperProps={{
				component: "form",
				// onSubmit: onCreateShooterFormSubmit,
			}}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>Teams manager</DialogTitle>
			<DialogContent>
				{!query.data ? <p>Loading...</p> :
					<>
						<Stack gap={1} divider={<Divider />}>
							{query.data.teams.map((team) => {
								if (!team)
									return null;
								return <TeamCard team={team as Required<Team>} key={team.id} />;
							})}
						</Stack>
					</>
				}
			</DialogContent>
		</Dialog>
	);
}