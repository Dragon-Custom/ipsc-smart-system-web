"use client";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Query } from "@/gql/graphql";
// import { AgGridReact } from "ag-grid-react";
import ShooterCard from "./shooterCard";
import { List, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

const FindManyShooterQuery = gql`
	query FindManyShooter{
		findManyShooter {
			division
			id
			createAt
			name
		}
	}
`;


export default function Shooters() {
	const { data } = useQuery<Query>(FindManyShooterQuery);
	return (
		<>
			<Typography variant="h4" p={2}>Shooter list: </Typography>
			<List>
				{data?.findManyShooter.map((v, k) => (
					<ShooterCard
						key={k}
						createDate={new Date(v.createAt).toLocaleDateString()}
						division={v.division}
						name={v.name}
						id={v.id}
						showMutationButton
					/>
				))}
			</List>
			<SpeedDial
				ariaLabel="Shooters operation"
				sx={{ position: "absolute", bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create shooter"}
					tooltipOpen
				/>
			</SpeedDial>
		</>
	);
}
