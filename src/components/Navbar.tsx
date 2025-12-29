import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store/Store";
import { logout } from "../redux/slice/AuthSlice";

const menuItems = [
  { label: "INICIO", to: "/dashboard" },
  { label: "MIS ACTAS", to: "/dashboard/mis-actas" },
  { label: "NUEVA ACTA", to: "/dashboard/nueva-acta" }
];

const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  }

  const toggleDrawer = (open: boolean) => () => {
    setOpenDrawer(open);
  };

  // Estilo para los botones NavLink activos (usando la clase .active que NavLink aplica)
  const linkButtonSx = {
    color: "inherit",
    textTransform: "none",
    "&.active": {
      bgcolor: "action.selected", // pequeño highlight cuando está activo
    },
  };

  return (
    <>
      <AppBar position="sticky" color="primary" sx={{ boxShadow: 2 }}>
        <Toolbar>
          {/* Botón de menú para móviles */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Título del sitio */}
          <Typography
            variant="h6"
            component={NavLink}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            SEGURIDAD VIAL JUJUY
          </Typography>

          {/* Menú en pantallas grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={linkButtonSx}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Button onClick={handleLogout} variant="contained">Cerrar sesión</Button>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral (solo móvil) */}
      <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.to}
                  // NavLink aplicará la clase 'active' cuando corresponda
                  sx={{
                    "&.active": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
