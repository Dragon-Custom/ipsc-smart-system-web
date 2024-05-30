"use client";
import { Query, QueryGlobalStatisticArgs } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Box, Button, Checkbox, Chip, Divider, FormControl, Grid, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Stack, Typography } from "@mui/material";
import React, { Suspense } from "react";


const FetchQuery = gql`
	query Scoreboards($filter: GlobalStatisticFilterInputType) {
		scoreboards {
			id
			name
		}
		stages {
			id
			name
		}
		scorelists {
			id
			createAt
			lastUpdate
			scoreboardId
			rounds
			stage {
				name
			}
		}
		globalStatistic(filter: $filter) {
			shootersTotal
			runsTotal
			stagesTotal
			finishedTotal
			dqTotal
			dnfTotal
			averageHitFactor
			averageAccuracy
			alphaZoneTotal
			charlieZoneTotal
			deltaZoneTotal
			noShootTotal
			popperTotal
			missTotal
			proErrorTotal
		}
	}
`;

export default function Statistics() {
	const [scoreboardFilter, setScoreboardFilter] = React.useState<number[]>([]);
	const [scorelistFilter, setScorelistFilter] = React.useState<number[]>([]);
	const [stageFilter, setStageFilter] = React.useState<number[]>([]);
	const query = useQuery<Query, QueryGlobalStatisticArgs>(FetchQuery, {
		variables: {
			filter: {
				scoreboardId: scoreboardFilter.length === 0 ? undefined : scoreboardFilter,
				scorelistId: scorelistFilter.length === 0 ? undefined : scorelistFilter,
				stageId: stageFilter.length === 0 ? undefined : stageFilter,
			},
		},
		onCompleted(data) {
			console.log(data);
		},
	});
	const data = React.useDeferredValue(query.data);

	const handleScoreboardFilterChange = (event: SelectChangeEvent<typeof scoreboardFilter>) => {
		setScoreboardFilter(event.target.value as number[]);
	};
	const handleScorelistFilterChange = (event: SelectChangeEvent<typeof scorelistFilter>) => {
		setScorelistFilter(event.target.value as number[]);
	};
	const scorelistFilterNames = React.useMemo(() => {
		const names: string[] = [];
		scorelistFilter.map((value) => {
			const scorelist = query.data?.scorelists?.find((scorelist) => scorelist?.id === value);
			if (!scorelist)
				return;
			names.push(`${scorelist.createAt.toString()} ${scorelist.stage.name}`);
		});
		return names;
	}, [scorelistFilter]);
	const handleStageFilterChange = (event: SelectChangeEvent<typeof stageFilter>) => {
		setStageFilter(event.target.value as number[]);
	};


	
	return (
		<>
			<Suspense fallback={<p>Loading...</p>}>
				<Stack gap={2} divider={<Divider />}>
					<Paper elevation={3} sx={{ p: 2 }}>
						<Stack divider={<Divider />} gap={2}>
							<Typography variant="h3">Statistics</Typography>
							<Grid container direction={"row"} width={"100%"} gap={2}>
								<Grid item xs={"auto"}>
									<Typography sx={{ height: "100%" }} variant="body1" alignContent={"center"} alignItems={"center"}>Filter</Typography>
								</Grid>
								<Grid item xs={3}>
									<FormControl fullWidth>
										<InputLabel>Scoreboard</InputLabel>
										<Select
											fullWidth
											multiple
											value={scoreboardFilter}
											onChange={handleScoreboardFilterChange}
											input={<OutlinedInput label="Scoreboard" />}
											renderValue={(selected) => <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{selected.map((value) => (
													<Chip size="small" key={value} label={data?.scoreboards?.find((scoreboard) => scoreboard?.id === value)?.name} />
												))}
											</Box>}
										>
											{data?.scoreboards.map((scoreboard) => {
												if (!scoreboard)
													return;
												return <MenuItem key={scoreboard.id} value={scoreboard.id}>
													<Checkbox checked={scoreboardFilter.findIndex((id) => id === scoreboard.id) > -1} />
													<ListItemText primary={scoreboard.name} />
												</MenuItem>;
											})}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs>
									<FormControl fullWidth>
										<InputLabel>Scorelist</InputLabel>
										<Select
											fullWidth
											multiple
											value={scorelistFilter}
											onChange={handleScorelistFilterChange}
											input={<OutlinedInput label="Scorelist" />}
											renderValue={() => <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{scorelistFilterNames.map((value) => (
													<Chip size="small" key={value} label={value} />
												))}
											</Box>}
										>
											{data?.scorelists?.map((scorelist) => {
												if (!scorelist)
													return;
												return <MenuItem key={scorelist.id} value={scorelist.id}>
													<Checkbox checked={scoreboardFilter.findIndex((id) => id === scorelist.id) > -1} />
													<ListItemText primary={`${new Date(scorelist.createAt).toLocaleDateString()} ${scorelist.stage.name}`} />
												</MenuItem>;
											})}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={3}>
									<FormControl fullWidth>
										<InputLabel>Stage</InputLabel>
										<Select
											fullWidth
											multiple
											value={stageFilter}
											onChange={handleStageFilterChange}
											input={<OutlinedInput label="Stage" />}
											renderValue={(selected) => <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{selected.map((value) => (
													<Chip size="small" key={value} label={data?.stages?.find((stage) => stage?.id === value)?.name} />
												))}
											</Box>}
										>
											{data?.stages.map((stage) => {
												if (!stage)
													return;
												return <MenuItem key={stage.id} value={stage.id}>
													<Checkbox checked={stageFilter.findIndex((id) => id === stage.id) > -1} />
													<ListItemText primary={stage.name} />
												</MenuItem>;
											})}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs>
									<Button fullWidth sx={{height: "100%"}} variant="outlined">Apply</Button>
								</Grid>
							</Grid>
					
						</Stack>				
					</Paper>
					<Paper elevation={3} sx={{ p: 2 }}>
						<Typography variant="h6">Joined shooter: {data?.globalStatistic?.shootersTotal}</Typography>
						<Typography variant="h6">Total scored stages: {data?.globalStatistic?.stagesTotal}</Typography>
						<Typography variant="h6">Total DQ: {data?.globalStatistic?.dqTotal}</Typography>
						<Typography variant="h6">Total DNF: {data?.globalStatistic?.dnfTotal}</Typography>
						<Typography variant="h6">Total pro errors: {data?.globalStatistic?.proErrorTotal}</Typography>
						<Typography variant="h6">Total completed: {data?.globalStatistic?.finishedTotal}</Typography>
						<Typography variant="h6">Average hit-factor: {data?.globalStatistic?.averageHitFactor?.toFixed(3)}</Typography>
						<Typography variant="h6">Average accuracy: {`${data?.globalStatistic?.averageAccuracy?.toFixed(2)}%`}</Typography>
					</Paper>
				</Stack>
			</Suspense>
		</>
	);
}