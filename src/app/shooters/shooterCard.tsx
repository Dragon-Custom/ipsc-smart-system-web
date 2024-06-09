import React from "react";
import { Delete, Edit } from "@mui/icons-material";
import { Button, ButtonGroup, Grid, Paper, Typography, useTheme } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { Division, Mutation, MutationDeleteShooterArgs, Team } from "@/gql/graphql";
import { useConfirm } from "material-ui-confirm";
import ShooterFormDialog from "./shooterFormDialog";

export interface ShooterCardProps {
	id: number;
	name: string;
	createDate: string;
	division: Division;
	showMutationButton?: boolean;
	email: string;
	elo: number;
	rank: number;
	rating: number;
	team: Team;
	onClick?: (id: number) => void;
}




const DeleteOneShooterMutation = gql`
	mutation($id: Int!){
		deleteShooter(id: $id) {
			id
		}
	}
`;

export default function ShooterCard(props: ShooterCardProps) {
	const [ deleteShooter ] = useMutation<Mutation["deleteShooter"], MutationDeleteShooterArgs>(DeleteOneShooterMutation);
	const muiConfirm = useConfirm();
	const [editShooterFormOpen, setEditShooterFormOpen] = React.useState(false);

	function onDeleteButtonClick() {
		muiConfirm({
			content: `Are you sure you want to delete ${props.name} from shooter list?`,
			title: "Confirm prompt",
			confirmationText: "Confirm",
			confirmationButtonProps: { color: "error" },
		}).then(() => {
			deleteShooter({
				variables: {
					id: props.id,
				},
			});
		}).catch();
	}

	function onEditButtonClick() {
		setEditShooterFormOpen(true);
	}

	function closeEditShooterFormOpen() {
		setEditShooterFormOpen(false);
	}

	const theme = useTheme();

	return (
		<>
			<Paper elevation={2} sx={{ my: 2, p: 0 }}>
				<Grid container gap={2} sx={{p:0}}>
					<Grid container item xs={12} sm sx={{p:0}}>
						<Button fullWidth sx={{ p: 1, color: "white", textAlign: "left" }} variant="outlined" color="primary" onClick={() => props?.onClick?.(props.id)}>
							<Grid container>
								{props.team && (
									<Grid item xs={12} alignContent={"center"}>
										<Paper sx={{px: 1, py: 0.5}}>
											<Typography variant="caption" color={"aqua"}>Team: {props.team?.name}</Typography>
										</Paper>
									</Grid>
								)}
								<Grid item xs={12} sm={12} md={12/4} alignContent={"center"}>
									<Typography variant="h4" color={"textPrimary"}>{props.name}</Typography>
									<Typography variant="caption" color={"GrayText"}>Division: {props.division}</Typography>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={4} sx={{p:1, color: theme.palette.info.main}}>
										<Typography variant="button">Rank: #{props.rank}</Typography>
									</Paper>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={6} sx={{p:1, color: theme.palette.secondary.main}}>
										<Typography variant="button">Rating: {props.rating.toFixed(1)}</Typography>
									</Paper>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={8} sx={{p:1, color: theme.palette.success.main}}>
										<Typography variant="button">ELO: {props.elo.toFixed(1)}</Typography>
									</Paper>
								</Grid>
							</Grid>
						</Button>
					</Grid>
					<Grid item xs={12} sm={2} md={8/4} alignContent={"center"} sx={{p:0}} >
						<Paper elevation={10} sx={{height: "100%"}}>
							<ButtonGroup variant="outlined" fullWidth sx={{height: "100%"}}>
								<Button fullWidth onClick={onEditButtonClick} color="secondary" variant="outlined">
									<Edit/>
								</Button>
								<Button fullWidth onClick={onDeleteButtonClick} color="error" variant="outlined">
									<Delete/>
								</Button>
							</ButtonGroup>
						</Paper>
					</Grid>
				</Grid>
			</Paper>
			<ShooterFormDialog
				open={editShooterFormOpen}
				onClose={closeEditShooterFormOpen}
				editShooter={{
					...props,
					teamId: props.team?.id,
				}}
			/>
		</>
	);
}