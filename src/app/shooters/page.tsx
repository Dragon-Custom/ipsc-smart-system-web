"use client";
import React from "react";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Maybe, Query } from "@/gql/graphql";
// import { AgGridReact } from "ag-grid-react";
import ShooterCard from "./shooterCard";
import { Box, Divider, FormControl, Grid, InputLabel, List, MenuItem, Select, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import ShooterFormDialog from "./shooterFormDialog";
import { useRouter } from "next/navigation";
import { Shooter } from "../../gql/graphql";
import { useSearchParameters } from "@/hooks/useSearchParameters";

const DataQuery = gql`
	query {
		shooters {
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
				tick
			}
			ratings {
				id
				shooterId
				rating
				updatedAt
				createAt
				tick
			}
			elo {
				id
				elo
				updatedAt
				createAt
				tick
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
			return data?.shooters?.toSorted((a, b) => {
				const aLastestElo = a?.elo?.[a?.elo?.length - 1]?.elo || 0;
				const bLastestElo = b?.elo?.[b?.elo?.length - 1]?.elo || 0;
				return bLastestElo - aLastestElo;
			});
		case "Rank":
			return data?.shooters?.toSorted((a, b) => {
				const aLastestRank = a?.rankings?.[a?.rankings?.length - 1]?.rank || 0;
				const bLastestRank = b?.rankings?.[b?.rankings?.length - 1]?.rank || 0;
				return aLastestRank - bLastestRank;
			});
		case "Rating":
			return data?.shooters?.toSorted((a, b) => {
				const aLastestRating = a?.ratings?.[a?.ratings?.length - 1]?.rating || 0;
				const bLastestRating = b?.ratings?.[b?.ratings?.length - 1]?.rating || 0;
				return bLastestRating - aLastestRating;
			});
		case "Accuracy":
			return data?.shooters?.toSorted((a, b) => (a?.ratings?.[0]?.rating ?? 0) - (b?.ratings?.[0]?.rating ?? 0));
		default:
			return data?.shooters;
		}
	}, [data, sortOption]);

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
							elo={v.elo?.[v.elo?.length - 1]?.elo ?? 0}
							rank={v.rankings?.[v.rankings?.length - 1]?.rank ?? 0}
							rating={v.ratings?.[v.ratings?.length - 1]?.rating ?? 0}
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
			</SpeedDial>
			<ShooterFormDialog
				open={createShooterFormOpen}
				onClose={closeCreateShooterForm}
			/>
		</>
	);
}
