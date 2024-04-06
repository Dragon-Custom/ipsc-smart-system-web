"use client";
import { Add } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import React from "react";
import StageFormDialog from "./stageFormDialog";



export default function Stages() {
	const [createStageFormOpen, setCreateStageFormOpen] = React.useState(false);


	function onCreateStageButtonClick() {
		setCreateStageFormOpen(true);
	}

	function closeCreateStageForm() {
		setCreateStageFormOpen(false);
	}

	return (
		<>
			Stages

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