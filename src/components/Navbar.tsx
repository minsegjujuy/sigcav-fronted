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
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setOpenDrawer(open);
  };

  const menuItems = ["Inicio", "Menu", "Mis actas", "Nueva acta"];

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
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
          >
            Seguridad vial
          </Typography>

          {/* Menú en pantallas grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {menuItems.map((item) => (
              <Button key={item} color="inherit">
                {item}
              </Button>
            ))}
          </Box>
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
                <ListItemText primary={item} />
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
