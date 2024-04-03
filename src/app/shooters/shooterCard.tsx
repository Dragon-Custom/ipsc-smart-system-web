import React from "react";
import { Delete } from "@mui/icons-material";
import { IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { Mutation, MutationDeleteOneShooterArgs } from "@/gql/graphql";
import { useConfirm } from "material-ui-confirm";


export interface ShooterCardProps {
	id: number;
	name: string;
	createDate: string;
	division: string;
	showMutationButton?: boolean
}




const DeleteOneShooterMutation = gql`
	mutation DeleteOneShooter($id: Int!){
		deleteOneShooter(where: {id: $id}) {
			id
		}
	}
`;

export default function ShooterCard(props: ShooterCardProps) {
	const [ deleteShooter ] = useMutation<Mutation["deleteOneShooter"], MutationDeleteOneShooterArgs>(DeleteOneShooterMutation);
	const muiConfirm = useConfirm();


	function onDeleteButtonClick() {
		muiConfirm({
			content: `Are you sure you want to delete ${props.name} from shooter list?`,
			title: "Confirm prompt",
			confirmationText: "Confirm",
			confirmationButtonProps: { color: "error" },
		}).then((v) => {
			deleteShooter({
				variables: {
					where: {
						id: props.id,
					},
				},
			});
		}).catch();
	}


	return (
		<Paper elevation={2}>
			<ListItem
				secondaryAction={
					<>
						{props.showMutationButton ?
							<IconButton edge="end" sx={{mx: 2}} onClick={onDeleteButtonClick}>
								<Delete />
							</IconButton>:
							<></>}
					</>
				}
				disablePadding
			>
				<ListItemButton sx={{px: 2}}>
					<ListItemAvatar>
						<Typography variant="caption">ID: {props.id}</Typography>
					</ListItemAvatar>
					<ListItemText
						primary={props.name}
						primaryTypographyProps={{ variant: "h5" }}
						secondary={
							<React.Fragment>
								<Typography
									sx={{ display: "inline" }}
									component="span"
									variant="body2"
								>
								Division: {props.division}
								</Typography>
								<Typography
									sx={{ display: "inline" }}
									component="span"
									variant="body2"
									color="InactiveCaptionText"
								>
									{" — "}create at: {props.createDate}
								</Typography>
							</React.Fragment>
						}
					/>
				</ListItemButton>
			</ListItem>
		</Paper>
	);
}