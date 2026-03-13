import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store/Store";
import { logout } from "../redux/slice/AuthSlice";

type NavbarProps = {
  mode: "light" | "dark";
  onModeChange: (mode: "light" | "dark") => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: SvgIconComponent;
};

const menuItems: MenuItem[] = [
  { label: "INICIO", to: "/dashboard", icon: HomeIcon },
  { label: "MIS ACTAS", to: "/dashboard/mis-actas", icon: DescriptionIcon },
  { label: "NUEVA ACTA", to: "/dashboard/nueva-acta", icon: NoteAddIcon },
];

const Navbar: React.FC<NavbarProps> = ({ mode, onModeChange }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleModeToggle = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onModeChange(checked ? "dark" : "light");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleDrawer = (open: boolean) => () => {
    setOpenDrawer(open);
  };

  const linkButtonSx = {
    color: "inherit",
    textTransform: "none",
    borderRadius: 999,
    px: 1.25,
    "&.active": {
      bgcolor: "action.selected",
    },
  };

  return (
    <>
      <AppBar position="sticky" color="primary" sx={{ boxShadow: 2 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, gap: 0.5 }}>
          {/* Menu button (mobile) */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 0.5, display: { xs: "flex", md: "none" } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component={NavLink}
            to="/dashboard"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              mr: { xs: 0.5, md: 2 },
              ml: { xs: 0, md: 0 },
            }}
          >
            <LocalPoliceIcon sx={{ fontSize: 28 }} />
            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.6, lineHeight: 1 }}>
                SIGCAV
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.85,
                  mt: 0.1,
                  display: { xs: "none", sm: "block" },
                  lineHeight: 1,
                }}
              >
                Seguridad Vial Jujuy
              </Typography>
            </Box>
          </Box>

          {/* Desktop menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, flexGrow: 1 }}>
            {menuItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={linkButtonSx}
                  startIcon={<ItemIcon fontSize="small" />}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Spacer for mobile (keeps actions on the right) */}
          <Box sx={{ display: { xs: "block", md: "none" }, flexGrow: 1 }} />

          <Tooltip title={mode === "dark" ? "Modo oscuro" : "Modo claro"}>
            <Switch
              checked={mode === "dark"}
              onChange={handleModeToggle}
              sx={{ ml: 0.5, mr: 0.5 }}
              inputProps={{ "aria-label": "cambiar modo" }}
            />
          </Tooltip>

          <Button onClick={handleLogout} variant="contained" sx={{ borderRadius: 999 }}>
            Cerrar sesion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer (mobile) */}
      <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <LocalPoliceIcon fontSize="small" />
            <Typography sx={{ fontWeight: 800 }}>SIGCAV</Typography>
          </Box>

          <List>
            {menuItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <ListItem key={item.to} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={item.to}
                    sx={{
                      "&.active": { bgcolor: "action.selected" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <ItemIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
