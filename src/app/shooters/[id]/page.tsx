"use client";
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";
import { Query, QueryShooterStatisticArgs } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Chip, Divider, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { PieChart, PieValueType } from "@mui/x-charts";
import { useParams } from "next/navigation";
import React from "react";

const FetchQuery = gql`
	query ShooterStatistic($shooterId: Int!) {
		shooterStatistic(shooterId: $shooterId) {
			shooterId
			averageHitFactor
			averageAccuracy
			runCount
			finishedCount
			proErrorCount
			dnfCount
			dqCount
			highestHitFactor
			highestAccuracy
			alphaCount
			charlieCount
			deltaCount
			missCount
			noShootCount
		}
		shooter(id: $shooterId) {
			name
			ratings {
				id
				rating
				updatedAt
				createAt
			}
			rankings {
				id
				rank
				updatedAt
				createAt
			}
		}
	}
`;

const PieChartBlock = (props: {
	title: string;
	children: React.ReactNode;
}) => {
	return <Grid item xs={12} md={6}>
		<Paper elevation={2} sx={{ p: 2 }}>
			<Typography variant="h6" textAlign={"center"}>{props.title}</Typography>
			{props.children}
		</Paper>
	</Grid>;
};

export default function ShooterStatisticPage() {
	
	const params = useParams();
	const id = parseInt(params.id as string);
	if (isNaN(id))
		// eslint-disable-next-line react/no-unescaped-entities
		return <>ERROR: you've passed a illegle shooter id</>;
	
	const query = useQuery<Query, QueryShooterStatisticArgs>(FetchQuery, {
		variables: {
			shooterId:id,
		},
		fetchPolicy: "no-cache",
	});

	const theme = useTheme();

	const hitZoneData: PieValueType[] = React.useMemo(() => {
		const data: PieValueType[] = [
			{
				id: 1,
				label: "Alpha",
				value: query.data?.shooterStatistic?.alphaCount ?? 0,
				color: theme.palette.success[theme.palette.mode],
			},
			{
				id: 2,
				label: "Charlie",
				value: query.data?.shooterStatistic?.charlieCount ?? 0,
				color: theme.palette.primary[theme.palette.mode],
			},
			{
				id: 3,
				label: "Delta",
				value: query.data?.shooterStatistic?.deltaCount ?? 0,
				color: theme.palette.secondary[theme.palette.mode],
			},
			{
				id: 4,
				label: "Miss",
				value: query.data?.shooterStatistic?.missCount ?? 0,
				color: theme.palette.warning[theme.palette.mode],
			},
			{
				id: 5,
				label: "No Shoot",
				value: query.data?.shooterStatistic?.noShootCount ?? 0,
				color: theme.palette.error[theme.palette.mode],
			},
		];
		return data;
	}, [query]);
	const totalZoneData = React.useMemo(() => hitZoneData.map((item) => item.value).reduce((a, b) => a + b, 0), [hitZoneData]);

	const scoreDistributionData: PieValueType[] = React.useMemo(() => {
		const data: PieValueType[] = [
			{
				id: 1,
				label: "Finished",
				value: query.data?.shooterStatistic?.finishedCount ?? 0,
				color: theme.palette.success[theme.palette.mode],
			},
			{
				id: 2,
				label: "DNF",
				value: query.data?.shooterStatistic?.dnfCount ?? 0,
				color: theme.palette.warning[theme.palette.mode],
			},
			{
				id: 3,
				label: "DQ",
				value: query.data?.shooterStatistic?.dqCount ?? 0,
				color: theme.palette.error[theme.palette.mode],
			},
		];
		return data;
	}, [query]);
	const totalScoreData = React.useMemo(() => scoreDistributionData.map((item) => item.value).reduce((a, b) => a + b, 0), [scoreDistributionData]);


	if (query.loading || !query.data) {
		return <>Loading...</>;
	}

	const data = query.data;

	return (
		<>
			<Grid container>
				<Grid item md={4} sm={6} xs={12} spacing={2}>
					<Paper elevation={2} sx={{p: 2}}>
						<Typography variant="h4" textAlign={"center"}>{data.shooter?.name}</Typography>
					</Paper>
					<Paper elevation={10} sx={{p: 2}}>
						<Stack>
							{/*TODO : reimplement the statis */}
							<Divider><Chip variant="outlined" label="Current" /></Divider>
							<Typography variant="subtitle1">Current Ranking: {`#${data.shooter?.rankings?.[data.shooter?.rankings.length - 1]?.rank ?? 0}`}</Typography>
							<Typography variant="subtitle1">Current Rating: {`${(data.shooter?.ratings?.[data.shooter?.ratings.length - 1]?.rating ?? 0).toFixed(2)}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>Rating represented the shooter performance</Typography>
							<Typography variant="overline" fontSize={"10px"} color={"GrayText"}> s = sum of score, t = sum of  time, k = s/t, a = avg acc, h= avg hit factor, rating(k) = ak^2+hk</Typography>
							<Divider><Chip variant="outlined" label="Average" /></Divider>
							<Typography variant="subtitle1">Average Hit Factor: {(data.shooterStatistic?.averageHitFactor ?? 0).toFixed(3)}</Typography>
							<Typography variant="subtitle1">Average Accuracy: {`${(data.shooterStatistic?.averageAccuracy ?? 0).toFixed(2)}%`}</Typography>
							<Divider><Chip variant="outlined" label="Overall" /></Divider>
							<Typography variant="subtitle1">Run Count: {data.shooterStatistic?.runCount ?? 0}</Typography>
							<Typography variant="subtitle1">Finished Count: {data.shooterStatistic?.finishedCount ?? 0}</Typography>
							<Typography variant="subtitle1">Pro Error Count: {data.shooterStatistic?.proErrorCount ?? 0}</Typography>
							<Typography variant="subtitle1">DNF Count: {data.shooterStatistic?.dnfCount ?? 0}</Typography>
							<Typography variant="subtitle1">DQ Count: {data.shooterStatistic?.dqCount ?? 0}</Typography>
							<Divider><Chip variant="outlined" label="Peak" /></Divider>
							<Typography variant="subtitle1">Highest Hit Factor: {(data.shooterStatistic?.highestHitFactor ?? 0).toFixed(3)}</Typography>
							<Typography variant="subtitle1">Highest Accuracy: {`${(data.shooterStatistic?.highestAccuracy ?? 0).toFixed(2)}%`}</Typography>
						</Stack>
					</Paper>
				</Grid>
				<Grid item container md={8} sm={6} xs={12} spacing={2}>
					<PieChartBlock title="Hit Zone Distribution">
						<PieChart
							series={[{
								data: hitZoneData,
								arcLabel(params) {
									const percent = params.value / totalZoneData;
									if (percent === 0)
										return "";
									return `${(percent * 100).toFixed(0)}%`;
								},
							}]}
							// // margin={{ right: 5 }}
							height={200}
						/>
					</PieChartBlock>
					<PieChartBlock title="Run-up Distribution">
						<PieChart
							series={[{
								data: scoreDistributionData,
								arcLabel(params) {
									const percent = params.value / totalScoreData;
									if (percent === 0)
										return "";
									return `${(percent * 100).toFixed(0)}%`;
								},
							}]}
							// // margin={{ right: 5 }}
							height={200}
						/>
					</PieChartBlock>
				</Grid>
			</Grid>
		</>
	); 
}