import { Inbox } from "@mui/icons-material";
import {
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	SwipeableDrawer,
} from "@mui/material";
import { usePathname } from "next/navigation";
import React from "react";
import { NextLinkComposed } from "../NextJSLink";

export interface GlobalLayoutSideBarProps {
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const ROUTE_LIST = [
	{
		title: "Home page",
		icon: <Inbox />,
		url: "/",
	},
	{
		title: "Home page",
		icon: <Inbox />,
		url: "/",
	},
];

export default function GlobalLayoutSideBar(props: GlobalLayoutSideBarProps) {
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const pathname = usePathname();

	React.useEffect(() => {
		setSelectedIndex(ROUTE_LIST.findIndex((v) => (v.url == pathname)));
	},[]);

	return (
		<>
			<SwipeableDrawer
				anchor="left"
				open={props.open}
				onClose={props.onClose}
				onOpen={props.onOpen}
				ModalProps={{
					keepMounted: true,
				}}
				sx={{ m: 0, p: 0 }}
			>
				{/* <Container maxWidth="100px" sx={{ m: 0, p: 0 }}> */}
				<List sx={{ m: 0, p: 0, width: 200}}>
					{ROUTE_LIST.map((v, k) => {
						return (
							<ListItemButton
								key={k}
								selected={selectedIndex === k}
								onClick={() => {
									setSelectedIndex(k);
								}}
								component={NextLinkComposed}
								to={{
									pathname: v.url,
								}}
							>
								<ListItemIcon>{v.icon}</ListItemIcon>
								<ListItemText primary={v.title} />
							</ListItemButton>
						);
					})}
				</List>
				{/* </Container> */}
			</SwipeableDrawer>
		</>
	);
}
