import { Drawer, Typography } from "@mui/material"
import { useState } from "react"
import NavListDrawer from "../components/NavListDrawer"
import { useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slice/AuthSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { name, rol } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  }

  return (
    <>
      <Typography variant="h4">Bienvenido {name} con rol {rol}</Typography>
      <button onClick={handleLogout}>Cerrar sesion</button>
      <button onClick={()=> setOpen(true)}>Menu</button>
      <Drawer open={open} anchor="bottom" onClose={()=> setOpen(false)}>
        <NavListDrawer />
      </Drawer>
    </>
  )
}

export default Dashboard