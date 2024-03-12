import { Inbox } from "@mui/icons-material";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SwipeableDrawer,
} from "@mui/material";
import { usePathname } from "next/navigation";
import React from "react";
import { NextLinkComposed } from "../NextJSLint";

export interface GlobalLayoutSideBarProps {
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const ROUTE_LIST = [
    {
        title: "1",
        icon: <Inbox />,
        url: "/",
    },
];

export default function GlobalLayoutSideBar(props: GlobalLayoutSideBarProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const pathname = usePathname();

    React.useEffect(() => {
        setSelectedIndex(ROUTE_LIST.findIndex((v) => (v.url == pathname)));
    },[])

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
            >
                <List sx={{ width: "35vw" }}>
                    {ROUTE_LIST.map((v, k) => {
                        return (
                            <ListItemButton
                                key={k}
                                selected={selectedIndex === k}
                                onClick={(event) => {
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
            </SwipeableDrawer>
        </>
    );
}
