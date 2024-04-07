"use client";
import { Add } from "@mui/icons-material";
import { Box, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import StageFormDialog from "./stageFormDialog";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Query } from "@/gql/graphql";
import StageCard from "./stageCard";






const FindManyStageQuery = gql`
	query{
		findManyStage {
			id
			name
			designer {
				name
			}
			description
			gunCondition
			imageId
			stageType
			createAt
			tags {
				id
				color
				title
			}
		}
	}
`;
const SubscriptStagesChangeSubscripton = gql`
	subscription {
		subscriptStagesChange
	}
`;



export default function Stages() {
	const allStage = useQuery<Query>(FindManyStageQuery);

	useSubscription(SubscriptStagesChangeSubscripton, {
		onData() {
			allStage.refetch();
		},
	});
	const [createStageFormOpen, setCreateStageFormOpen] = React.useState(false);
	const [tabIndex, setTabIndex] = React.useState("All");

	function onCreateStageButtonClick() {
		setCreateStageFormOpen(true);
	}

	function closeCreateStageForm() {
		setCreateStageFormOpen(false);
	}

	const onTabIndexChange = (event: React.SyntheticEvent, newValue: string) => {
		setTabIndex(newValue);
	};
	return (
		<>
			<Typography variant="h5" p={2}>Stage list: {tabIndex}</Typography>
			<Paper elevation={4}>
				<Box sx={{ display: "flex"}}>
					<Tabs
						value={tabIndex}
						onChange={onTabIndexChange}
						variant="scrollable"
						orientation="vertical"
					>
						<Tab label="All" value={"All"}/>
						<Tab label="Short" value={"Short"}/>
						<Tab label="Medium" value={"Medium"}/>
						<Tab label="Long" value={"Long"}/>
						<Tab label="Unsanctioned" value={"Unsanctioned"} sx={{
							overflowY: "hidden",
						}} />
					</Tabs>
					<Box sx={{ p: 1}} width={"100%"}>
						{!allStage.data ? <>Loading...</> : allStage.data?.findManyStage.map(v => {
							if (tabIndex == "All" || tabIndex == v.stageType)
								return (<StageCard
									key={v.id}
									id={v.id}
									name={v.name}
									designerName={v.designer.name}
									description={v.description ?? ""}
									gunConditon={v.gunCondition}
									imageId={v.imageId}
									stageType={v.stageType}
									createAt={v.createAt}
									tags={v.tags}
								/>);
						})}
					</Box>
				</Box>
			</Paper>

			<SpeedDial
				ariaLabel="Stage operation"
				sx={{ position: "fixed", bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create stage"}
					tooltipOpen
					onClick={onCreateStageButtonClick}
				/>
			</SpeedDial>
			<StageFormDialog
				open={createStageFormOpen}
				onClose={closeCreateStageForm}
			/>
		</>
	);
}