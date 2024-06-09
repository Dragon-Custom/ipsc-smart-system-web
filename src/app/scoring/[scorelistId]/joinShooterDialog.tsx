"use client";

import { Mutation, MutationCopyShootersFromRoundToRoundArgs, MutationCreateEmptyScoreArgs, Query } from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useLoading } from "mui-loading";
import React from "react";

const FetchQuery = gql`
	query Shooters {
		shooters {
			id
			name
		}
	}
`;

const CreateEmptyScore = gql`
	mutation CreateEmptyScore($shooterId:Int!,$scorelistId:Int!,$round:Int!) {
		createEmptyScore(shooterId: $shooterId, scorelistId: $scorelistId, round: $round) {
			id
		}
	}
`;

interface JoinShooterDialogProps {
    open: boolean;
	onClose: () => void;
	scorelistId: number;
	round: number;
	selectedRound: number
}

const CopyShootersFromRoundToRoundMutation = gql`
	mutation($scorelistId: Int!, $srcRound: Int!, $destRound:Int!) {
		copyShootersFromRoundToRound(scorelistId: $scorelistId, srcRound: $srcRound, destRound:$destRound)
	}
`;

export default function JoinShooterDialog(props: JoinShooterDialogProps) {
	const query = useQuery<Query>(FetchQuery);
	const [createScore] = useMutation<Mutation["createEmptyScore"], MutationCreateEmptyScoreArgs>(CreateEmptyScore);
	const [selectedShooters, setSelectedShooters] = React.useState<number[]>([]);
	const loading = useLoading();

	function onSelectedShootersChange(val: number[]) {
		setSelectedShooters(val);
	}

	const [copyShootersFromRoundToRound] = useMutation<Mutation["copyShootersFromRoundToRound"], MutationCopyShootersFromRoundToRoundArgs>(CopyShootersFromRoundToRoundMutation);
	async function copyFromPreviousRound() {
		loading?.startLoading();
		try {
			await copyShootersFromRoundToRound({
				variables: {
					scorelistId: props.scorelistId,
					srcRound: props.selectedRound - 1,
					destRound: props.selectedRound,
				},
			});
		} finally {
			loading?.stopLoading();
		}
	}


	async function joinShooter() {
		loading?.startLoading({
			color: "info",
		});
		for (const v of selectedShooters) {
			await createScore({
				variables: {
					round: props.round,
					shooterId: v,
					scorelistId: props.scorelistId,
				},
			});
		}
		props.onClose();
		loading?.stopLoading();
	}
	if (!query.data?.shooters)
		return <>Loading...</>;
	const data = query.data?.shooters;
	return (
		<>
			<Dialog fullWidth maxWidth="md" open={props.open} onClose={props.onClose}>
				<DialogTitle>Join Shooter</DialogTitle>
				<DialogContent>
					<FormControl fullWidth sx={{mt: 1}}>
						<InputLabel>Select shooter</InputLabel>
						<Select
							fullWidth
							label="Select shooter"
							multiple value={selectedShooters}
							renderValue={(selected) =>
								selected.map(v =>
									data.find(i => v == i?.id))
									.map(v => `${v?.name}`)
									.join(", ")
							}
							onChange={(e) => onSelectedShootersChange(e.target.value as number[])}
						>
							{data.map(v => {
								if (!v) return <></>;
								return <MenuItem value={v.id} key={v.id}>
									<Checkbox checked={selectedShooters.indexOf(v.id) > -1} />
									{v.name}
								</MenuItem>;
							})}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={copyFromPreviousRound}>Join from previous round</Button>
					<Button onClick={props.onClose}>Cancel</Button>
					<Button onClick={joinShooter}>Join</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}