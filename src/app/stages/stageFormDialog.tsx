import ImageCropper from "@/components/ImageCropper";
import { Mutation, MutationCreateOneStageArgs, MutationUpdateOneStageArgs, Query } from "@/gql/graphql";
import useGraphqlImage from "@/hooks/useGraphqlImage";
import { gql, useMutation, useQuery } from "@apollo/client";
import { FileUpload } from "@mui/icons-material";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputAdornment, InputLabel, MenuItem,   Select, Stack, TextField,  styled } from "@mui/material";
import React from "react";




const StageAttr = styled(Grid)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
	...theme.typography.caption,
	padding: theme.spacing(1),
	textAlign: "center",
	color: theme.palette.text.secondary,
}));
const VisuallyHiddenInput = styled("input")({
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: 1,
	overflow: "hidden",
	position: "absolute",
	bottom: 0,
	left: 0,
	whiteSpace: "nowrap",
	width: 1,
});


const FindManyShooterQuery = gql`
	query {
		findManyShooter {
			id
			name
		}
	}
`;

const CreateOneStageMutation = gql`
	mutation($data: StageCreateInput!){
		createOneStage(data: $data) {
			id
		}
	}
`;
const UpdateOneStageMutation = gql`
	mutation($where: StageWhereUniqueInput!, $data: StageUpdateInput!){
		updateOneStage(where: $where,data: $data) {
			id
		}
	}
`;


export interface StageFormData {
	name: string;
	description: string;
	designer: string;
	papers: string;
	noshoots: string;
	poppers: string;
	gunCondition: string;
	walkthroughTime: string;
}

function extactFromData(event: React.FormEvent<HTMLFormElement>) {
	const formData = new FormData(event.currentTarget);
	return Object.fromEntries((formData).entries()) as unknown as StageFormData;
}

