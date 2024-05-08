import { Mutation, MutationDeleteScorelistArgs } from "@/gql/graphql";
import useGraphqlImage from "@/hooks/useGraphqlImage";
import { gql, useMutation } from "@apollo/client";
import { Delete } from "@mui/icons-material";
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, IconButton, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import React from "react";


const DeleteScorelistMutation = gql`
	mutation($id: Int!){
		deleteScorelist(id: $id) {
			id
		}
	}
`;

export interface ScorelistCardProps {
	scorelistId: number
	imageId: string;
	scorelistName: string;
	scoreCount: number;
}

export default function ScorelistCard(props: ScorelistCardProps) {
	const stageImage = useGraphqlImage(props.imageId);
	const [ deleteScorelist ] = useMutation<Mutation["deleteScorelist"], MutationDeleteScorelistArgs>(DeleteScorelistMutation);
	const confirm = useConfirm();
	const router = useRouter();

	function onDeleteScorelistButtonClick() {
		confirm({
			title: "Are you sure you want to delete the scorelist?",
			content: "All of the scores and data inside of it WILL BE DELETE PERMANENTLY",
			confirmationText: "Delete",
			confirmationButtonProps: {
				color: "error",
			},
		})
			.then(() => {
				deleteScorelist({
					variables: {
						id: props.scorelistId,
					},
				});
			})
			.catch();
	}

	function onCardClick() {
		router.push(`scoring/${props.scorelistId.toString()}`);
	}

	return (
		<>
			<Card>
				<CardActionArea onClick={onCardClick}>
					<Grid container height={"100%"}>
						<Grid item xs={12} sm={6} md={3}>
							<CardMedia
								component="img"
								sx={{
									width: "100%",
									height: "100%",
								}}
								image={stageImage}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={9} sx={{ display: "flex", flexDirection: "column", justifyContent:"space-between"}}>
							<CardContent>
								<Typography variant="h6" color="text.secondary">
									{props.scorelistName}
								</Typography>
								<Typography variant="body2" color="text.secondary">
								Contain: {props.scoreCount} score records
								</Typography>
							</CardContent>
							<CardActions
								disableSpacing
								onClick={(e) => e.stopPropagation()}
							>
								<IconButton color="error" onClick={onDeleteScorelistButtonClick}>
									<Delete />
								</IconButton>
							</CardActions>
						</Grid>
					</Grid>
				</CardActionArea>
			</Card>
		</>
	);
}