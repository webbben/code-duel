import { Logout, Settings } from "@mui/icons-material";
import { Avatar, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../router/router";
import { getAuth } from "firebase/auth";
import { useAppDispatch } from "../redux/hooks";
import { setUserInfo } from "../redux/userInfoSlice";

interface AccountMenuProps {
    anchor: null | Element,
    handleClose: Function,
}

export default function AccountMenu(props: AccountMenuProps) {

    const open = Boolean(props.anchor);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut();
        dispatch(setUserInfo({
            username: undefined,
            email: undefined,
            idToken: undefined,
            loggedIn: false
        }));
        navigate(routes.login);
    }

    return (
        <Menu
            anchorEl={props.anchor}
            id="account-menu"
            open={open}
            onClose={() => props.handleClose()}
            onClick={() => props.handleClose()}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                        },
                        '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                        },
            },
                }
            
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={() => console.log("profile")}>
                <Avatar /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => console.log("settings")}>
                <ListItemIcon>
                    <Settings fontSize="small" />
                </ListItemIcon>
                Settings
            </MenuItem>
            <MenuItem onClick={() => handleLogout()}>
                <ListItemIcon>
                    <Logout fontSize="small" />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    )
}