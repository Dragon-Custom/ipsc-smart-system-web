import React from "react";
import { Delete, Edit } from "@mui/icons-material";
import { Button, Grid, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Stack, Typography, useTheme } from "@mui/material";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Division, Mutation, MutationDeleteShooterArgs, Query, QueryShooterArgs } from "@/gql/graphql";
import { useConfirm } from "material-ui-confirm";
import ShooterFormDialog from "./shooterFormDialog";


export interface ShooterCardProps {
	id: number;
	name: string;
	createDate: string;
	division: Division;
	showMutationButton?: boolean;
	email: string;
	onClick?: (id: number) => void;
}




const DeleteOneShooterMutation = gql`
	mutation($id: Int!){
		deleteShooter(id: $id) {
			id
		}
	}
`;


const DataQuery = gql`
	query Shooter($id: Int!) {
		shooter(id: $id) {
			id
			createAt
			name
			division
			email
			rankings {
				id
				shooterId
				rank
				updatedAt
				createAt
			}
			ratings {
				id
				shooterId
				rating
				updatedAt
				createAt
			}
			elo {
				id
				elo
				updatedAt
				createAt
			}
		}
	}
`;



export default function ShooterCard(props: ShooterCardProps) {
	const [ deleteShooter ] = useMutation<Mutation["deleteShooter"], MutationDeleteShooterArgs>(DeleteOneShooterMutation);
	const muiConfirm = useConfirm();
	const [editShooterFormOpen, setEditShooterFormOpen] = React.useState(false);
	const query = useQuery<Query,QueryShooterArgs>(DataQuery, {
		variables: {
			id: props.id,
		},
	});

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
			<Paper elevation={2} sx={{my:2, p:0}}>
				<Grid container gap={2} sx={{p:0}}>
					<Grid container item xs={12} sm sx={{p:0}}>
						<Button fullWidth sx={{ p: 1, color: "white", textAlign: "left" }} variant="outlined" color="warning" onClick={() => props?.onClick?.(props.id)}>
							<Grid container>
								<Grid item xs={12} sm={12} md={12/4} alignContent={"center"}>
									<Typography variant="h4">{props.name}</Typography>
									<Typography variant="caption" color={"GrayText"}>Division: {props.division}</Typography>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={3} sx={{p:1, color: theme.palette.info.main}}>
										<Typography variant="button">Rank: #{query.data?.shooter?.rankings?.[0]?.rank}</Typography>
									</Paper>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={3} sx={{p:1, color: theme.palette.secondary.main}}>
										<Typography variant="button">Rating: {query.data?.shooter?.ratings?.[0]?.rating.toFixed(1)}</Typography>
									</Paper>
								</Grid>
								<Grid item xs={12 / 3} md={12/4} alignContent={"center"}>
									<Paper elevation={3} sx={{p:1, color: theme.palette.success.main}}>
										<Typography variant="button">ELO: {query.data?.shooter?.elo?.[0]?.elo.toFixed(1)}</Typography>
									</Paper>
								</Grid>
							</Grid>
						</Button>
					</Grid>
					<Grid item xs={12} sm={2} md={8/4} alignContent={"center"} sx={{p:0}}>
						<Stack direction="row" justifyContent={"space-around"}>
							<Button fullWidth onClick={onEditButtonClick} color="inherit">
								<Edit/>
							</Button>
							<Button fullWidth onClick={onDeleteButtonClick} color="error">
								<Delete/>
							</Button>
						</Stack>
					</Grid>
				</Grid>
			</Paper>
			<ShooterFormDialog
				open={editShooterFormOpen}
				onClose={closeEditShooterFormOpen}
				editShooter={{
					...props,
				}}
			/>
		</>
	);
}