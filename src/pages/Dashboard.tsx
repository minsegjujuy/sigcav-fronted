import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard";
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import PeopleIcon from "@mui/icons-material/People";


const Dashboard = () => {
  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <ControlPointIcon />
          </ListItemIcon>
          <ListItemText primary="Nueva acta" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Mis actas" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Usuarios" />
        </ListItemButton>
      </ListItem>
    </List>
  )
}

export default Dashboard