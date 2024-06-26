"use client";
import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, Paper, Slider, Stack } from "@mui/material";
import Cropper, { Area, Point } from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";

export const dynamic = "auto";
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = "auto";
export const runtime = "edge";
export const preferredRegion = "auto";

export interface ImageCropperProps {
	open: boolean;
	onClose: () => void;
	onChange: (base64img: string) => void;
	aspectRatio: number;
	imageSrc: string;
}
export default function ImageCropper(props: ImageCropperProps) {
	const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState(1);
	const [rotation, setRotation] = React.useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area>();


	function onCropComplete(croppedArea: Area, croppedAreaPixels: Area) {
		setCroppedAreaPixels(croppedAreaPixels);
	}

	async function onSubmit() {
		try {
			const croppedImage = await getCroppedImg(
				props.imageSrc,
				croppedAreaPixels,
				rotation,
			);
			props.onChange(croppedImage ?? "");
			props.onClose();
		} catch (e) {
			console.error(e);
			alert(`Error: ${JSON.stringify(e)}`);
		}
	}

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			maxWidth={"md"}
			fullWidth
		>
			<DialogTitle>Crop the image</DialogTitle>
			<DialogContent>
				<div style={{
					display: "flex",
					flex: "auto",
					flexDirection: "column",
				}}>
					<div style={{
						position: "relative",
						height: "35vh",
					}}>
						<Cropper
							maxZoom={10}
							minZoom={0.1}
							image={props.imageSrc}
							crop={crop}
							zoom={zoom}
							rotation={rotation}
							aspect={props.aspectRatio}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
							objectFit={"cover"}
						/>
					</div>
					<Stack>
						<FormControl>
							<FormLabel>Rotation</FormLabel>
							<Slider
								value={rotation}
								min={0}
								max={360}
								onChange={(e,v) => setRotation(v as number)}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Zoom</FormLabel>
							<Slider
								min={0}
								max={10}
								step={0.0001}
								value={zoom}
								onChange={(e,v) => setZoom(v as number)}
							/>
						</FormControl>
					</Stack>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose}>Cancel</Button>
				<Button onClick={onSubmit}>Confirm</Button>
			</DialogActions>
		</Dialog>
	);
}