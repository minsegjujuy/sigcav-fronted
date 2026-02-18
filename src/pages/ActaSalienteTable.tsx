import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import type { ActaSalienteDto } from "../models/ActaSalienteDto";
import { actualizarActaSaliente, crearActaSaliente, obtenerActasSalientes } from "../services/ActaSalienteService";
import { CambiarEstadoButton } from "../components/containers/CambiarEstadoButton";
import ReusableModal from "../components/ui/modal/ReusableModal";
import FormActaSaliente, { type ActaSalienteRequest } from "./FormActaSaliente";
import type { Juzgado } from "../models/Juzgado";
import { obtenerJuzgados } from "../services/JuzgadoService";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import EditIcon from '@mui/icons-material/Edit';
import { mapActaSalienteDtoToRequest } from "../utilities/mapActaSalienteRequestToDto";
import { useNavigate } from "react-router-dom";
import { useActaSaliente } from "../context/ActaSalienteContext";
import HistoryIcon from '@mui/icons-material/History';

const ActaSalienteTable: React.FC = () => {
  const [data, setData] = useState<ActaSalienteDto[]>([]);
  const { setActaSeleccionada } = useActaSaliente();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ActaSalienteRequest>();
  //const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [juzgados, setJuzgados] = useState<Juzgado[]>([]);
  const [action, setAction] = useState<'edit' | 'create'>('create');

  const [dniFilter, setDniFilter] = useState("");
  const [nroActaFilter, setNroActaFilter] = useState("");
  const [nombre, setNombre] = useState("");

  const fetchData = async () => {
    //setLoading(true);
    try {
      console.log("ANTES", dniFilter);
      const params = {
        page: page.toString(),
        size: rowsPerPage.toString(),
        dni: dniFilter,
        nroActa: nroActaFilter,
        nombre: nombre
      };
      console.log('params', params, ' ' , dniFilter)

      const {content, totalElements} = await obtenerActasSalientes(params);

      setData(content);
      setTotal(totalElements);
    } catch (error) {
      console.error("Error fetching actas salientes", error);
    } finally {
      //setLoading(false);
    }
  };

  const fetchJuzgados = async () => {
    const data = await obtenerJuzgados();
    setJuzgados(data);
  }

  const handleOpen = () => {
    setOpen(true);
    setAction('create')
  }

  const handleSubmit = async (acta: ActaSalienteRequest) => {
    console.log(acta);
    if(action === 'edit'){
      await actualizarActaSaliente(acta)
    }else{
      await crearActaSaliente(acta);
    }
    SnackbarUtilities.success('acta guardada correctamente')
    fetchData();
  }

  const handleEdit = (acta: ActaSalienteDto) => {
    console.log('data ', acta)
    setAction('edit')
    setOpen(true)
    setSelectedItem(mapActaSalienteDtoToRequest(acta, 1));
  }

  useEffect(() => {
    fetchData();
    fetchJuzgados();
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actas salientes
        </Typography>
        <Grid size={{xs:12, md:4}}>
          <Button variant="outlined" onClick={handleOpen} >Nueva</Button>
        </Grid>
        <ReusableModal open={open} children={<FormActaSaliente action={action} defaultValues={selectedItem} onSubmit={handleSubmit} juzgados={juzgados} />} 
        onClose={()=>setOpen(false)} /> 
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{xs:12, md:4}}>
            <TextField
              label="DNI"
              value={dniFilter}
              onChange={(e) => setDniFilter(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <TextField
              label="N° Acta"
              value={nroActaFilter}
              onChange={(e) => setNroActaFilter(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid size={{xs:12, md:4}} sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              type="button"
              value="Buscar"
              onClick={handleSearch}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Lugar</TableCell>
              <TableCell>Legajo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Recibo</TableCell>
              <TableCell>Dictamen</TableCell>
              <TableCell>N° Acta</TableCell>
              <TableCell>Fecha Acta</TableCell>
              <TableCell>Nombre Infractor</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Articulado</TableCell>
              <TableCell>Retención</TableCell>
              <TableCell>Descargo</TableCell>
              <TableCell>Cantidad Fojas</TableCell>
              <TableCell>Juzgado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row: ActaSalienteDto) => (
              <TableRow key={row.id} hover 
              >
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.lugar}</TableCell>
                <TableCell>{row.legajo}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell>{row.recibo}</TableCell>
                <TableCell>{row.dictamen}</TableCell>
                <TableCell>{row.nroActa}</TableCell>
                <TableCell>{row.fechaActa}</TableCell>
                <TableCell>{row.nombreInfractor}</TableCell>
                <TableCell>{row.dni}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.articulado}</TableCell>
                <TableCell>{row.retencion ? "Sí" : "No"}</TableCell>
                <TableCell>{row.descargo ? "Sí" : "No"}</TableCell>
                <TableCell>{row.cantidadFojas}</TableCell>
                <TableCell>{row.juzgado}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => 
                      handleEdit(row)
                    }
                  >
                    <EditIcon />
                  </Button>

                  <CambiarEstadoButton
                    actaId={row.id}
                    onSuccess={fetchData}
                  />
                  <Button
                    onClick={() => {
                      navigate(`/actas-salientes/${row.id}`);
                      setActaSeleccionada(row)
                    }}
                  >
                    <HistoryIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

        {/* Pagination */}
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
      </CardContent>
    </Card>
  );
};

export default ActaSalienteTable;
