import { AppBar, IconButton, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { AccountCircle } from "@mui/icons-material";
import AccountMenu from "./AccountMenu";
import { useState } from "react";
import { RootState } from "../redux/store";


export default function NavBar() {

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
  const username = useAppSelector((state: RootState) => state.userInfo.username);

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  }

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  }

  return (
    <AppBar position='relative'>
      <div style={{ display: 'flex', justifyContent:'space-between', padding: '10px 20px', alignItems: 'center'}}>
      <Typography component={Link} to={'/'} variant="h6" sx={{ textDecoration: 'none', color: 'white' }}>CodeDuel</Typography>
      { loggedIn ? 
      <div style={{display: 'flex', alignItems: 'center'}}>
      <Typography>{username}</Typography>
      <IconButton onClick={handleOpenMenu}>
        <AccountCircle />
      </IconButton>
      </div>
      :
      <Typography component={Link} to={'/login'} variant="h6" sx={{ textDecoration: 'none', color: 'white' }}>Log in</Typography>
      }
      </div>
      <AccountMenu anchor={menuAnchor} handleClose={handleCloseMenu} />
    </AppBar>
    );
}