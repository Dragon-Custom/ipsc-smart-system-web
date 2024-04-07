import React from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Theme, Typography, useMediaQuery } from "@mui/material";
import useGraphqlImage from "@/hooks/useGraphqlImage";
import StageDetialsDialog from "./stageDetailsDialog";
import { StageTag } from "@/gql/graphql";





export interface StageCardProps {
	id: number;
	name: string;
	designerName: string;
	description: string;
	gunConditon: number;
	imageId: string;
	stageType: string;
	createAt: string;
	tags: StageTag[];
}

export default function StageCard(props: StageCardProps) {
	const matches = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
	const base64Img = useGraphqlImage(props.imageId);
	const [detailsOpen, setDetailsOpen] = React.useState(false);

	function onCardClick() {
		setDetailsOpen(true);
	}
	function onDetailsClose() {
		setDetailsOpen(false);
	}

	return (
		<>
			<StageDetialsDialog
				open={detailsOpen}
				onClose={onDetailsClose}
				stageId={props.id}
			/>
			<Card
				sx={{
					m: 2,
					height: () => {
						if (matches)
							return 200;
					},
				}
				}>
				<CardActionArea onClick={onCardClick}>
					<Stack direction={matches ? "row": "column"}>
						<CardMedia
							component="img"
							sx={{
								width:  () => {
									if (matches)
										return "unset";
									return "100%";
								},
								height: () => {
									if (matches)
										return 200;
									return "100%";
								},
							}}
							image={base64Img}
						/>
						<Box>
							<CardContent
								sx={{
									px: () => {
										if (matches)
											return 5;
										return 1;
									},
									py: () => {
										if (matches)
											return 1;
										return 1;
									},
									paddingBottom: "0 !important",
								}}
							>
								<Typography component="div" variant={matches ? "h4" : "h6"}>
									{props.name}
								</Typography>
								<Typography component="div" variant={matches ? "h6" : "caption"}>
								Designer: {props.designerName}
								</Typography>
								<Typography component="div" variant={matches ? "body2" : "caption"}>
									{matches ? `Condition ${props.gunConditon}` : `Con.${props.gunConditon}`} {props.stageType} stage
								</Typography>
								<Typography component="div" variant={matches ? "body2" : "caption"}>
									{new Date(props.createAt).toLocaleDateString()}
								</Typography>
								{matches ?
									<>
										<Typography component="div" variant="caption">
											Description: {props.description}
										</Typography>

									</>
									: <></>}
								{props.tags ?
									props.tags.map((v) =>
										<Chip
											key={v.id}
											sx={{
												backgroundColor: v.color,
											}}
											label={v.title}
										/>,
									)
									: <></>}
							</CardContent>
						</Box>
					</Stack>
				</CardActionArea>
			</Card>
		</>
	);
}
