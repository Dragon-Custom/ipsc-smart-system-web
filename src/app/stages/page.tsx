"use client";
import { Add, Tag } from "@mui/icons-material";
import { Box, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import StageFormDialog from "./stageFormDialog";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Query, StageTag } from "@/gql/graphql";
import StageCard from "./stageCard";
import StageTagManageDialog from "./stageTagManageDialog";


const FindManyStageQuery = gql`
	query Stages {
		stages {
			id
			createAt
			name
			description
			papers
			poppers
			noshoots
			gunCondition
			designerId
			walkthroughTime
			minRounds
			maxScore
			stageType
			designer {
				name
			}
			tags {
				id
				tag {
					id
					title
					color
				}
			}
			image {
				id
			}
		}
	}
`;
const StagesChangeSubscripton = gql`
	subscription {
		stagesChange
	}
`;
const StagesTagsChangeSubscripton = gql`
	subscription {
		stageTagsChange
	}
`;


export default function Stages() {
	const allStage = useQuery<Query>(FindManyStageQuery);

	useSubscription(StagesChangeSubscripton, {
		onData() {
			allStage.refetch();
		},
	});
	useSubscription(StagesTagsChangeSubscripton, {
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

	const [tagMgrOpen, setTagMgrOpen] = React.useState(false);
	function closeTagMgr() {
		setTagMgrOpen(false);
	}
	function openTagMgr() {
		setTagMgrOpen(true);
	}


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
						sx={{borderRight: 1, borderColor: "divider"}}
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
						{!allStage.data ? <>Loading...</> : allStage.data?.stages.map(v => {
							if ((tabIndex == "All" || tabIndex == v?.stageType) && v)
								return (<StageCard
									key={v.id}
									id={v.id}
									name={v.name}
									designerName={v.designer.name}
									description={v.description ?? ""}
									gunConditon={v.gunCondition}
									imageId={v.image.id}
									stageType={v.stageType}
									createAt={v.createAt}
									tags={v.tags?.map(v => v?.tag) as StageTag[]}
								/>);
						})}
					</Box>
				</Box>
			</Paper>

			<SpeedDial
				ariaLabel="Stage operation"
				sx={{ position: "fixed", bottom: 20, right: 20 }}
				icon={<SpeedDialIcon />}
			>
				<SpeedDialAction
					icon={<Add/>}
					tooltipTitle={"Create stage"}
					tooltipOpen
					onClick={onCreateStageButtonClick}
				/>
				<SpeedDialAction
					icon={<Tag/>}
					tooltipTitle={"Tag manager"}
					tooltipOpen
					onClick={openTagMgr}
				/>
			</SpeedDial>
			<StageTagManageDialog
				open={tagMgrOpen}
				onClose={closeTagMgr}
			>
			</StageTagManageDialog>
			<StageFormDialog
				open={createStageFormOpen}
				onClose={closeCreateStageForm}
			/>
		</>
	);
}