"use client";
import { Query, QueryFindUniqueStageArgs } from "@/gql/graphql";
import useGraphqlImage from "@/hooks/useGraphqlImage";
import { gql, useQuery } from "@apollo/client";
import { Dialog, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import React from "react";

const FindUniqueStage = gql`
    query ($where: StageWhereUniqueInput!){
        findUniqueStage(where: $where) {
            id
			name
			createAt
			poppers
			noshoots
			papers
			imageId
			designer {
				name
			}
			maxScore
			minRounds
			stageType
        }
    }
`;

export interface StageDetialsDialogProps {
    open: boolean;
    onClose: () => void;
    stageId: number;
}
export default function StageDetialsDialog(props: StageDetialsDialogProps) {
	const stage = useQuery<Query, QueryFindUniqueStageArgs>(FindUniqueStage, {
		variables: {
			where: {
				id: props.stageId,
			},
		},
	});
	const image = useGraphqlImage(stage.data?.findUniqueStage?.imageId);

	return (
		<>
			<Dialog
				maxWidth="md"
				fullWidth
				onClose={props.onClose}
				open={props.open}
			>
				{!stage.data?.findUniqueStage ? <>Loading...</> :
					<>
						<DialogTitle>{stage.data?.findUniqueStage.name}</DialogTitle>
						<DialogContent>
							<img src={image} width={"100%"}/>
							<Typography variant="h3">{stage.data?.findUniqueStage.name}</Typography>
							<Typography variant="h6">Designed by: {stage.data?.findUniqueStage.designer.name}</Typography>
							<Divider />
							<Typography variant="overline">{stage.data?.findUniqueStage.description}</Typography>
							<Typography variant="body2">create at:{new Date(stage.data?.findUniqueStage.createAt).toLocaleDateString()}</Typography>
							<Divider />
							<Typography variant="body2">Papers: {stage.data?.findUniqueStage.papers}</Typography>
							<Typography variant="body2">No-shoots: {stage.data?.findUniqueStage.noshoots}</Typography>
							<Typography variant="body2">Popper: {stage.data?.findUniqueStage.poppers}</Typography>
							<Divider />
							<Typography variant="body2">Max score: {stage.data?.findUniqueStage.maxScore}</Typography>
							<Typography variant="body2">Min rounds: {stage.data?.findUniqueStage.minRounds}</Typography>
							<Typography variant="body2">Stage type: {stage.data?.findUniqueStage.stageType}</Typography>
						</DialogContent>
					</>
				}
			</Dialog>
		</>
	);
}