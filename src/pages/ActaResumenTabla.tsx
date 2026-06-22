import { useEffect, useRef, useState, useTransition, type SyntheticEvent } from "react";
import { descargarPdfActa, getResumenActas, getResumenActasPdf, getResumenActasPersonal } from "../services/ActaService";
import { Box, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tabs, Tooltip, Typography , useMediaQuery } from "@mui/material";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";
import FilterForm from "../components/FIlterUser";
import ScrollButton from "../components/ScrollFilter";
import type { UserFilter } from "../models/UserFilter";
import AutocompleteApi from "../components/containers/AutocompleteApi";
import Button from "../components/ui/button/Button";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import { useActa } from "../context/ActaResumenContext";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FORMAT } from "../utilities/formatDate";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import type { SortDirection, SortItem } from "../models/Sortitem";
import { TableSkeleton } from "../components/ui/skeletonTable/TableSkeleton";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTheme } from "@mui/material/styles";
import { useGetPuestosQuery } from "../redux/api/puestoApi";

const ActaResumenTable: React.FC = () => {
  const [actas, setActas] = useState<ActaResumenDto[]>([]);
  const { data: puesto = []} = useGetPuestosQuery();
  //const {articulos} = useArticulo();
  const [totalPages , setTotalPages] = useState(0);
  const [totalElements , setTotalElements] = useState(0);
  const { rol } = useSelector((state: RootState) => state.auth);
  const [showFilterUser, setShowFilterUser] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs().startOf("day"));
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs().startOf("day"));
  const [view, setView] = useState<0 | 1>(1);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const hasAutoActivatedQuickViewRef = useRef(false);
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 0, grupo:null, puesto:null,articulo:null, size:12});
    const [filtersPersonal, setFiltersPersonal] = useState<Record<string, any>>({
    page: 0});
  const navigate = useNavigate();
  const { seleccionarActa, limpiarActa } = useActa();
  const [descargando, setDescargando] = useState(false);
  const [sorts, setSorts] = useState<SortItem[]>([]);
  const [isPending, startTransition] = useTransition();
  

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    console.log(event.target)
    const realPage = value -1;
      setFilters(prev => ({
      ...prev,
      page: realPage,
    }));

    setFiltersPersonal(prev => ({
      ...prev,
      page: realPage,
    }));
  };

  const manejarDescarga = async () => {
    try {
      setDescargando(true);

      // 1. Llamamos a tu funciÃ³n adaptada
      // Supongamos que 'filtros' es tu estado de bÃºsqueda
      const blob = await getResumenActasPdf(filters);

      // 2. Creamos el link de descarga
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre del archivo con fecha actual
      const nombreArchivo = `Reporte_Actas_${new Date().toLocaleDateString()}.pdf`;
      link.setAttribute('download', nombreArchivo);
      
      document.body.appendChild(link);
      link.click();

      // 3. Limpieza de memoria
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      // AquÃ­ podrÃ­as mostrar una alerta de MUI (Snackbar)
    } finally {
      setDescargando(false);
    }
  };

  const handleFilterChange = (path: string, value: any) => {
    const keys = path.split(".");
    setFilters((prev ) => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const cleanFIlters = () => {
    setFilters({
      page:0,
      size:12,
      grupo:'',
      puesto:'',
      articulo:'',
      userId:'',
      infractor:'',
      nro:'',
      dni:'',
      fechaInicio:null,
      fechaFin:null,
      sort:null
    })
  }

  const fetchData = () => {
    // 2. Envolvemos todo en startTransition
    startTransition(async () => {
      try {
        let content: any[] = [];
        let totalPagesResult = 0;
        let totalElementsResult = 0;

        if (rol === 'PERSONAL') {
          const data = await getResumenActasPersonal(filtersPersonal);
          content = data.content;
          totalPagesResult = data.totalPages;
          totalElementsResult = data.totalElements;
          setShowFilterUser(true);
        } else {
          const data = await getResumenActas(filters);
          content = data.content;
          totalPagesResult = data.totalPages;
          totalElementsResult = data.totalElements;
        }

        // 3. Estas actualizaciones de estado se marcan como "transiciÃ³n"
        setTotalElements(totalElementsResult);
        setTotalPages(totalPagesResult);
        setActas(content);

      } catch (error) {
        console.error('Error al obtener resumen de actas', error);
      }
    });
  };

  const descargarActa = async (nro: string) => {
    const blob = await descargarPdfActa(nro);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `acta-${nro}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const getSortDirection = (
    field: string
  ): SortDirection | undefined => {
    return sorts.find(s => s.field === field)?.direction;
  };

  const setSort = () => {
    const sortParams: string[] = sorts.map(
      s => `${s.field},${s.direction}`
    );
    setFilters((prev) => ({...prev, sort: sortParams}));
    setFiltersPersonal((prev) => ({...prev, sort: sortParams}));
    console.log('sort ', sortParams)
  }

  const toggleSort = (field: string) => {
    console.log('entro a toggle sort ', field)
    setSorts(prev => {
      const existing = prev.find(s => s.field === field);

      if (!existing) {
        return [...prev, { field, direction: 'asc' }];
      }

      if (existing.direction === 'asc') {
        return prev.map(s =>
          s.field === field ? { ...s, direction: 'desc' } : s
        );
      }

      // si estaba desc, lo eliminamos
      return prev.filter(s => s.field !== field);
    });
    console.log('entro a set sort ', field)
    setSort();
  };


  const handleFilter = (filters: { infractor: string; nro: string, dni: string }) => {
    console.log("Filtros aplicados:", filters);
        setFiltersPersonal(prev => ({
      ...prev,
      nro: filters.nro,
      infractor: filters.infractor,
      dni: filters.dni
    }));

    setFilters(prev => ({
      ...prev,
      nro: filters.nro,
      infractor: filters.infractor,
      dni: filters.dni
    }));

  };

  const handleSelect = (e: SyntheticEvent<Element, Event>, option: UserFilter | null) => {
    console.log("Seleccionado:", option, ' event' , e.target);
    setFilters(prev => ({
      ...prev,
      userId: option?.idUser,
    }));
  };

  const canEdit = (fechaCreacion: string | Date): boolean => {
    const createdAt = new Date(fechaCreacion);
    const now = new Date();

    const limite = new Date(createdAt);
    if(rol === 'SECRETARIO' || 'ADMIN'){
      limite.setDate(limite.getDate() + 7); // +168 hs
    }else if (rol === 'PERSONAL'){
      limite.setDate(limite.getDate() + 1); // +24 hs
    }

    return now < limite;
  };

  const handleEdit = (acta: ActaResumenDto) => {
    seleccionarActa(acta);
    console.log('acta seleccionada ', acta)
    navigate('/dashboard/modificacion');
  }

  const handleChangeDate = (fecha: Dayjs | null, name: "fechaInicio" | "fechaFin") => {
    if(name === "fechaInicio"){
        setFechaInicio(fecha)
      }else{
        setFechaFin(fecha)
      }
    if (!fecha) {
      // si limpian el datepicker, sacamos el filtro
      setFilters(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
      return;
    }

    const formattedDate = fecha.format(FORMAT);

    setFilters(prev => ({
      ...prev,
      [name]: formattedDate,
    }));
  };


  useEffect(() => {
    if (!isSmallScreen) {
      hasAutoActivatedQuickViewRef.current = false;
      return;
    }

    if (hasAutoActivatedQuickViewRef.current) return;

    if (view === 1) {
      setView(0);
    }

    hasAutoActivatedQuickViewRef.current = true;
  }, [isSmallScreen, view]);

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };



  useEffect(() => {
    fetchData();
    limpiarActa();
    console.log('filters ', filters)
    console.log('filters para el personal', filtersPersonal)
  }, [filters, filtersPersonal]);

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Listado de Actas
      </Typography>
      {!showFilterUser && (
        <>
          <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Seleccionar grupo</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={filters?.grupo}
            label="Seleccionar grupo"
            onChange={(e) => handleFilterChange("grupo", e.target.value)}
          >
            <MenuItem value={1}>Grupo 1</MenuItem>
            <MenuItem value={2}>Grupo 2</MenuItem>
            <MenuItem value={3}>Grupo 3</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
        <InputLabel id="puesto-label">Puesto</InputLabel>
          <Select
          labelId="puesto-label"
          id="puesto"
          value={filters.puesto}
          label="Puesto"
          onChange={(e) => handleFilterChange("puesto",e.target.value)}
          >
          {puesto.map((p) => (
          <MenuItem key={p.idPuesto} value={p.idPuesto}>
          {p.nombre}
          </MenuItem>
          ))}
          </Select>
      </FormControl>
        {/* 
          <Autocomplete
          options={articulos}
          getOptionLabel={(a) => a.nro}
          onChange={handleAutoChange}  
          renderInput={(params) => (
            <TextField
              {...params}
              label="ArtÃ­culo"
              onChange={handleInputChange}    
            />
          )}
        />
        */}
        <AutocompleteApi onSelect={handleSelect} />
        </>
      )}
      <FilterForm onFilter={handleFilter}/>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ p: 3, width: 320 }}>
          <DatePicker
            label="Fecha inicio"
            value={fechaInicio}
            format="DD-MM-YYYY HH:mm:ss"
            name="fechaInicio"
            onChange={(newValue) => handleChangeDate(newValue, "fechaInicio")}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />

          <DatePicker
            label="Fecha fin"
            name="fechaFin"
            format="DD-MM-YYYY HH:mm:ss"
            value={fechaFin}
            onChange={(newValue) => handleChangeDate(newValue, "fechaFin")}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />
        </Box>
      </LocalizationProvider>
      <Button onClick={cleanFIlters}>Limpiar filtros</Button>
      {totalElements < 2000 && 
      <Button
        variant="outlined"
        startIcon={descargando ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        onClick={manejarDescarga}
        disabled={descargando}
      >
        {descargando ? "Generando PDF..." : "Exportar PDF"}
      </Button>}
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Cantidad de actas: {totalElements}
      </Typography>

        <Tabs
          value={view}
          onChange={(_, newValue) => setView(newValue as 0 | 1)}
          variant={isSmallScreen ? "fullWidth" : "standard"}
          sx={{ mb: 2 }}
        >
          <Tab label="Vista rapida" />
          <Tab label="Vista completa" />
        </Tabs>

      {/*Cards*/}
      {view === 0 && (
        <Box sx={{ flexGrow: 1 }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 12, sm: 12, md: 12 }}
          >
            {actas.map((acta) => (
              <Grid key={acta.idActa} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Acta Nº {acta.nro}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Grupo:</strong> {acta.idGrupo}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Fecha:</strong>{" "}
                      {new Date(acta.fecha).toLocaleString()}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Motivo:</strong> {acta.motivo}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Retención:</strong> {acta.retencion}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Infractor:</strong> {acta.infractor.nombre}
                    </Typography>

                    <Typography variant="body2">
                      <strong>VehÃ­culo:</strong> {acta.vehiculo.dominio}
                    </Typography>

                    <CardActions sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Button
                        onClick={() => handleEdit(acta)}
                        disabled={!canEdit(acta.fecha)}
                        title={
                          !canEdit(acta.fecha)
                            ? "El acta ya no puede modificarse"
                            : "Editar acta"
                        }
                      >
                        <EditIcon />
                      </Button>

                      {acta.ubicacionResponse && (
                        <Tooltip title="Ver ubicación en Google Maps">
                          <IconButton onClick={() => openGoogleMaps(acta.ubicacionResponse.lat, acta.ubicacionResponse.lng)}>
                            <LocationOnIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {acta.idTipo === 2 && (
                        <Tooltip title="Generar pdf de acta serie B">
                          <IconButton onClick={() => descargarActa(acta.nro)}>
                            <PictureAsPdfIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {/*Table*/}
      {view === 1 && (
        <>
          {isPending ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>NÂº Acta</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={!!getSortDirection('id_grupo')}
                        direction={getSortDirection('id_grupo') ?? 'asc'}
                        onClick={() => toggleSort('id_grupo')}
                      >
                        Grupo
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Retencion</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={!!getSortDirection('motivo')}
                        direction={getSortDirection('motivo') ?? 'asc'}
                        onClick={() => toggleSort('motivo')}
                      >
                        Observacion
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Adjunta lo siguiente</TableCell>
                    <TableCell>Articulado</TableCell>
                    <TableCell>Apellido y Nombre del infractor</TableCell>
                    <TableCell>Dni del infractor</TableCell>
                    <TableCell>Dominio</TableCell>
                    <TableCell>Legajo policial</TableCell>
                    <TableCell>Personal policial</TableCell>
                    <TableCell>Unidad regional</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {actas.map((acta) => (
                    <TableRow key={acta.idActa}>
                      <TableCell>{acta.nro}</TableCell>
                      <TableCell>{acta.idGrupo}</TableCell>
                      <TableCell>
                        {new Date(acta.fecha).toLocaleString()}
                      </TableCell>
                      <TableCell>{acta.retencion}</TableCell>
                      <TableCell>{acta.motivo}</TableCell>
                      <TableCell>{acta.adjunta}</TableCell>
                      <TableCell>
                        {acta.articulos.map(a => a.nro).join(", ")}
                      </TableCell>
                      <TableCell>{acta.infractor.nombre}</TableCell>
                      <TableCell>{acta.infractor.dni}</TableCell>
                      <TableCell>{acta.vehiculo.dominio}</TableCell>
                      <TableCell>{acta.legajo}</TableCell>
                      <TableCell>{acta.nombre}</TableCell>
                      <TableCell>{!acta.ubicacionResponse ? 'N/A' : acta.ubicacionResponse.unidadRegional}</TableCell>
                      <TableCell>{!acta.ubicacionResponse ? 'N/A' : acta.ubicacionResponse.departamento}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEdit(acta)}
                          disabled={!canEdit(acta.fecha)}
                          title={
                            !canEdit(acta.fecha)
                              ? "El acta ya no puede modificarse"
                              : "Editar acta"
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        {acta.ubicacionResponse && <Tooltip title="Ver ubicación en Google Maps">
                          <IconButton onClick={() => openGoogleMaps(acta.ubicacionResponse.lat, acta.ubicacionResponse.lng)}>
                            <LocationOnIcon />
                          </IconButton>
                        </Tooltip>}
                        <Tooltip title="Generar pdf de acta">
                          <IconButton onClick={() => descargarActa(acta.nro)}>
                            <PictureAsPdfIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
      )}
        </>
      
    )}
      <Grid container spacing={2}>
    
  </Grid>

      <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
        <Typography> Página actual: {filters.page + 1} </Typography>

        <Pagination
          count={totalPages}
          page={filtersPersonal.page}
          onChange={handleChange}
          showFirstButton
          showLastButton
        />
      </Stack>
      <ScrollButton />
    </Paper>
  );
};

export default ActaResumenTable;



