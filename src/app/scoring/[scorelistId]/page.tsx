"use client";
export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";

import {
	Mutation,
	MutationAddRoundsToScorelistArgs,
	MutationSwapScoresIdArgs,
	Query,
	QueryScorelistArgs,
	ScoreState,
} from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Add, PersonAdd } from "@mui/icons-material";
import { RowClassParams } from "ag-grid-community";
import {
	Box,
	Button,
	ButtonGroup,
	FormControlLabel,
	Paper,
	SpeedDial,
	SpeedDialAction,
	SpeedDialIcon,
	Stack,
	Switch,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { ColDef, RowClickedEvent, RowDragEndEvent } from "@ag-grid-community/core";
import JoinShooterDialog from "./joinShooterDialog";
import { useToggle } from "@uidotdev/usehooks";
import { useLoading } from "mui-loading";
import { shuffle } from "@/lib/utils";
import { useSearchParameters } from "@/hooks/useSearchParameters";

const FetchQuery = gql`
    query Scorelist($id: Int!) {
		scorelist(id: $id) {
			id
			createAt
			lastUpdate
			stageId
			scoreboardId
			rounds
			stage {
				name
				createAt
			}
			scores {
				id
				createAt
				shooterId
				alphas
				charlies
				deltas
				misses
				noshoots
				poppers
				time
				proErrorCount
				scorelistId
				score
				hitFactor
				dqObjectId
				round
				accuracy
				state
				roundPercentage
				overallPercentage
				shooter {
					name
				}
				proErrors {
					id
					count
					proError {
						id
						index
						title
						description
					}
				}
			}
		}
	}
`;

const AddRoundToScorelistMutation = gql`
    mutation (
        $id: Int!
    ) {
        addRoundsToScorelist(id: $id) {
            id
        }
    }
`;

const SwapMutation = gql`
	mutation Swap($srcId: Int!, $destId: Int!) {
		swapScoresId(srcId: $srcId, destId: $destId)
	}
`;

const ScoresChangeSubscription = gql`
	subscription {
		scoresChange
	}
`;
const ScorelistsChangeSubscription = gql`
	subscription {
		scorelistsChange
	}
`;


interface ScoreItem {
    Name: string;
    A: number;
    C: number;
    D: number;
    Miss: number;
    NoShoots: number;
    Popper: number;
    ProErrors: number;
    Time: number;
    HitFactor: string;
    Percentage: number;
    Id: number;
    State: string;
	Round?: number;
	Accuracy: number;
}

export default function ScorelistPage() {
	const params = useParams();
	const id = parseInt(params.scorelistId as string);
	if (isNaN(id)) return <>Error: youve pass a invaild scorelist id</>;
	const theme = useTheme();
	const [updateScorelist] = useMutation<Mutation["addRoundsToScorelist"], MutationAddRoundsToScorelistArgs>(AddRoundToScorelistMutation);
	const [selectedRound, setSelectedRound] = useSearchParameters<number>("round");
	const query = useQuery<Query, QueryScorelistArgs>(FetchQuery, {
		variables: {
			id,
		},
		onCompleted() {
			refreshGrid();
		},
		pollInterval: 10000,
		fetchPolicy: "no-cache",
	});
	useSubscription(ScoresChangeSubscription, {
		onData() {
			query.refetch();
		},
	});
	useSubscription(ScorelistsChangeSubscription, {
		onData() {
			query.refetch();
		},
	});

	function addRround() {
		updateScorelist({
			variables: {
				id,
			},
		});
	}

	function refreshGrid() {
		const Rows: ScoreItem[] = [];
		if (!query.data?.scorelist) return;
		query.data.scorelist.scores?.map((v) => {
			let nameSurfix = "";
			if (!v) return;
			switch (v.state) {
			case ScoreState.Dq:
				nameSurfix = "(DQ)";
				break;
			case ScoreState.DidNotFinish:
				nameSurfix = "(DNF)";
				break;
			}
			if (v.round !== selectedRound && (selectedRound ?? 0) !== 0) return;
			Rows.push({
				Id: v.id,
				A: v.alphas,
				C: v.charlies,
				D: v.deltas,
				Miss: v.misses,
				Name: `${v.shooter.name} ${nameSurfix}`,
				NoShoots: v.noshoots,
				Popper: v.poppers ?? 0,
				ProErrors: v.proErrorCount,
				Time: v.time,
				HitFactor: parseFloat(v.hitFactor as unknown as string).toFixed(3),
				Percentage: selectedRound == 0 ? v.overallPercentage : v.roundPercentage,
				State: v.state,
				Round: selectedRound == 0 ? v.round : undefined,
				Accuracy: v.accuracy as number,
			});
		});
		setRowData([...Rows.toSorted((a, b) => a.Id - b.Id)]);
		const newColDefs = [...colDefs];
		newColDefs[1].hide = selectedRound !== 0;
		setColDefs(newColDefs);
	}

	const [joinShooterDialogOpem, setJoinShooterDialogOpem] =
        React.useState(false);
	function openJoinShooterDialog() {
		setJoinShooterDialogOpem(true);
	}
	function closeJoinShooterDialog() {
		setJoinShooterDialogOpem(false);
	}

	//TODO refactor swap
	const [ swap ] = useMutation<Mutation["swapScoresId"], MutationSwapScoresIdArgs>(SwapMutation);
	const onRowDragEnd = React.useCallback((event: RowDragEndEvent<ScoreItem>) => {
		try {
			const movingNode = event.node;
			const overNode = event.overNode;
			const movingData = movingNode.data;
			const overData = overNode!.data;
			if (!movingData?.Id || !overData?.Id)
				return;
			swap({
				variables: {
					srcId: movingData.Id,
					destId: overData.Id,
				},
			});
		} catch (e) { /* empty */ }
	}, []);
	
	// #region grid

	function onSelectedRoundChange(newRound: number) {
		setSelectedRound(newRound);
	}
	const [rowData, setRowData] = React.useState<ScoreItem[]>();

	// Column Definitions: Defines the columns to be displayed.
	const [colDefs, setColDefs] = React.useState<ColDef<ScoreItem>[]>([
		{ field: "Id", hide: true, pinned: true, maxWidth: 80 },
		{ field: "Round", pinned: true },
		{ field: "Name", pinned: true, rowDrag: true },
		{ field: "A", minWidth: 5 },
		{ field: "C", minWidth: 5 },
		{ field: "D", minWidth: 5 },
		{ field: "Miss" },
		{ field: "NoShoots", minWidth: 100 },
		{ field: "Popper", minWidth: 80 },
		{ field: "ProErrors", minWidth: 100 },
		{ field: "Time" , valueFormatter: (v) => `${v.value.toFixed(2)}s`},
		{ field: "HitFactor"},
		{ field: "Percentage", valueFormatter: (v) => `${v.value.toFixed(1)}%`},
		{ field: "State", hide: true },
		{ field: "Accuracy", valueFormatter: (v) => `${v.value.toFixed(1)}%`},
	]);

	const autoSizeStrategy = {
		type: "fitGridWidth",
	};
	const gridRef = React.useRef<AgGridReact>(null);
	const autoSizeAll = React.useCallback((skipHeader: boolean) => {
		try {

			const allColumnIds: string[] = [];
			gridRef.current!.api.getColumns()!.forEach((column) => {
				allColumnIds.push(column.getId());
			});
			gridRef.current!.api.autoSizeColumns(allColumnIds, skipHeader);
		} catch (e) { /* empty */ }
	}, []);

	const router = useRouter();

	function onRowClicked(event: RowClickedEvent<ScoreItem>) {
		router.push(`${id}/${event.data?.Id}`);
	}
	const [enableOrdering, toggleOrdering] = useToggle(false);

	// #endregion
	React.useEffect(() => {
		refreshGrid();
		setTimeout(() => autoSizeAll(false), 500);
	}, [selectedRound, query, enableOrdering]);
	React.useEffect(() => {		
		setTimeout(() => autoSizeAll(false), 1000);
	}, [gridRef]);


	const getRowStyle = (params: RowClassParams<ScoreItem>) => {
		switch (params.data?.State) {
		case "DQ":
			return {
				background: `${theme.palette.error[theme.palette.mode]}3f`,
			};
		case "DidNotFinish":
			return {
				background: `${
					theme.palette.warning[theme.palette.mode]
				}3f`,
			};
		case "DidNotScore":
			return;
		case "Scored":
			return {
				background: `${
					theme.palette.success[theme.palette.mode]
				}3f`,
			};
		}
		return;
	};

	const loading = useLoading();

	//TODO refactor randomizing
	async function randomizeOrder() {
		try {
			const roundIds = data.scores?.filter(v => v?.round === selectedRound).map(v => v?.id);
			if (!roundIds) throw new Error("No round found");
			await shuffle(roundIds, async (src, dest) => {
				if (!roundIds[src] || !roundIds[dest])
					return;
				if (src === dest)
					return;
				loading?.startLoading();
				await swap({
					variables: {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-expect-error
						srcId: roundIds[src],
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-expect-error
						destId: roundIds[dest],
					},
				});
			});
		} finally {
			loading?.stopLoading();
		}
	}

	const mobileBreakpoint = useMediaQuery(theme.breakpoints.up(500));

	// #region error handling
	if (query.error) return <>ERROR: {JSON.stringify(query.error)}</>;

	if (!query.data?.scorelist) return <>Loading...</>;
	const data = query.data.scorelist;
	// #endregion
	return (
		<Stack
			direction="column"
			justifyContent="center"
			alignItems="stretch"
			height={"100%"}
		>
			<Box sx={{ p: 2 }}>
				<Typography variant="h4">{`${new Date(
					data.stage?.createAt,
				).toLocaleDateString()} ${data.stage?.name}`}</Typography>
			</Box>
			<Paper elevation={10} sx={{
				mt: 2,
				height: "100%",
			}}>
				<Tabs
					variant="scrollable"
					value={selectedRound ?? 0}
					onChange={(e, v) => onSelectedRoundChange(v)}
				>
					<Tab label="Overall" value={0} />
					{(() => {
						const tabList = [];
						for (let index = 0; index < data.rounds; index++) {
							tabList.push(
								<Tab
									key={index}
									label={`Round ${index + 1}`}
									value={index + 1}
								/>,
							);
						}
						return tabList;
					})()}
				</Tabs>
				<Stack direction={mobileBreakpoint ? "row" : "column"} justifyContent={"space-between"} gap={2}>
					<Stack direction={mobileBreakpoint ? "row" : "column"} gap={2}>
						<Button onClick={() => autoSizeAll(false)}>
							Resize the grid
						</Button>
						{selectedRound == 0 ||
							<FormControlLabel value={enableOrdering} onChange={() => toggleOrdering()} control={<Switch />} label="Enable ordering" />
						}
						<Button variant="outlined" onClick={() => router.replace(`${location.origin}/statistics/?scorelist=%5B${id}%5D`)}>Statistics</Button>
					</Stack>
					{selectedRound == 0 ||
						<Stack direction={mobileBreakpoint ? "row" : "row-reverse"} gap={2}>
							<ButtonGroup variant="text">
								<Button onClick={randomizeOrder}>
									Reshuffle
								</Button>
							</ButtonGroup>
						</Stack>
					}
				</Stack>
				<div
					className="ag-theme-alpine-dark" // applying the grid theme
					style={{
						height: "100%",
					}} // the grid will fill the size of the parent container
				>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-ignore */}
					<AgGridReact
						ref={gridRef}
						rowData={rowData}
						onRowClicked={onRowClicked}
						columnDefs={colDefs}
						autoSizeStrategy={autoSizeStrategy}
						getRowStyle={getRowStyle}
						onRowDragEnd={onRowDragEnd}
						rowDragEntireRow={enableOrdering}
						rowDragMultiRow={enableOrdering}
						suppressRowDrag={!enableOrdering}
					/>
				</div>
			</Paper>
			<SpeedDial
				ariaLabel="Scorelist operation"
				sx={{ position: "fixed", bottom: 20, right: 20 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add />}
					tooltipTitle={"Add round"}
					tooltipOpen
					onClick={addRround}
				/>
				{selectedRound == 0 || <SpeedDialAction
					icon={<PersonAdd />}
					tooltipTitle={"Join shooters"}
					tooltipOpen
					onClick={openJoinShooterDialog}
				/>}
			</SpeedDial>

			<JoinShooterDialog
				open={joinShooterDialogOpem}
				onClose={closeJoinShooterDialog}
				scorelistId={id}
				round={(selectedRound ?? 0)}
				selectedRound={(selectedRound ?? 0)}
			/>
		</Stack>
	);
}
