"use client";
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";
import { Query, ScoreState } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import React from "react";

const FetchQuery = gql`
	query ($id: Int!) {
		shooter(id: $ids) {
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
		}
	}
`;

export default function ShooterStatisticPage() {
	const params = useParams();
	const id = parseInt(params.id as string);
	if (isNaN(id))
		// eslint-disable-next-line react/no-unescaped-entities
		return <>ERROR: you've passed a illegle shooter id</>;
	
	const query = useQuery<Query>(FetchQuery, {
		variables: {
			id,
		},
		fetchPolicy: "no-cache",
	});

	if (query.loading || !query.data) {
		return <>Loading...</>;
	}

	const data = query.data;

	return (
		<>
			<Grid container>
				<Grid item md={4} sm={6} xs={12}>
					<Paper elevation={2} sx={{p: 2}}>
						<Typography variant="h4" textAlign={"center"}>{data.shooter?.name}</Typography>
					</Paper>
					<Paper elevation={10} sx={{p: 2}}>
						<Stack>
							{/*TODO : reimplement the statis */}
							{/* <Divider><Chip label="Current" /></Divider>
							<Typography variant="subtitle1">Current Ranking: {`#${data.shooter?.rankings[0]?.rank ?? 0}`}</Typography>
							<Typography variant="subtitle1">Current Rating: {`${(data.shooter?.ratings?.[0]?.rating ?? 0).toFixed(2)}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>Rating represented the shooter performance</Typography>
							<Typography variant="overline" fontSize={"10px"} color={"GrayText"}>Rating = (avg_acc)*(avg_hitfactor)+(sum_score/sum_time)</Typography>
							<Divider><Chip label="Average" /></Divider>
							<Typography variant="subtitle1">Average Hit Factor: {(data.aggregateScore?._avg?.hitFactor ?? 0).toFixed(2)}</Typography>
							<Typography variant="subtitle1">Average Accuracy: {`${((data.aggregateScore?._avg?.accuracy ?? 0)).toFixed(2)}%`}</Typography>
							<Divider><Chip label="Overall" /></Divider>
							<Typography variant="subtitle1">Run Count: {runCount}</Typography>
							<Typography variant="subtitle1">Finished Count: {finishedCount}</Typography>
							<Typography variant="subtitle1">Pro Error Count: {proErrorCount}</Typography>
							<Typography variant="subtitle1">DNF Count: {dnfCount}</Typography>
							<Typography variant="subtitle1">DQ Count: {dqCount}</Typography>
							<Divider><Chip label="Peak" /></Divider>
							<Typography variant="subtitle1">Highest Hit Factor: 10.00</Typography> */}
						</Stack>
					</Paper>
				</Grid>
				<Grid item md={8} sm={6} xs={12}>
					
				</Grid>
			</Grid>
		</>
	); 
}