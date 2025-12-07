import { useEffect, useState } from "react";
import { getResumenActas, getResumenActasPersonal } from "../services/ActaService";
import { Autocomplete, Box, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, type AutocompleteChangeDetails, type AutocompleteChangeReason } from "@mui/material";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import { useArticulo } from "../context/ArticuloContext";
import type { Articulo } from "../models/Articulo";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/Store";
import FilterForm from "../components/FIlterUser";
import ScrollButton from "../components/ScrollFilter";
import type { UserFilter } from "../models/UserFilter";
import AutocompleteApi from "../components/containers/AutocompleteApi";
import Button from "../components/ui/button/Button";

const ActaResumenTable: React.FC = () => {
  const [actas, setActas] = useState<ActaResumenDto[]>([]);
  const {articulos} = useArticulo();
  const [totalPages , setTotalPages] = useState(0);
  const [totalElements , setTotalElements] = useState(0);
  const { rol } = useSelector((state: RootState) => state.auth);
  const [showFilterUser, setShowFilterUser] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 0, grupo:null, puesto:null,articulo:null, size:12});
    const [filtersPersonal, setFiltersPersonal] = useState<Record<string, any>>({
    page: 0});

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
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

  // handler para selección (Autocomplete)
  const handleAutoChange = (
    event: React.SyntheticEvent,
    newValue: Articulo | null
  ) => {
    console.log("Seleccionado:", newValue?.idArt);
    setFilters(prev => ({
      ...prev,
      articulo: newValue?.idArt
    }));
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
      nro:''
    })
  }

  // handler para typing en el input del Autocomplete (TextField)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("typing:", e.target.value);
  };

  const fetchData = async () => {
    try {
      let content: any[] = [];
      let totalPages = 0;
      let totalElements = 0;
      if (rol === 'PERSONAL') {
        console.log('rol personal seleccionado')
        const data = await getResumenActasPersonal(filtersPersonal);
        content = data.content;
        totalPages = data.totalPages;
        totalElements = data.totalElements;
        setShowFilterUser(true)
      } else {
        const data = await getResumenActas(filters);
        content = data.content;
        totalPages = data.totalPages;
        totalElements = data.totalElements;
      }

      setTotalElements(totalElements);
      setTotalPages(totalPages);
      setActas(content);

      console.log('actas', content);
    } catch (error) {
      console.error('Error al obtener resumen de actas', error);
    }
  };

  const handleFilter = (filters: { infractor: string; nro: string }) => {
    console.log("Filtros aplicados:", filters);
        setFiltersPersonal(prev => ({
      ...prev,
      nro: filters.nro,
      infractor: filters.infractor,
    }));

    setFilters(prev => ({
      ...prev,
      nro: filters.nro,
      infractor: filters.infractor,
    }));

  };

  const handleSelect = (option: UserFilter | null) => {
    console.log("Seleccionado:", option);
    setFilters(prev => ({
      ...prev,
      userId: option?.idUser,
    }));
  };


  useEffect(() => {
    fetchData();
    console.log('filters ', filters)
    console.log('filters para el personal', filtersPersonal)
  }, [filters?.page, filters?.grupo, filters?.articulo, filters?.userId, filtersPersonal.page,
    filtersPersonal.infractor, filtersPersonal.nro
  ]);

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Resumen de Actas
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
        <Autocomplete
          options={articulos}
          getOptionLabel={(a) => a.nro}
          onChange={handleAutoChange}  
          renderInput={(params) => (
            <TextField
              {...params}
              label="Artículo"
              onChange={handleInputChange}    
            />
          )}
        />
        <AutocompleteApi onSelect={handleSelect} />
        </>
      )}
      <FilterForm onFilter={handleFilter}/>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Cantidad de actas: {totalElements}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {actas.map((acta, index) => (
            <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
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

                  <Typography variant="body2" color="text.secondary">
                    <strong>Grupo:</strong> {acta.idGrupo}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Fecha:</strong> {new Date(acta.fecha).toLocaleString()}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Motivo:</strong> {acta.motivo}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Retención:</strong> {acta.retencion}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Infractor:</strong> {acta.nombre}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Vehículo:</strong> {acta.dominio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
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