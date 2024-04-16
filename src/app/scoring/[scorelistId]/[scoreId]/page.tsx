"use client";
import { Query, QueryFindUniqueScoreArgs } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Add, Remove } from "@mui/icons-material";
import { Button, ButtonGroup, Chip, Container, Divider, Grid, IconButton, Paper, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { useLongPress } from "@uidotdev/usehooks";
import { useParams } from "next/navigation";
import React from "react";


const FetchQuery = gql`
	query($where: ScoreWhereUniqueInput!) {
		findUniqueScore(where: $where) {
			alphas
			charlies
			deltas
			hitFactor
			id
			misses
			noshoots
			poppers
			proErrorCount
			proErrors {
				count
				proError {
					title
					description
					id
				}
			}
			round
			roundPrecentage
			shooter {
				name
			}
			scorelist {
				stage {
					poppers
					papers
				}
			}
			time
		}
	}
`;


interface ScoreInputControllProps extends Omit<TextFieldProps<"standard">, "onChange"> {
	hideIncreamentButton?: boolean;
	hideDecreamentButton?: boolean;
	xs?: number;
	sm?: number;
	onChange?: (action: "add" | "set", value: number) => void;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ScoreInputControll = React.forwardRef(function ScoreInputControll(props: ScoreInputControllProps, ref) {
	return (
		<Grid item xs={props.xs ?? 12} sm={props.sm ?? 6}>
			<Stack direction={"row"} alignItems={"center"}>
				<Typography sx={{pr: 5}}>{props.label}: </Typography>
				<TextField
					inputProps={{
						min: 0,
					}}
					{...props}
					onChange={(e) => props.onChange ? props.onChange("set", parseInt(e.target.value)) : {}}
					fullWidth
					type="number"
				/>
				<Stack alignItems={"center"}>
					{!props.hideIncreamentButton ? <IconButton onClick={() => props.onChange ? props.onChange("add", 1) : {}}>
						<Add/>
					</IconButton> : <></>}
					{!props.hideDecreamentButton ? <IconButton onClick={() => props.onChange ? props.onChange("add", -1) : {}}>
						<Remove />
					</IconButton> : <></>}
				</Stack>
			</Stack>
		</Grid>
	);
});

type Zone = "a" | "c" | "d" | "m" | "ns";

type PaperAssignAction = (
	id: number,
	action: "reset" | "increament",
	zone: Zone,
) => void;
type PaperData = {
	a: number,
	c: number,
	d: number,
	m: number,
	ns: number,
};
interface PaperAssignItemProps {
	id: number;
	onChange: PaperAssignAction;
	value: PaperData;
}
let long_click_death_zone_flag = false;
function PaperAssignItem(props: PaperAssignItemProps) {

	const attrs = useLongPress(
		(e) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			props.onChange(props.id, "reset", e.target?.id);
			long_click_death_zone_flag = true;
		},
		{
			threshold: 500,
		},
	);

	const onClickHandler: React.MouseEventHandler = (e) => {
		if (long_click_death_zone_flag) {
			long_click_death_zone_flag = false;
			return;
		}
		props.onChange(props.id, "increament", e.currentTarget.id as Zone);
	};

	return (
		<Grid container sx={{
			backgroundColor: (theme) => {
				if (
					props.value.a +
					props.value.c +
					props.value.d +
					props.value.m
					== 2
				)
					return theme.palette.success[theme.palette.mode];
			},
		}}>
			<ButtonGroup variant="text" fullWidth size="large" sx={{
				borderTop: (theme) => `1px solid ${theme.palette.divider}`,
				borderRadius: 0,
			}}>
				<Grid item xs={12/6}>
					<Button fullWidth disabled>#{props.id + 1}</Button>
				</Grid>
				<Grid item xs={12/6}>
					<Button fullWidth id="a" {...attrs} onClick={onClickHandler}>{props.value.a}</Button>
				</Grid>
				<Grid item xs={12/6}>
					<Button fullWidth id="c" {...attrs} onClick={onClickHandler}>{props.value.c}</Button>
				</Grid>
				<Grid item xs={12/6}>
					<Button fullWidth id="d" {...attrs} onClick={onClickHandler}>{props.value.d}</Button>
				</Grid>
				<Grid item xs={12/6}>
					<Button fullWidth id="m" {...attrs} onClick={onClickHandler}>{props.value.m}</Button>
				</Grid>
				<Grid item xs={12/6}>
					<Button fullWidth id="ns" {...attrs} onClick={onClickHandler}>{props.value.ns}</Button>
				</Grid>
			</ButtonGroup>
		</Grid>
	);
}

export default function ScorePage() {
	const router = useParams();
	const id = parseInt(router.scoreId as string);
	if (isNaN(id))
		return <>
			Error: youve pass a invaild score id
		</>;
	
	const query = useQuery<Query, QueryFindUniqueScoreArgs>(FetchQuery, {
		variables: {
			where: {
				id,
			},
		},
		onCompleted(data) {
			const paperData: PaperData[] = [];
			for (let index = 0; index < (data?.findUniqueScore?.scorelist?.stage?.papers ?? 0); index++) {
				paperData.push({
					a: 0,
					c: 0,
					d: 0,
					m: 0,
					ns: 0,
				});
			}
			setPaperData(paperData);
			setPopper(data?.findUniqueScore?.scorelist?.stage?.poppers ?? 0);
		},
	});

	const [paperData, setPaperData] = React.useState<PaperData[]>([]);

	const PaperDataChange: PaperAssignAction = (id, act, zone) => {
		const newData = [...paperData];
		switch (act) {
		case "reset":
			newData[id][zone] = 0;
			break;
		case "increament":
			if (zone == "ns") {
				newData[id][zone] += 1;
				break;
			}
			if (
				newData[id].a +
					newData[id].c +
					newData[id].d +
					newData[id].m
					< 2
			) {
				newData[id][zone] += 1;
			}
			break;
		}
		setPaperData(newData);
	};

	const [popper, setPopper] = React.useState(0);
	function onPopperChange(action: "add" | "set", value: number) {
		switch (action) {
		case "add":
			setPopper(Math.abs((popper + value) % ((data.scorelist.stage?.poppers ?? 0) + 1)));
			break;
		case "set":
			setPopper(value);
			break;
		}
	}

	const [time, setTime] = React.useState(0);
	function onTimeChange(v: number) {
		setTime(v);
	}

	if (!query.data?.findUniqueScore)
		return <>Loading...</>;

	const data = query.data.findUniqueScore;
	return (
		<>
			<Container maxWidth="sm" sx={{height:"100%"}}>
				<Paper
					elevation={2}
					sx={{ height: "100%", py:2}}
					component= 'form'
					onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
						event.preventDefault();
					}}
				>
					<Stack spacing={2} sx={{height:"100%", mx: 2}} alignItems="center" > 
						<Typography variant="h5" align="center">Shooter: {data.shooter.name}</Typography>
						<Grid container spacing={0} justifyContent={"space-between"} sx={{px: 2}}>
							<ScoreInputControll
								label="Time"
								InputProps={{ endAdornment: "s" }}
								hideDecreamentButton
								hideIncreamentButton
								name="time"
								value={time}
								onChange={(a, v) => onTimeChange(v)}
							/>
							<Grid item xs={12} sm={6}>
								<Button fullWidth sx={{height:"100%"}}>Open Timer</Button>
							</Grid>
							<ScoreInputControll
								label="Poppers"
								defaultValue={data.scorelist.stage?.poppers}
								inputProps={{ min: 0, max: data.scorelist.stage?.poppers }}
								name="poppers"
								value={popper}
								onChange={onPopperChange}
								sm={12}
							/>
						</Grid>
						<Divider variant="fullWidth" sx={{width: "100%"}}>
							Papers
						</Divider>
						<Stack sx={{ width: "100%" }}>
							<Grid container>
								<ButtonGroup variant="text" fullWidth size="large" aria-label="Basic button group">
									<Grid item xs={12/6}/>
									<Grid item xs={12/6}>
										<Button fullWidth disableRipple>A</Button>
									</Grid>
									<Grid item xs={12/6}>
										<Button fullWidth disableRipple>C</Button>
									</Grid>
									<Grid item xs={12/6}>
										<Button fullWidth disableRipple>D</Button>
									</Grid>
									<Grid item xs={12/6}>
										<Button fullWidth disableRipple>M</Button>
									</Grid>
									<Grid item xs={12/6}>
										<Button fullWidth disableRipple>NS</Button>
									</Grid>
								</ButtonGroup>
							</Grid>
							{paperData.map((v, k) => <PaperAssignItem
								id={k}
								key={k}
								value={v}
								onChange={PaperDataChange}
							/>)}
						</Stack>
						<Button fullWidth variant="outlined" color="secondary">Pro errors</Button>
						<ButtonGroup fullWidth variant="text">
							<Button variant="contained" color="error">DQ</Button>
							<Button variant="contained" color="warning">DNF</Button>
							<Button variant="contained" color="success">Review</Button>
						</ButtonGroup>
					</Stack>
				</Paper>
			</Container>
		</>
	);
}