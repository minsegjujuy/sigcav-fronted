import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";
import type { AppDispatch } from "../redux/store/Store";
import { useDispatch } from "react-redux";
import { loginAction } from "../redux/slice/AuthSlice";

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState<AuthenticationRequest>({
    username: "",
    password: "",
  });
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
    setData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
        const authResponse = await login(data!);
        dispatch(loginAction(authResponse.jwt));
        navigate("/dashboard");
        alert('Usuario autenticado')
    }catch(error){
        console.error(error, data)
        alert('Credenciales incorrectas')
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
         <TextField
            label="Usuario"
            name="username"
            fullWidth
            required
            margin="normal"
            value={data.username}
            onChange={handleChange}
            />
        <TextField
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={data.password}
            onChange={handleChange}
            />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Ingresar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}