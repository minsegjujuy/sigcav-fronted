import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Button,
  Stack
} from "@mui/material";
import { useEffect, useState } from "react";
import { listarHechosViales } from "../services/HechoVialService";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import ReusableModal from "../components/ui/modal/ReusableModal";
import { HechoVialDetalle } from "./HechoVialInforme";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';

export default function HechosVialesTable() {
  const [data, setData] = useState<HechoVialListDto[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HechoVialListDto>();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    const response = await listarHechosViales({
      page,
      size: rowsPerPage,
      fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
      fechaFin: fechaFin ? `${fechaFin}T23:59:59` : undefined,
    });
    console.log('res ', response)
    console.log('params ', fechaInicio, ' ', fechaFin)
    setData(response.content);
    setTotal(response.totalElements);
  };

  const handleDetails = (hv: HechoVialListDto) => {
    setOpen(true);
    setSelectedItem(hv);
  }

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  return (
    <Paper sx={{ p: 2 }}>
      <Button variant="contained" onClick={() => navigate('/dashboard/hechos-viales/nuevo')}>Cargar hecho vial <AddIcon /></Button>
      {/* 🔍 Filtros */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          type="date"
          label="Fecha inicio"
          InputLabelProps={{ shrink: true }}
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <TextField
          type="date"
          label="Fecha fin"
          InputLabelProps={{ shrink: true }}
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={() => {
            setPage(0);
            fetchData();
          }}
        >
          Filtrar
        </Button>
        <ReusableModal children={<HechoVialDetalle hecho={selectedItem!} />} onClose={()=>setOpen(false)} 
          open={open} title="INFORME DE HECHOS VIALES" />
      </Stack>

      {/* 📋 Tabla */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Ruta</TableCell>
              <TableCell>Dependencia</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Tipo Siniestro</TableCell>
              <TableCell>Víctima Fatal</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  {new Date(row.fecha).toLocaleString()}
                </TableCell>
                <TableCell>{row.ruta}</TableCell>
                <TableCell>{row.dependencia}</TableCell>
                <TableCell>{row.zona}</TableCell>
                <TableCell>{row.tipoSiniestro}</TableCell>
                <TableCell>{row.victimaFatal}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDetails(row)}>Ver informe</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📑 Paginación */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Paper>
  );
}
