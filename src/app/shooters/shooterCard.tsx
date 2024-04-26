import React from "react";
import { Delete, Edit } from "@mui/icons-material";
import { IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { Division, Mutation, MutationDeleteOneShooterArgs } from "@/gql/graphql";
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
	mutation DeleteOneShooter($where: ShooterWhereUniqueInput!){
		deleteOneShooter(where: $where) {
			id
		}
	}
`;

export default function ShooterCard(props: ShooterCardProps) {
	const [ deleteShooter ] = useMutation<Mutation["deleteOneShooter"], MutationDeleteOneShooterArgs>(DeleteOneShooterMutation);
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
					where: {
						id: props.id,
					},
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

	return (
		<>
			<Paper elevation={2}>
				<ListItem
					secondaryAction={
						<>
							{props.showMutationButton ?
								<>
									<IconButton edge="end" onClick={onEditButtonClick}>
										<Edit />
									</IconButton>
									<IconButton edge="end" sx={{mx: 2}} onClick={onDeleteButtonClick}>
										<Delete />
									</IconButton>
								</>:
								<></>}
						</>
					}
					disablePadding
				>
					<ListItemButton sx={{px: 2}} onClick={() => props?.onClick?.(props.id)}>
						<ListItemAvatar>
							<Typography variant="caption">ID: {props.id}</Typography>
						</ListItemAvatar>
						<ListItemText
							sx={{pr: 7}}
							primary={props.name}
							primaryTypographyProps={{ variant: "h5" }}
							secondary={
								<React.Fragment>
									<Typography
										component="span"
										variant="body2"
									>
										Division: {props.division}
									</Typography>
									<Typography
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