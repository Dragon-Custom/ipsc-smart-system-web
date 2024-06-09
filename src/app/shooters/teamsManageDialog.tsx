import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export interface TeamsManageDialogProps {
	onClose: () => void;
	open: boolean;
}

export default function TeamsManageDialog(props: TeamsManageDialogProps) {
	return (
		<Dialog
			onClose={props.onClose}
			open={props.open}
			PaperProps={{
				component: "form",
				// onSubmit: onCreateShooterFormSubmit,
			}}
		>
			<DialogTitle>Teams manager</DialogTitle>
			<DialogContent>
			</DialogContent>
		</Dialog>
	);
}