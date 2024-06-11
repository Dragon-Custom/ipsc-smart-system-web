"use client";
import React from "react";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Maybe, Query, Team } from "@/gql/graphql";
// import { AgGridReact } from "ag-grid-react";
import ShooterCard from "./shooterCard";
import { Box, Divider, FormControl, Grid, InputLabel, List, MenuItem, Select, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from "@mui/material";
import { Add, Groups } from "@mui/icons-material";
import ShooterFormDialog from "./shooterFormDialog";
import { useRouter } from "next/navigation";
import { Shooter } from "../../gql/graphql";
import { useSearchParameters } from "@/hooks/useSearchParameters";
import TeamsManageDialog from "./teamsManageDialog";
import { useToggle } from "@uidotdev/usehooks";

const DataQuery = gql`
	query {
		shooters {
			id
			createAt
			name
			division
			email
			ranking
			rating
			elo
			team {
				id
				name
			}
		}
	}
`;

type SortOption = "Name" | "Division" | "Elo" | "Rank" | "Rating" | "Accuracy";
const SortOptions: SortOption[] = ["Name", "Division", "Elo", "Rank", "Rating", "Accuracy"];

const ShootersChangeSubscription = gql`
	subscription {
		shootersChange
	}
`;

export default function Shooters() {
	const { data, refetch } = useQuery<Query>(DataQuery);
	useSubscription(ShootersChangeSubscription, {
		onData() {
			refetch();
		},
	});
	const router = useRouter();
	
	const [createShooterFormOpen, setCreateShooterFormOpen] = React.useState(false);

	function onCreateShooterButtonClick() {
		setCreateShooterFormOpen(true);
	}

	function closeCreateShooterForm() {
		setCreateShooterFormOpen(false);
	}

	function onShooterCardClick(id: number) {
		router.push(`shooters/${id}`);
	}

	const [sortOption, setSortOption] = useSearchParameters<number>("sortby");

	const sortedData: Maybe<Shooter>[] | undefined = React.useMemo(() => {
		const sortOptionStr = SortOptions[sortOption ?? 0];
		switch (sortOptionStr) {
		case "Name":
			return data?.shooters?.toSorted(function (a, b) {
				if (!a?.name || !b?.name)
					return 0;
				if (a?.name < b?.name)
					return -1;
				if (a?.name > b?.name)
					return 1;
				return 0;
			});
		case "Division":
			return data?.shooters?.toSorted(function (a, b) {
				if (!a?.division || !b?.division)
					return 0;
				if (a?.division < b?.division)
					return -1;
				if (a?.division > b?.division)
					return 1;
				return 0;
			});
		case "Elo":
			return data?.shooters?.toSorted((a, b) => (b?.elo || 0) - (a?.elo || 0));
		case "Rank":
			return data?.shooters?.toSorted((a, b) => (b?.ranking || 0) - (a?.ranking || 0));
		case "Rating":
			return data?.shooters?.toSorted((a, b) => (b?.rating || 0) - (a?.rating || 0));
		case "Accuracy":
			return data?.shooters?.toSorted((a, b) => (a?.ratings?.[0]?.rating ?? 0) - (b?.ratings?.[0]?.rating ?? 0));
		default:
			return data?.shooters;
		}
	}, [data, sortOption]);

	const [teamsManageDialogOpen, toggleTeamsManageDialog] = useToggle(false);

	return (
		<>
			<Typography variant="h4" p={2}>Shooter list: </Typography>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<FormControl fullWidth>
						<InputLabel>Sort by:</InputLabel>
						<Select
							label="Sort by:"
							fullWidth
							defaultValue={sortOption ?? 0}
							onChange={(e) => setSortOption((e.target.value) as number)}
						>
							{SortOptions.map((v, k) => {
								return <MenuItem key={k} value={k}>{v}</MenuItem>;
							})}
						</Select>
					</FormControl>
				</Grid>
			</Grid>
			<List>
				{sortedData?.map((v, k) => {
					if (!v)
						return <></>;
					return <Box key={k}>
						<ShooterCard
							createDate={new Date(v.createAt).toLocaleDateString() + " " + new Date(v.createAt).toLocaleTimeString()}
							showMutationButton
							onClick={onShooterCardClick}
							division={v.division}
							id={v.id}
							name={v.name}
							email={v.email}
							elo={v.elo}
							rank={v.ranking}
							rating={v.rating}
							team={v.team as Team}
						/>
						<Divider sx={{ my: .5 }} />
					</Box>;
				})}
			</List>
			<SpeedDial
				ariaLabel="Shooters operation"
				sx={{ position: "fixed", bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create shooter"}
					tooltipOpen
					onClick={onCreateShooterButtonClick}
				/>
				<SpeedDialAction
					icon={<Groups/>}
					tooltipTitle={"Teams manage"}
					tooltipOpen
					onClick={toggleTeamsManageDialog as () => void}
				/>
			</SpeedDial>
			<ShooterFormDialog
				open={createShooterFormOpen}
				onClose={closeCreateShooterForm}
			/>
			<TeamsManageDialog
				open={teamsManageDialogOpen}
				onClose={toggleTeamsManageDialog}
			/>
		</>
	);
}
