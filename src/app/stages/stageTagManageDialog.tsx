import { Mutation, MutationDeleteOneStageTagArgs, Query } from "@/gql/graphql";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Delete, Edit } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, ListItemButton, ListItemText, Stack } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import React from "react";


const FindManyStageTagsQuery = gql`
	query {
		findManyStageTag {
			color
			id
			title
		}
	}
`;

const SubscriptStageTagsChangeSubscription = gql`
	subscription {
		subscriptStageTagsChange
	}
`;

const DeleteOneStageTagMutation = gql`
	mutation($where: StageTagWhereUniqueInput!) {
		deleteOneStageTag(where: $where) {
			id
		}
	}
`;


export interface StageTagManageDialogProps {
	onClose: () => void;
	open: boolean;
}
export default function StageTagManageDialog(props: StageTagManageDialogProps) {
	const tags = useQuery<Query>(FindManyStageTagsQuery);
	useSubscription(SubscriptStageTagsChangeSubscription, {
		onData() {
			tags.refetch();
		},
	});
	const [ deleteTag ] = useMutation<Mutation["deleteOneStageTag"], MutationDeleteOneStageTagArgs>(DeleteOneStageTagMutation);
	const muiConfirm = useConfirm();

	function onDeleteTagClick(tagId: number) {
		muiConfirm({
			title: "Are you sure you want to delete the tag?",
			content: "this will cause the stage that are using this tag lose the tag",
		})
			.then(() => {
				deleteTag({
					variables: {
						where: {
							id: tagId,
						},
					},
				});
			}).catch();
	}

	return (
		<>
			<Dialog
				open={props.open}
				onClose={props.onClose}
				maxWidth={"xs"}
				fullWidth
			>
				<DialogTitle>Stage tag manager</DialogTitle>
				{tags.data ? 
					<DialogContent>
						<Stack>
							{tags.data.findManyStageTag.map(v => {
								return (
									<ListItemButton key={v.id} onClick={() => onDeleteTagClick(v.id)}>
										<ListItemText>
											<Chip
												key={v.id}
												sx={{
													backgroundColor: v.color,
												}}
												label={v.title}
											/>
										</ListItemText>
										<IconButton>
											<Edit/>
										</IconButton>
										<IconButton>
											<Delete/>
										</IconButton>
									</ListItemButton>
								);
							})}
							<Button size={"large"} fullWidth variant="outlined">Add a tag</Button>
						</Stack>
					</DialogContent>
					: <>Loading...</>}
			</Dialog>
		</>
	);
}