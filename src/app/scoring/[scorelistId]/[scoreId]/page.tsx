"use client";
import Timer from "@/app/timer/timer";
import { Mutation, MutationUpdateOneScoreArgs, ProErrorsStoreCreateWithoutScoreInput, Query, QueryFindUniqueScoreArgs, ScoreState } from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Add, Remove } from "@mui/icons-material";
import { Button, ButtonGroup, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { useLongPress, useToggle } from "@uidotdev/usehooks";
import { useConfirm } from "material-ui-confirm";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import ProErrorDialog, { ProErrorRecord } from "./proErrorDialog";


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
		findManyProErrorObjects {
			description
            id
            index
            title
		}
		findManyDqObjects {
			category
			description
			id
			index
			title
		}
	}
`;

const UpdateOneScoreMutation = gql`
	mutation($data: ScoreUpdateInput!, $where: ScoreWhereUniqueInput!) {
		updateOneScore(data: $data, where: $where) {
			id
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
					onChange={(e) => props.onChange ? props.onChange("set", parseFloat(e.target.value)) : {}}
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
	const params = useParams();
	const router = useRouter();
	const id = parseInt(params.scoreId as string);
	const [updateScore] = useMutation<Mutation["updateOneScore"], MutationUpdateOneScoreArgs>(UpdateOneScoreMutation);
	const confirm = useConfirm();
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
	const displayTime = React.useMemo(() => time.toFixed(2), [time]);

	const [timerDialogOpen, setTimerDialogOpen] = React.useState(false);
	function openTimerDialog() {
		setTimerDialogOpen(true);
	}
	function closeTimerDialog() {
		setTimerDialogOpen(false);
	}
	const paperCount = React.useMemo(() => {
		const count: PaperData = {
			a: 0,
			c: 0,
			d: 0,
			m: 0,
			ns: 0,
		};
		paperData.forEach((v) => {
			count.a += v.a;
			count.c += v.c;
			count.d += v.d;
			count.m += v.m;
			count.ns += v.ns;
		});
		return count;
	}, [paperData]);

	const [dqDialogOpen, toggleDqDialogOpen] = useToggle(false);
	const [selectedDqCategory, setSelectedDqCategory] = React.useState("");
	const [selectedDqReason, setSelectedDqReason] = React.useState(0);
	async function dq(event: Event) {
		event.preventDefault();
		await updateScore({
			variables: {
				data: {
					state: {
						set: ScoreState.Dq,
					},
					dqReason: {
						connect: {
							id: selectedDqReason,
						},
					},
				},
				where: {
					id,
				},
			},
		});
		router.back();
	}
	function dnf() {
		confirm({
			title: "Are you sure you want to set the score to DNF?",
			confirmationButtonProps: {
				color: "error",
				variant: "contained",
			},
		}).then(async() => {
			await updateScore({
				variables: {
					data: {
						state: {
							set: ScoreState.DidNotFinish,
						},
					},
					where: {
						id,
					},
				},
			});
			router.back();
		}).catch();
	}
	async function review() {
		confirm({
			title: "Please check the score are filled correctly",
			content:
				<>
					<Typography>A: {paperCount.a}</Typography>
					<Typography>C: {paperCount.c}</Typography>
					<Typography>D: {paperCount.d}</Typography>
					<Typography>M: {paperCount.m}</Typography>
					<Typography>NS: {paperCount.ns}</Typography>
					<Typography>PE: {proErrosCount}</Typography>
					<Typography>PP: {popper}</Typography>
					<Typography>Score: {totalScore}</Typography>
					<Typography>Time: {time}</Typography>
					<Typography>Hit factor: {hitFactor}</Typography>
				</>
			,
			confirmationButtonProps: {
				color: "success",
				variant: "contained",
			},
		}).then(async () => {
			const proErrorData: ProErrorsStoreCreateWithoutScoreInput[] = proError.map((v) => {
				return {
					count: v.count,
					proError: {
						connect: {
							id: v.id,
						},
					},
				};
			});
			await updateScore({
				variables: {
					data: {
						state: {
							set: ScoreState.Scored,
						},
						alphas: {
							set: paperCount.a,
						},
						charlies: {
							set: paperCount.c,
						},
						deltas: {
							set: paperCount.d,
						},
						misses: {
							set: paperCount.m,
						},
						noshoots: {
							set: paperCount.ns,
						},
						poppers: {
							set: popper,
						},
						time: {
							set: time,
						},
						proErrorCount: {
							set: proErrosCount,
						},
						proErrors: {
							create: proErrorData,
						},
					},
					where: {
						id,
					},
				},
			});
			router.back();
		}).catch();
	}

	const [proErrorOpen, toggleProErrorOpen] = useToggle(false);
	const [proError, setProError] =	React.useState<ProErrorRecord[]>([]);

	const proErrosCount = React.useMemo(() => {
		let count = 0;
		proError.forEach(v => count += v.count);
		return count;
	}, [proError]);
	const totalScore = React.useMemo(() => {
		return (paperCount.a * 5 + paperCount.c * 3 + paperCount.d + popper * 5 )- (paperCount.m * 10) - (paperCount.ns * 10) - (proErrosCount * 10);
	}, [paperData, popper, proErrosCount]);
	const hitFactor = React.useMemo(() => {
		const hitFactor = totalScore / time;
		if (isNaN(hitFactor))
			return 0;
		return hitFactor;
	}, [totalScore, time]);
	
	if (!query.data?.findUniqueScore)
		return <>Loading...</>;

	const data = query.data.findUniqueScore;
	return (
		<>
			{query.data?.findManyDqObjects ?
				<Dialog
					open={dqDialogOpen}
					onClose={() => toggleDqDialogOpen()}
					keepMounted
					maxWidth="md"
					fullWidth
					PaperProps={{
						component: "form",
						onSubmit: dq,
					}}
				>
					<DialogTitle>Select DQ Reason</DialogTitle>
					<DialogContent>
						<Stack gap={2} sx={{pt:2}}>
							<FormControl>
								<InputLabel>DQ Catergory</InputLabel>
								<Select
									label="DQ Catergory"
									required
									fullWidth
									value={selectedDqCategory}
									onChange={(v) => setSelectedDqCategory(v.target.value)}
								>
									{Object.keys(Object.groupBy(query.data?.findManyDqObjects, ({ category }) => category)).map(v => {
										return <MenuItem key={v} value={v} >{v}</MenuItem>;
									})}
								</Select>
							</FormControl>
							<FormControl>
								<InputLabel>DQ Reason</InputLabel>
								<Select
									required
									fullWidth
									value={selectedDqReason}
									label="DQ Reason"
									onChange={(v) => setSelectedDqReason(parseInt(v.target.value as string))}
								>
									{query.data?.findManyDqObjects.map(v => {
										if (v.category !== selectedDqCategory)
											return;
										return <MenuItem key={v.index} value={v.id} >{v.title}</MenuItem>;
									})}
								</Select>
							</FormControl>
							<Typography variant="h5">
								{query.data?.findManyDqObjects.find(v => v.id == selectedDqReason)?.description}
							</Typography>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => toggleDqDialogOpen()}>Cancel</Button>
						<Button variant="contained" color="error" type="submit">DQ</Button>
					</DialogActions>
				</Dialog>
				: <></>}
			<Dialog
				open={timerDialogOpen}
				onClose={closeTimerDialog}
				keepMounted
			>
				<Timer onAssign={(v) => { closeTimerDialog(); onTimeChange(v); }}/>
			</Dialog>
			<ProErrorDialog
				onClose={() => toggleProErrorOpen()}
				open={proErrorOpen}
				proErrors={query.data.findManyProErrorObjects}
				value={proError}
				onChange={setProError}
			/>
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
						<Grid container spacing={2} justifyContent={"space-between"} sx={{px: 2}}>
							<ScoreInputControll
								label="Time"
								InputProps={{ endAdornment: "s" }}
								hideDecreamentButton
								hideIncreamentButton
								name="time"
								value={displayTime}
								onChange={(a, v) => onTimeChange(v)}
							/>
							<Grid item xs={12} sm={6}>
								<Button fullWidth sx={{height:"100%"}} variant="outlined" onClick={openTimerDialog}>Open Timer</Button>
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
						<Button fullWidth variant="outlined" color="secondary" onClick={() => toggleProErrorOpen()}>Pro errors</Button>
						<ButtonGroup fullWidth variant="text">
							<Button variant="contained" color="error" onClick={() => toggleDqDialogOpen()}>DQ</Button>
							<Button variant="contained" color="warning" onClick={dnf}>DNF</Button>
							<Button variant="contained" color="success" onClick={review}>Review</Button>
						</ButtonGroup>
						<Typography sx={(theme) => {
							return {
								...theme.typography.button,
								background: theme.palette.background.default,
								width: "100%",
								p: 2,
								textAlign: "center",
							};
						}}>
							{paperCount.a}A {paperCount.c}C {paperCount.d}D {popper}PP {paperCount.m}M {paperCount.ns}NS {proErrosCount}PE {time}s {hitFactor}HF
						</Typography>
					</Stack>
				</Paper>
			</Container>
		</>
	);
}