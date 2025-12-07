import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from "@mui/material";
import { getRegistrostalonarios } from "../services/RegistroTalonarioService";
import type { RegistroTalonario } from "../models/RegistroTalonario";


const RegistroTalonario = () => {
  const [searchParams] = useSearchParams();
  const idTal = Number(searchParams.get("idTal"));

  const [registros, setRegistros] = useState<RegistroTalonario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!idTal) {
          setError("No se encontró idTal en la URL");
          setLoading(false);
          return;
        }

        const data = await getRegistrostalonarios(idTal);
        setRegistros(data);
      } catch (e) {
        setError("Error al cargar los registros");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idTal]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" p={2}>
        Registros del talonario {idTal}
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID Registro</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {registros.map((r) => (
            <TableRow key={r.idReg}>
              <TableCell>{r.idReg}</TableCell>
              <TableCell>{r.nro}</TableCell>
              <TableCell>{r.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RegistroTalonario;
