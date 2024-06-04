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
			}
			ratings {
				id
				shooterId
				rating
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

	const [sortOption, setSortOption] = React.useState<number>(0);

	const sortedData: Maybe<Shooter>[] | undefined = React.useMemo(() => {
		const sortOptionStr = SortOptions[sortOption];
		console.log("sortOption", sortOptionStr,sortOption,SortOptions);
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
			return data?.shooters?.toSorted((a, b) => (b?.elo?.[0]?.elo ?? 0) - (a?.elo?.[0]?.elo ?? 0) );
		case "Rank":
			return data?.shooters?.toSorted((a, b) => (a?.rankings?.[0]?.rank ?? 0) - (b?.rankings?.[0]?.rank ?? 0));
		case "Rating":
			return data?.shooters?.toSorted((a, b) => (b?.ratings?.[0]?.rating ?? 0) - (a?.ratings?.[0]?.rating ?? 0));
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
							onChange={(e) => setSortOption(e.target.value as number)}
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
							elo={v.elo?.[0]?.elo ?? 0}
							rank={v.rankings?.[0]?.rank ?? 0}
							rating={v.ratings?.[0]?.rating ?? 0}
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
