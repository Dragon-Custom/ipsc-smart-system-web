"use client";
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";
import { PieChartBlock } from "@/components/PieChartBlock";
import { Query, QueryShooterStatisticArgs } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Chip, Divider, Grid, Paper, Slider, Stack, Typography, useTheme } from "@mui/material";
import { LineChart, PieChart, PieValueType, SparkLineChart } from "@mui/x-charts";
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
			elo {
				id
				elo
				updatedAt
				createAt
			}
		}
	}
`;
const LineChartBlock = (props: {
	children: React.ReactNode;
}) => {
	return <Grid item xs={12}>
		<Paper elevation={2} sx={{ p: 2 }}>
			{props.children}
		</Paper>
	</Grid>;
};
const minDistance = 10;

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


	const chartData: {
		label: string[];
		ratingData: number[];
		eloData: number[];
	} | undefined = React.useMemo(() => {
		const originalRating = query.data?.shooter?.ratings;
		originalRating?.toSorted((a, b) => b?.createAt - a?.createAt);
		const ratingData = originalRating?.map((item) => item?.rating ?? 0) ?? [];

		const originalElo = query.data?.shooter?.elo;
		originalElo?.toSorted((a, b) => b?.createAt - a?.createAt);
		const eloData = originalElo?.map((item) => item?.elo ?? 0) ?? [];
		
		let longestData: typeof originalElo | typeof originalRating = [];
		if (ratingData.length > eloData.length)
			longestData = originalRating || [];
		else
			longestData = originalElo || [];

		const outputLabels = longestData?.map((item) => {
			const date = new Date(item?.createAt);
			return `${date.toLocaleDateString()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
		}) ?? [];

		if (ratingData.length > eloData.length)
			eloData.push(...Array(ratingData.length - eloData.length).fill(eloData[eloData.length - 1]));
		else
			ratingData.push(...Array(eloData.length - ratingData.length).fill(ratingData[ratingData.length - 1]));

		console.log(outputLabels, ratingData, eloData);
		
		return {
			label: outputLabels,
			ratingData: ratingData,
			eloData: eloData,
		};
	}, [query]);
	const [xLimits, setXLimites] = React.useState<number[]>([0, 0]);
	const handleChange = (
		event: Event,
		newValue: number | number[],
		activeThumb: number,
	) => {
		if (!Array.isArray(newValue)) {
			return;
		}

		if (newValue[1] - newValue[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(newValue[0], chartData.label.length - minDistance);
				setXLimites([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(newValue[1], minDistance);
				setXLimites([clamped - minDistance, clamped]);
			}
		} else {
			setXLimites(newValue as number[]);
		}
	};

	// #region this block of code can trigger the React rerender
	// by default the data won't show up in the first render, so we need to force update it
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);
	const ref = React.useRef<HTMLDivElement>(null);
	React.useEffect(() => {
		setTimeout(() => {
			forceUpdate();
			setXLimites([0, chartData.label.length]);
		}, 100);
	}, [ref,query]);
	// #endregion


	if (query.loading || !query.data) {
		return <>Loading...</>;
	}

	const data = query.data;

	return (
		<>
			<Grid container spacing={2}>
				<Grid item md={4} sm={6} xs={12} >
					<Paper elevation={2} sx={{p: 2}}>
						<Typography variant="h4" textAlign={"center"}>{data.shooter?.name}</Typography>
					</Paper>
					<Paper elevation={10} sx={{p: 2}}>
						<Stack>
							<Divider><Chip variant="outlined" label="Current" /></Divider>
							<Typography variant="subtitle1">Current Ranking: {`#${data.shooter?.rankings?.[data.shooter?.rankings.length - 1]?.rank ?? 0}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>Rank vs Time</Typography>
							<SparkLineChart
								data={data.shooter?.rankings?.map((item) => item?.rank ?? 0) ?? []}
								height={50}
								showHighlight={true}
								showTooltip={true}
								xAxis={{
									reverse: true,
								}}
							/>
							<Typography variant="subtitle1">Current Rating: {`${(data.shooter?.ratings?.[data.shooter?.ratings.length - 1]?.rating ?? 0).toFixed(2)}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>Rating represented the shooter performance</Typography>
							<Typography variant="overline" fontSize={"10px"} color={"GrayText"}> s = sum of score, t = sum of  time, k = s/t, a = avg acc, h= avg hit factor, rating(k) = ak^2+hk</Typography>
							<Typography variant="subtitle1">Current ELO: {`${(data.shooter?.elo?.[data.shooter?.elo.length - 1]?.elo ?? 0).toFixed(2)}`}</Typography>
							<Typography variant="caption" color={"InactiveCaptionText"}>ELO represents how a {"shooter's"} performance is compared to other shooters.</Typography>
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
				<Grid item container md={8} sm={6} xs={12} spacing={1}>
					<LineChartBlock>
						<LineChart
							title="Rating vs Time"
							height={400}
							series={[
								{
									data: chartData.ratingData,
									connectNulls: true,
									curve: "monotoneX",
									label: "Rating",
									yAxisKey: "Rating",
								},
								{
									data: chartData.eloData,
									connectNulls: true,
									curve: "linear",
									label: "Elo",
									yAxisKey: "Rating",
								},
							]}
							yAxis={[
								{ id: "Rating", scaleType: "pow" },
							]}
							leftAxis="Rating"
							xAxis={[
								{
									min: xLimits[0],
									max: xLimits[1] - 1,
									// scaleType: "point",
									data: chartData.label.map((item, index) => index),
									valueFormatter: (value) => {
										return chartData.label[value];
									},
									label: "Time",
								},
							]}
							grid={{ vertical: true, horizontal: true }}
							axisHighlight={{
								x: "line",
								y: "line",
							}}
							ref={ref}
						/>
						<Slider
							value={xLimits}
							onChange={handleChange}
							valueLabelDisplay="auto"
							min={0}
							max={chartData.label.length}
							sx={{ mt: 2 }}
						/>
					</LineChartBlock>
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
								arcLabelMinAngle: 30,
								highlightScope: { faded: "series", highlighted: "item" },
								faded: { innerRadius: 10, additionalRadius: -30, color: "gray" },
							}]}
							height={200}
						/>
					</PieChartBlock>
					<PieChartBlock title="Result Distribution">
						<PieChart
							series={[{
								data: scoreDistributionData,
								arcLabel(params) {
									const percent = params.value / totalScoreData;
									if (percent === 0)
										return "";
									return `${(percent * 100).toFixed(0)}%`;
								},
								arcLabelMinAngle: 30,
								highlightScope: { faded: "series", highlighted: "item" },
								faded: { innerRadius: 10, additionalRadius: -30, color: "gray" },
							}]}
							height={200}
						/>
					</PieChartBlock>
				</Grid>
			</Grid>
		</>
	); 
}