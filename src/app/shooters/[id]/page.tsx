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
		aggregateScore(where: { shooterId: { equals: $id } }) {
			_avg {
				hitFactor
				accuracy
			}
			_max {
				hitFactor
			}
		}
		findUniqueShooter(where: { id: $id }) {
			name
			createAt
			division
			score {
				roundPrecentage
				scorelistOverallPrecentage
				state
				hitFactor
				proErrorCount
			}
		}
		getUniqueShooterRanking(shooterId: $id)
    	getUniqueShooterRating(shooterId: $id)
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

	const {
		proErrorCount,
		dqCount,
		dnfCount,
		runCount,
		finishedCount,
	} = React.useMemo(() => {
		let pro_error_count = 0;
		let dq_count = 0;
		let dnf_count = 0;
		let run_count = 0;
		let finished_count = 0;
		if (!query.data) 
			return {
				proErrorCount:0,
				dqCount:0,
				dnfCount: 0,
				runCount: 0,
				finishedCount: 0,
			};
		query.data.findUniqueShooter?.score.forEach(v => {
			pro_error_count += v.proErrorCount;
			if (v.state == ScoreState.DidNotFinish)
				dnf_count += 1;
			if (v.state == ScoreState.Dq)
				dq_count += 1;
			if (v.state == ScoreState.Scored)
				finished_count += 1;
			run_count += 1;
		});
		return {
			proErrorCount: pro_error_count,
			dqCount: dq_count,
			dnfCount: dnf_count,
			finishedCount: finished_count,
			runCount: run_count,
		};
	}, [query]);

	if (query.loading || !query.data) {
		return <>Loading...</>;
	}

	const data = query.data;

	return (
		<>
			<Grid container>
				<Grid item md={4} sm={6} xs={12}>
					<Paper elevation={2} sx={{p: 2}}>
						<Typography variant="h4" textAlign={"center"}>{query.data.findUniqueShooter?.name}</Typography>
					</Paper>
					<Paper elevation={10} sx={{p: 2}}>
						<Stack>
							<Divider><Chip label="Current" /></Divider>
							<Typography variant="subtitle1">Current Ranking: {`#${data.getUniqueShooterRanking}`}</Typography>
							<Typography variant="subtitle1">Current Rating: {`${data.getUniqueShooterRating?.toFixed(2)}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>Rating represented the shooter performance</Typography>
							<Typography variant="overline" fontSize={"10px"} color={"GrayText"}>Rating = (avg_acc)*(avg_hitfactor)+(sum_score/sum_time)</Typography>
							<Divider><Chip label="Average" /></Divider>
							<Typography variant="subtitle1">Average Hit Factor: {(data.aggregateScore?._avg?.hitFactor ?? 0).toFixed(2)}</Typography>
							<Typography variant="subtitle1">Average Accuracy: {`${((data.aggregateScore?._avg?.accuracy ?? 0)).toFixed(2)}%`}</Typography>
							{/* TODO: avg rank impl */}
							{/* <Typography variant="subtitle1">Average Ranking: #2</Typography> */}
							<Divider><Chip label="Overall" /></Divider>
							<Typography variant="subtitle1">Run Count: {runCount}</Typography>
							<Typography variant="subtitle1">Finished Count: {finishedCount}</Typography>
							<Typography variant="subtitle1">Pro Error Count: {proErrorCount}</Typography>
							<Typography variant="subtitle1">DNF Count: {dnfCount}</Typography>
							<Typography variant="subtitle1">DQ Count: {dqCount}</Typography>
							<Divider><Chip label="Peak" /></Divider>
							<Typography variant="subtitle1">Highest Hit Factor: 10.00</Typography>
						</Stack>
					</Paper>
				</Grid>
				<Grid item md={8} sm={6} xs={12}>
					
				</Grid>
			</Grid>
		</>
	); 
}