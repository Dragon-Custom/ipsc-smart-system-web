"use client";
import { Mutation, MutationUpdateOneScorelistArgs, Query, QueryFindUniqueScorelistArgs, ScoreState } from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Add, PersonAdd } from "@mui/icons-material";
import { RowClassParams } from "ag-grid-community";
import { Box, Button, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
	ColDef,
	RowClickedEvent,
} from "@ag-grid-community/core";
import JoinShooterDialog from "./joinShooterDialog";

const FetchQuery = gql`
	query($where: ScorelistWhereUniqueInput!) {
		findUniqueScorelist(where: $where){
			stage {
				name
				createAt
			}
			createAt
			id
			scores {
				alphas
				charlies
				deltas
				id
				misses
				noshoots
				proErrors {
					count
				}
				round
				shooter {
					name
				}
				time
				round
				hitFactor
				proErrorCount
				roundPrecentage
				state
			}
			rounds
		}
	}
`;

const UpdateOneScorelist = gql`
	mutation($where: ScorelistWhereUniqueInput!, $data: ScorelistUpdateInput!) {
		updateOneScorelist(where: $where, data: $data) {
			id
		}
	}
`;

const SubscriptScorelistChange = gql`
	subscription {
   		subscriptScorelistChange
	}
`;

const SubscriptScoreChange = gql`
	subscription {
   		subscriptScoreChange
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
	Precentage: string;
	Id: number;
}

export default function ScorelistPage() {
	const params = useParams();
	const id = parseInt(params.scorelistId as string);
	if (isNaN(id))
		return <>
			Error: youve pass a invaild scorelist id
		</>;
	const router = useRouter();
	const theme = useTheme();
	useSubscription(SubscriptScorelistChange, {
		async onData() {
			await query.refetch();
		},
	});
	useSubscription(SubscriptScoreChange, {
		async onData() {
			await query.refetch();
		},
	});
	const [updateScorelist] = useMutation<Mutation["updateOneScorelist"], MutationUpdateOneScorelistArgs>(UpdateOneScorelist);
	const query = useQuery<Query, QueryFindUniqueScorelistArgs>(FetchQuery, {
		variables: {
			where: {
				id,
			},
		},
		onCompleted() {
			refreshGrid();
		},
		fetchPolicy: "no-cache",
	});

	function addRround() {
		updateScorelist({
			variables: {
				data: {
					rounds: {
						set: data.rounds + 1,
					},
				},
				where: {
					id,
				},
			},
		});
	}
		
	function refreshGrid() {
		const Rows: ScoreItem[] = [];
		if (!query.data?.findUniqueScorelist)
			return;
		query.data.findUniqueScorelist.scores.map((v) => {
			let name_surfix = "";
			switch (v.state) {
			case ScoreState.Dq:
				name_surfix = "(DQ)";
				break;
			case ScoreState.DidNotFinish:
				name_surfix = "(DNF)";
				break;
			}

			if (v.round !== selectedRound && selectedRound !== 0)
				return;
			Rows.push({
				Id: v.id,
				A: v.alphas,
				C: v.charlies,
				D: v.deltas,
				Miss: v.misses,
				Name: `${v.shooter.name} ${name_surfix}`,
				NoShoots: v.noshoots,
				Popper: v.poppers ?? 0,
				ProErrors: v.proErrorCount,
				Time: v.time,
				HitFactor: parseInt(v.hitFactor).toFixed(2),
				Precentage: `${v.roundPrecentage.toFixed(1)}%`,
			});
		});
		setRowData([...Rows]);
	}
	const [selectedRound, setSelectedRound] = React.useState(0);

	const [joinShooterDialogOpem, setJoinShooterDialogOpem] = React.useState(false);
	function openJoinShooterDialog() {
		setJoinShooterDialogOpem(true);
	}
	function closeJoinShooterDialog() {
		setJoinShooterDialogOpem(false);
	}
	
	// #region grid

	function onSelectedRoundChange(newRound: number) {
		setSelectedRound(newRound);
	}
	const [rowData, setRowData] = React.useState<ScoreItem[]>();
 
	// Column Definitions: Defines the columns to be displayed.
	const [colDefs] = React.useState<ColDef<ScoreItem>[]>([
		{ field: "Id", hide: true },
		{ field: "Name", flex: 500, pinned: true },
		{ field: "A", minWidth: 5 },
		{ field: "C", minWidth: 5 },
		{ field: "D", minWidth: 5 },
		{ field: "Miss" },
		{ field: "NoShoots", minWidth: 100 },
		{ field: "Popper", minWidth: 80 },
		{ field: "ProErrors", minWidth: 100 },
		{ field: "Time" },
		{ field: "HitFactor", flex: 2 },
		{ field: "Precentage", flex: 2 },
	]);

	const autoSizeStrategy = {
		type: "fitGridWidth",
	};
	const gridRef = React.useRef<AgGridReact>(null);
	const autoSizeAll = React.useCallback((skipHeader: boolean) => {
		const allColumnIds: string[] = [];
			gridRef.current!.api.getColumns()!.forEach((column) => {
				allColumnIds.push(column.getId());
			});
		gridRef.current!.api.autoSizeColumns(allColumnIds, skipHeader);
	}, []);

	function onRowClicked(event: RowClickedEvent<ScoreItem>) {
		router.push(`${id}/${event.data?.Id}`);
	}

	// #endregion
	React.useEffect(() => {
		refreshGrid();
	}, [selectedRound, query]);
	React.useEffect(() => {
		gridRef.current?.api.autoSizeAllColumns();
	}, [gridRef]);

	const getRowStyle = (params: RowClassParams<ScoreItem>) => {
		const State: ScoreState = query.data?.findUniqueScorelist?.scores[parseInt(params.node.id ?? "")].state;
		switch (State) {
		case "DQ":
			return { background: `${theme.palette.error[theme.palette.mode]}3f` };
		case "DidNotFinish":
			return { background: `${theme.palette.warning[theme.palette.mode]}3f` };
		case "DidNotScore":
			return;
		case "Scored":
			return { background: `${theme.palette.success[theme.palette.mode]}3f` };
		}
	};
	
	// #region error handling
	if (query.error)
		return <>
			ERROR: {JSON.stringify(query.error)}
		</>;
	
	if (!query.data?.findUniqueScorelist) 
		return <>
			Loading...
		</>;
	const data = query.data.findUniqueScorelist;	
	// #endregion
	return (
		<>
			<Box sx={{p:2}}>
				<Typography variant="h4">{`${new Date(data.stage?.createAt).toLocaleDateString()} ${data.stage?.name}`}</Typography>
			</Box>
			<Paper elevation={10} sx={{mt: 2}}>
				<Tabs variant="scrollable" value={selectedRound} onChange={(e, v) => onSelectedRoundChange(v)}>
					<Tab label="Overall" value={0} />
					{(() => {
						const tabList = [];
						for (let index = 0; index < data.rounds;  index++) {
							tabList.push(<Tab key={index} label={`Round ${index + 1}`} value={index + 1} />);
						}
						return tabList;
					})()}
				</Tabs>
				<div
					className="ag-theme-alpine-dark" // applying the grid theme
					style={{ height: 500 }} // the grid will fill the size of the parent container
				>
					<Button onClick={() => autoSizeAll(false)}>Resize the grid</Button>
					{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
					{/* @ts-ignore */}
					<AgGridReact
						ref={gridRef}
						rowData={rowData}
						onRowClicked={onRowClicked}
						columnDefs={colDefs}
						autoSizeStrategy={autoSizeStrategy}
						getRowStyle={getRowStyle}
					/>
				</div>
			</Paper>

			<SpeedDial
				ariaLabel="Scorelist operation"
				sx={{ position: "fixed", bottom: 20, right: 20 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Add round"}
					tooltipOpen
					onClick={addRround}
				/>
				<SpeedDialAction
					icon={<PersonAdd/>}
					tooltipTitle={"Join shooters"}
					tooltipOpen
					onClick={openJoinShooterDialog}
				/>
			</SpeedDial>
			
			<JoinShooterDialog
				open={joinShooterDialogOpem}
				onClose={closeJoinShooterDialog}
				scorelistId={id}
				round={selectedRound}
			/>
		</>
	);
}