type ImageID = string;
async function uploadImage(base64url: string): Promise<ImageID> {
	const formdata = new FormData();
	formdata.append("0", new File([await (await fetch(base64url)).blob()], "12.jpeg"));
	formdata.append("map", "{\"0\": [\"variables.image\"]}");
	formdata.append("operations", "{\"query\": \"mutation ($image: File!) {  uploadImage(image: $image) }\"}");

	const requestOptions = {
		method: "POST",
		body: formdata,
		redirect: "follow",
	};

	const response = await (await fetch("https://dragoncustom.onflashdrive.app:2087/graphql", requestOptions as RequestInit)).json();
	return response.data.uploadImage;
}
export interface StageFormDialogProps {
	onClose: () => void;
	open: boolean;
	//if editStage not null => the dialog gets into edit mode
	editStage?: {
		id: number;
		imageId: string;
		name: string;
		description?: string;
		designerId: number;
		papers: number;
		noshoots: number;
		poppers: number;
		gunCondition: number;
		walkthroughTime: number;
	}
}
export default function StageFormDialog(props: StageFormDialogProps) {
	const allShooter = useQuery<Query>(FindManyShooterQuery);
	const [createStage] = useMutation<Mutation["createOneStage"], MutationCreateOneStageArgs>(CreateOneStageMutation);
	const [updateStage] = useMutation<Mutation["updateOneStage"], MutationUpdateOneStageArgs>(UpdateOneStageMutation);
	const [stageAttr, setStageAttr] = React.useState({
		minRounds: 0,
		maxScore: 0,
		stageType: "Short",
	});
	const [cropperOpen, setCropperOpne] = React.useState(false);
	const [stageImage, setStageImage] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	let edit_image: string;
	if (props.editStage)
		edit_image = useGraphqlImage(props.editStage.imageId);

	React.useEffect(() => {
		allShooter.refetch();
		setStageImage(edit_image ?? "");
	}, [props]);

	async function onCreateStageFormSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		const formData = extactFromData(event);
		console.log(formData);
		const papers = parseInt(formData.papers);
		const poppers = parseInt(formData.poppers);
		const noshoots = parseInt(formData.noshoots);
		const gunCondition = parseInt(formData.gunCondition);
		const designer = parseInt(formData.designer);
		const walkthroughTime = parseInt(formData.walkthroughTime);
		let img_id = props.editStage?.imageId ?? "";
		if (edit_image !== stageImage) {
			img_id = await uploadImage(stageImage);
		}

		if (props.editStage) {
			await updateStage({
				variables: {
					data: {
						image: {
							connect: {
								id: img_id,
							},
						},
						name: {
							set: formData.name,
						},
						description: {
							set: formData.description,
						},
						papers: {
							set: papers,
						},
						poppers: {
							set: poppers,
						},
						noshoots: {
							set: noshoots,
						},
						gunCondition: {
							set: gunCondition,
						},
						designer: {
							connect: {
								id: designer,
							},
						},
						walkthroughTime: {
							set: walkthroughTime,
						},
					},
					where: {
						id: props.editStage.id,
					},
				},
			});
		} else {
			await createStage({
				variables: {
					data: {
						image: {
							connect: {
								id: img_id,
							},
						},
						name: formData.name,
						description: formData.description,
						papers,
						poppers,
						noshoots,
						gunCondition,
						designer: {
							connect: {
								id: designer,
							},
						},
						walkthroughTime,
					},
				},
			});
		}
		setLoading(false);
		props.onClose();
	}

	function onCreateStageFormChange(event: React.FormEvent<HTMLFormElement>) {
		const formData = extactFromData(event);
		console.log(formData);
		const papers = parseInt(formData.papers);
		const poppers = parseInt(formData.poppers);
		const minRounds = papers * 2 + poppers;
		let stage_type: string;
		if (minRounds <= 12) 
			stage_type = "Short";
		else if (minRounds <= 24)
			stage_type = "Medium";
		else if (minRounds <= 32)
			stage_type = "Long";
		else
			stage_type = "Unsanctioned";
		setStageAttr({
			minRounds,
			maxScore: papers * 2 * 5 + poppers * 5,
			stageType: stage_type,
		});
	}

	const onPicturePassIn = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target?.files)
			return;
		console.log(e.target?.files[0]);
		setCropperOpne(true);
		const reader = new FileReader();
		reader.onloadend = function() {
			setStageImage(reader.result as string);
		};
		reader.readAsDataURL(e.target?.files[0]);
	};
	function onImageCropperClose() {
		setCropperOpne(false);
	}
	function onImageCropperChange(base64url: string) {
		setStageImage(base64url);
	}

	return (
		<>
			<Backdrop
				open={loading}
				sx={{
					zIndex: 1000000000000,
				}}
			>
				<CircularProgress />
			</Backdrop>
			<ImageCropper
				open={cropperOpen}
				onClose={onImageCropperClose}
				aspectRatio={3 / 2}
				imageSrc={stageImage}
				onChange={onImageCropperChange}
			/>
			<Dialog
				maxWidth="md"
				onClose={props.onClose}
				open={props.open}
				PaperProps={{
					component: "form",
					onSubmit: onCreateStageFormSubmit,
					onChange: onCreateStageFormChange,
				}}
			>
				{props.editStage ?
					<DialogTitle>Edit stage</DialogTitle> :
					<DialogTitle>Craete new stage</DialogTitle>
				}
				<DialogContent>
					<Stack gap={2}>
						<Button
							variant="outlined"
							startIcon={<FileUpload />}
							component="label"
						>
							<VisuallyHiddenInput type="file" accept="image/*" onChange={onPicturePassIn} name="image"/>
							Upload the stage picture
						</Button>
						<img src={stageImage} />
						<TextField
							autoFocus
							required
							name="name"
							label="Name"
							type="text"
							fullWidth
							variant="outlined"
							defaultValue={props.editStage?.name}
						/>
						<TextField
							name="description"
							label="Description"
							type="text"
							multiline
							fullWidth
							variant="outlined"
							defaultValue={props.editStage?.description}
						/>
						<FormControl fullWidth required>
							<InputLabel>Designer</InputLabel>
							<Select
								name="designer"
								label="Designer"
								defaultValue={props.editStage?.designerId ?? 1}
							>
								{!allShooter.data ?
									<MenuItem value={1}>Loading shooter list...</MenuItem> :
									allShooter.data?.findManyShooter.map((v) =>
										<MenuItem value={v.id} key={v.id}>{v.name}</MenuItem>,
									)
								}
							</Select>
						</FormControl>
						<Grid container justifyContent={"space-around"} spacing={1}>
							<Grid item xs={12/2} sm={12/3}>
								<TextField
									fullWidth
									required
									name="papers"
									label="Papers"
									type="number"
									variant="outlined"
									inputProps={{
										min: 0,
									}}
									defaultValue={props.editStage?.papers}
								/>
							</Grid>
							<Grid item xs={12/2} sm={12/3}>
								<TextField
									fullWidth
									required
									name="noshoots"
									label="No-shoots"
									type="number"
									variant="outlined"
									inputProps={{
										min: 0,
									}}
									defaultValue={props.editStage?.noshoots}
								/>
							</Grid>
							<Grid item xs={12} sm={12/3}>
								<TextField
									fullWidth
									required
									name="poppers"
									label="Popper"
									type="number"
									variant="outlined"
									inputProps={{
										min: 0,
									}}
									defaultValue={props.editStage?.poppers}
								/>
							</Grid>
						</Grid>
						<FormControl fullWidth required>
							<InputLabel>Gun condition</InputLabel>
							<Select
								name="gunCondition"
								label="Gun condition"
								defaultValue={props.editStage?.gunCondition ?? 1}
							>
								{[1, 2, 3].map(v =>
									<MenuItem value={v} key={v}>Condition {v}</MenuItem>,
								)}
							</Select>
						</FormControl>
						<TextField
							fullWidth
							required
							name="walkthroughTime"
							label="Walkthrough time"
							type="number"
							variant="outlined"
							InputProps={{
								inputProps: {
									min: 0,
								},
								endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
							}}
							defaultValue={props.editStage?.walkthroughTime}
						/>
						<Grid container borderRadius={1}>
							<StageAttr item borderRadius={"inherit"} xs={12/2} sm={12/3}>Max. score: {stageAttr.maxScore}</StageAttr>
							<StageAttr item borderRadius={"inherit"} xs={12/2} sm={12/3}>Min. rounds: {stageAttr.minRounds}</StageAttr>
							<StageAttr item borderRadius={"inherit"} xs={12} sm={12/3}>Stage type: {stageAttr.stageType}</StageAttr>
						</Grid>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={props.onClose}>Cancel</Button>
					{props.editStage ?
						<Button type="submit">Edit</Button> :
						<Button type="submit">Create</Button>
					}
				</DialogActions>
			</Dialog>
		</>
	);
}