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
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import { deleteHechoVial, listarHechosViales } from "../services/HechoVialService";
import type { HechoVialListDto } from "../models/HechoVialListDto";
import ReusableModal from "../components/ui/modal/ReusableModal";
import { HechoVialDetalle } from "./HechoVialInforme";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { useHechoVial } from "../context/HechoVialContext";
import { mapHechoVialListDtoToForm } from "../utilities/mapHechoVialListToDto";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";

export default function HechosVialesTable() {
  const [data, setData] = useState<HechoVialListDto[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HechoVialListDto>();
  const [fechaInicio, setFechaInicio] = useState<string | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<string | undefined>(undefined);
  const [grupoId, setGrupoId] = useState<string | undefined>(undefined);
  const [victimaFatal, setVictimaFatal] = useState<string | undefined>(undefined);
  const [danosMateriales, setDanosMateriales] = useState<string | undefined>(undefined);
  const [soloLesionados, setSoloLesionados] = useState<boolean | undefined>(undefined);
  const navigate = useNavigate();
  const { setHechoVial } = useHechoVial();

  const fetchData = async () => {
    const response = await listarHechosViales({
      page,
      size: rowsPerPage,
      fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00` : undefined,
      fechaFin: fechaFin ? `${fechaFin}T23:59:59` : undefined,
      grupoId: grupoId,
      danosMateriales: danosMateriales,
      victimaFatal: victimaFatal,
      soloLesionados: soloLesionados
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

  const editar = (hecho: HechoVialListDto) => {
    console.log('hv selected ' , hecho)
    setHechoVial(mapHechoVialListDtoToForm(hecho));
    navigate(`/dashboard/hechos-viales/modificacion/${hecho.id}`);
  };

  const deleteItem = async (id: number) => {
    const confirmed = window.confirm('¿Estás seguro que deseas eliminar este hecho vial?');

    if (!confirmed) return;

    await deleteHechoVial(id);
    SnackbarUtilities.success('Se eliminó el hecho vial');
    await fetchData();
  };

  /*const limpiarFiltros = () => {
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setGrupoId(undefined);
    setDanosMateriales(undefined);
    setVictimaFatal(undefined);
    fetchData();
  }*/

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  return (
    <Paper sx={{ p: 2 }}>
      <Button variant="contained" onClick={() => navigate('/dashboard/hechos-viales/nuevo')}>Cargar hecho vial <AddIcon /></Button>
      {/* 🔍 Filtros */}
      <Stack direction="row" spacing={2} mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha inicio"
              InputLabelProps={{ shrink: true }}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha fin"
              InputLabelProps={{ shrink: true }}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </Grid>
          
          {/* Usamos size en lugar de xs/sm como propiedades separadas */}
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Grupo</InputLabel>
              <Select
                value={grupoId}
                label="Grupo"
                onChange={(e) => setGrupoId(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">Grupo 1</MenuItem>
                <MenuItem value="2">Grupo 2</MenuItem>
                <MenuItem value="3">Grupo 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Víctima Fatal</InputLabel>
              <Select
                value={victimaFatal}
                label="Víctima Fatal"
                onChange={(e) => setVictimaFatal(e.target.value)}
              >
                <MenuItem value="">Ambos</MenuItem>
                <MenuItem value="SI">Sí</MenuItem>
                <MenuItem value="NO">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Daños Materiales</InputLabel>
              <Select
                value={danosMateriales}
                label="Daños Materiales"
                onChange={(e) => setDanosMateriales(e.target.value)}
              >
                <MenuItem value="">Ambos</MenuItem>
                <MenuItem value="SI">Sí</MenuItem>
                <MenuItem value="NO">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              sx={{ ml: 1 }}
              control={
                <Switch
                  size="small"
                  checked={soloLesionados}
                  onChange={(e) => setSoloLesionados(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="textSecondary">
                  Solo Heridos Leve/Grave
                </Typography>
              }
            />
        </Grid>

        <Button
          variant="contained"
          onClick={() => {
            setPage(0);
            fetchData();
          }}
        >
          Filtrar
        </Button>
        </Grid>
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
              <TableCell>Graduacion alcoholica</TableCell>
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
                <TableCell>{row.protagonistas.map(data => data.graduacionAlcoholica)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDetails(row)}>Ver informe</Button>
                  <Button onClick={() => editar(row)}><EditIcon/></Button>
                  <Button onClick={() => deleteItem(row.id)}><DeleteIcon /></Button>
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
