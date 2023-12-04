import { AppBar, Typography } from "@mui/material";
import { Link } from "react-router-dom";


export default function NavBar() {

  return (
    <AppBar position='relative'>
      <div style={{ display: 'flex', justifyContent:'space-between', padding: '10px 20px', alignItems: 'center'}}>
      <Typography component={Link} to={'/'} variant="h6" sx={{ textDecoration: 'none', color: 'white' }}>CodeDuel</Typography>
      <Typography component={Link} to={'/login'} variant="h6" sx={{ textDecoration: 'none', color: 'white' }}>Log in</Typography>
      </div>
    </AppBar>
    );
}