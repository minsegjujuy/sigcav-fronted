import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { Link } from "react-router-dom";

const NavListDrawer = () => {
  return (
    <nav>
  <List>
    <ListItem disablePadding>
      <ListItemButton component={Link} to="/dashboard/nueva-acta">
        <ListItemIcon>
          <ControlPointIcon />
        </ListItemIcon>
        <ListItemText primary="Nueva acta" />
      </ListItemButton>
    </ListItem>

    <ListItem disablePadding>
      <ListItemButton component={Link} to="/dashboard/mis-actas">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Mis actas" />
      </ListItemButton>
    </ListItem>

    <ListItem disablePadding>
      <ListItemButton component={Link} to="/dashboard/usuarios">
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Usuarios" />
      </ListItemButton>
    </ListItem>
  </List>
</nav>

  )
}

export default NavListDrawer