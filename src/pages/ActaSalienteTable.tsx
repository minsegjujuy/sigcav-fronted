import React, { useCallback, useEffect, useState } from "react";
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
  IconButton,
} from "@mui/material";
import type { ActaSalienteDto } from "../models/ActaSalienteDto";
import { actualizarActaSaliente, crearActaSaliente, descargarExcelActas, obtenerActasSalientes } from "../services/ActaSalienteService";
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
import DownloadIcon from "@mui/icons-material/Download";

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
  const [recibo, setRecibo] = useState("");

  const fetchData = useCallback(async () => {
    //setLoading(true);
    try {
      //console.log("ANTES", dniFilter);
      const params = {
        page: page.toString(),
        size: rowsPerPage.toString(),
        dni: dniFilter,
        nroActa: nroActaFilter,
        recibo: recibo,
        nombre: nombre
      };
      //console.log('params', params, ' ' , dniFilter)

      const {content, totalElements} = await obtenerActasSalientes(params);

      setData(content);
      setTotal(totalElements);
    } catch (error) {
      console.error("Error fetching actas salientes", error);
    } finally {
      //setLoading(false);
    }
  }, [page, rowsPerPage, dniFilter, nroActaFilter, recibo, nombre]);

  const fetchJuzgados = async () => {
    const data = await obtenerJuzgados();
    setJuzgados(data);
  }

  const handleOpen = () => {
    setOpen(true);
    setAction('create')
  }

  const handleSubmit = async (acta: ActaSalienteRequest) => {
    const actaParaEnviar: ActaSalienteRequest = {
      ...acta,
      actas: acta.actas.map((detalle) => ({
        ...detalle,
        fechaActa: detalle.fechaActa ? `${detalle.fechaActa}T00:00:00` : detalle.fechaActa,
      })),
    };

    if(action === 'edit'){
      await actualizarActaSaliente(actaParaEnviar)
    }else{
      await crearActaSaliente(actaParaEnviar);
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

  const handleDownload = async () => {
    console.log('recibo ', recibo)
    await descargarExcelActas(recibo);
  };

  useEffect(() => {
    fetchData();
    fetchJuzgados();
  }, [fetchData]);

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
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Button variant="contained" fullWidth onClick={handleOpen}>
              Nueva
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              variant="contained"
              fullWidth
              disabled={recibo === ""}
            >
              Excel
            </Button>
          </Grid>
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
              label="N° Recibo"
              value={recibo}
              onChange={(e) => setRecibo(e.target.value)}
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Lugar</TableCell>
                <TableCell>Juzgado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Recibo</TableCell>
                <TableCell>Dictamen</TableCell>
                <TableCell>Actas</TableCell>
                <TableCell>Infractor</TableCell>
                <TableCell>DNI Infractor</TableCell>
                <TableCell>Retención</TableCell>
                <TableCell>Descargo</TableCell>
                <TableCell>Fojas</TableCell>
                <TableCell>Expediente</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row: ActaSalienteDto) => (
                <TableRow key={row.id} hover>
                  {/* 1. ID */}
                  <TableCell>{row.id}</TableCell>
                  
                  {/* 2. Lugar */}
                  <TableCell>{row.lugar}</TableCell>
                  
                  {/* 3. Juzgado */}
                  <TableCell>{row.juzgado}</TableCell>
                  
                  {/* 4. Fecha */}
                  <TableCell>{row.fecha}</TableCell>
                  
                  {/* 5. Recibo */}
                  <TableCell>{row.recibo}</TableCell>
                  
                  {/* 6. Dictamen */}
                  <TableCell>{row.dictamen}</TableCell>
                  
                  {/* 7. Acta (Detalles) */}
                  <TableCell>
                    {row.actas.map((detalle, index) => (
                      <div key={index} style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                        • <strong>{detalle.nroActa}</strong> ({detalle.tipo})
                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>{detalle.articulado}</div>
                      </div>
                    ))}
                  </TableCell>
                  
                  {/* 8. Infractor */}
                  <TableCell>{row.nombreInfractor}</TableCell>
                  
                  {/* 9. DNI Infractor */}
                  <TableCell>{row.dni}</TableCell>
                  
                  {/* 10. Retencion */}
                  <TableCell>{row.retencion ? "Sí" : "No"}</TableCell>
                  
                  {/* 11. Descargo */}
                  <TableCell>{row.descargo ? "Sí" : "No"}</TableCell>
                  
                  {/* 12. Fojas */}
                  <TableCell>{row.cantidadFojas}</TableCell>
                  
                  {/* 13. Expediente */}
                  <TableCell>{row.expediente}</TableCell>

                  {/* 14. Acciones */}
                  <TableCell>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',          // Espacio uniforme entre botones
                    flexWrap: 'nowrap',   // Evita que se rompan en filas (o úsalo en 'wrap' si la pantalla es muy pequeña)
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}>
                    {/* Botón Editar */}
                    <IconButton 
                      color="primary" 
                      size="small"
                      onClick={() => handleEdit(row)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    {/* Botón Estado (Asumiendo que internamente usa un botón o icono) */}
                    <CambiarEstadoButton
                      actaId={row.id}
                      onSuccess={fetchData}
                    />

                    {/* Botón Historial */}
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        navigate(`/actas-salientes/${row.id}`);
                        setActaSeleccionada(row);
                      }}
                      title="Ver historial"
                    >
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </div>
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
