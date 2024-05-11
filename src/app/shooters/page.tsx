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

const DataQuery = gql`
	query {
		shooters {
			division
			id
			createAt
			name
			email
		}
	}
`;


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

	return (
		<>
			<Typography variant="h4" p={2}>Shooter list: </Typography>
			<List>
				{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-expect-error*/}
				{data?.shooters?.toSorted((a, b) => (a.id - b.id)).map((v, k) => {
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
