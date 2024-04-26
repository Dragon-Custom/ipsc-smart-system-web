"use client";
import React from "react";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Query } from "@/gql/graphql";
// import { AgGridReact } from "ag-grid-react";
import ShooterCard from "./shooterCard";
import { Box, Divider, List, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import ShooterFormDialog from "./shooterFormDialog";
import { useRouter } from "next/navigation";

const FindManyShooterQuery = gql`
	query FindManyShooter{
		findManyShooter {
			division
			id
			createAt
			name
			email
		}
	}
`;


const SubscriptShootersChangeSubscription = gql`
	subscription SubscriptShootersChange{
    	subscriptShootersChange
	}
`;

export default function Shooters() {
	const { data, refetch } = useQuery<Query>(FindManyShooterQuery);
	useSubscription(SubscriptShootersChangeSubscription, {
		onData() {
			refetch();
		},
		shouldResubscribe: false,
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

	return (
		<>
			<Typography variant="h4" p={2}>Shooter list: </Typography>
			<List>

				{data?.findManyShooter.toSorted((a, b) => (a.id - b.id)).map((v, k) => (
					<Box key={k}>
						<ShooterCard
							createDate={new Date(v.createAt).toLocaleDateString() + " " + new Date(v.createAt).toLocaleTimeString()}
							showMutationButton
							{...v}
							onClick={onShooterCardClick}
						/>
						<Divider sx={{ my: .5}} />
					</Box>
				))}
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
