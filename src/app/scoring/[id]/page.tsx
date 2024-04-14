"use client";
import { Mutation, MutationUpdateOneScorelistArgs, Query, QueryFindUniqueScorelistArgs } from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Add, PersonAdd } from "@mui/icons-material";
import { Box, Button, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, Typography } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "next/navigation";
import React from "react";
import {
	ColDef,
} from "@ag-grid-community/core";

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
}

export default function ScorelistPage() {
	const router = useParams();
	const id = parseInt(router.id as string);
	if (isNaN(id))
		return <>
			Error: youve pass a invaild scorelist id
		</>;
	
	useSubscription(SubscriptScorelistChange, {
		onData() {
			query.refetch();
		},
	});
	useSubscription(SubscriptScoreChange, {
		onData() {
			query.refetch();
		},
	});
	const [updateScorelist] = useMutation<Mutation["updateOneScorelist"], MutationUpdateOneScorelistArgs>(UpdateOneScorelist);
	const query = useQuery<Query, QueryFindUniqueScorelistArgs>(FetchQuery, {
		variables: {
			where: {
				id,
			},
		},
		onCompleted(data) {
			refreshGrid();
		},
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
			if (v.round !== selectedRound && selectedRound !== 0)
				return;
			Rows.push({
				A: v.alphas,
				C: v.charlies,
				D: v.deltas,
				Miss: v.misses,
				Name: v.shooter.name,
				NoShoots: v.noshoots,
				Popper: v.poppers ?? 0,
				ProErrors: v.proErrorCount,
				Time: v.time,
				HitFactor: parseInt(v.hitFactor).toFixed(2),
				Precentage: `${v.roundPrecentage.toFixed(1)}%`,
			});
		});
		setRowData(Rows);
	}
	const [selectedRound, setSelectedRound] = React.useState(0);

	React.useEffect(() => {
		refreshGrid();
	}, [selectedRound]);
	// #region grid

	function onSelectedRoundChange(newRound: number) {
		setSelectedRound(newRound);
	}
	const [rowData, setRowData] = React.useState<ScoreItem[]>();
 
	// Column Definitions: Defines the columns to be displayed.
	const [colDefs] = React.useState<ColDef<ScoreItem>[]>([
		{ field: "Name", flex: 500, pinned: true},
		{ field: "A",  minWidth: 5},
		{ field: "C",  minWidth: 5},
		{ field: "D",  minWidth: 5},
		{ field: "Miss" },
		{ field: "NoShoots", minWidth: 100},
		{ field: "Popper", minWidth: 80},
		{ field: "ProErrors", minWidth: 100},
		{ field: "Time" },
		{ field: "HitFactor", flex: 2},
		{ field: "Precentage", flex: 2},
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
	// #endregion

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
				<Tabs value={selectedRound} onChange={(e, v) => onSelectedRoundChange(v)}>
					<Tab label="Overall" value={0} />
					{(() => {
						const tabList = [];
						for (let index = 0; index < data.rounds;  index++) {
							tabList.push(<Tab key={index} label={`Round ${index + 1}`} value={index + 1} />);
						}
						return tabList;
					})()}
				</Tabs>
			</Paper>
			<div
				className="ag-theme-alpine-dark" // applying the grid theme
				style={{ height: 500 }} // the grid will fill the size of the parent container
			>
				<Button onClick={() => autoSizeAll(false)}>Resize the grid</Button>
				<AgGridReact
					ref={gridRef}
					rowData={rowData}
					columnDefs={colDefs}
					autoSizeStrategy={autoSizeStrategy}
				/>
			</div>

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
					// onClick={openCreateScorelistDialog}
				/>
			</SpeedDial>
		</>
	);
}