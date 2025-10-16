import { useEffect, useState } from "react";
import { getResumenActas } from "../services/ActaService";
import { Autocomplete, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Stack, TextField, Typography, type AutocompleteChangeDetails, type AutocompleteChangeReason } from "@mui/material";
import type { ActaResumenDto } from "../models/ActaResumenDto";
import { useArticulo } from "../context/ArticuloContext";
import type { Articulo } from "../models/Articulo";

const ActaResumenTable: React.FC = () => {
  const [actas, setActas] = useState<ActaResumenDto[]>([]);
  const {articulos} = useArticulo();
  const [totalPages , setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 1, grupo:null, puesto:null,articulo:null, size:12});
  const [articulo, setArticulo] = useState<Articulo | null>(null);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({...filters, page :value});
    console.log("Página activa:", filters?.page);
    // Aquí podés llamar a tu API con la nueva página, por ejemplo:
    // fetchActas(value);
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
    setFilters({...filters, articulo:newValue?.idArt})
  };

  // handler para typing en el input del Autocomplete (TextField)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("typing:", e.target.value);
  };

  const fetchData = async () => {
      try {
        const {content, totalPages} = await getResumenActas(filters);
        setTotalPages(totalPages);
        setActas(content);
        console.log('actas ', content)
      } catch (error) {
        console.error('Error al obtener resumen de actas', error);
      }
    };

  useEffect(() => {
    fetchData();
    console.log('filters ', filters)
  }, [filters?.page, filters?.grupo, filters?.articulo]);

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Resumen de Actas
      </Typography>
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

      <Grid container spacing={2} >
        {actas.map((acta, index) => (
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
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
                  <strong>Fecha:</strong>{" "}
                  {new Date(acta.fecha).toLocaleString()}
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
        ))}
      </Grid>
      <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
        <Typography> Página actual: {filters.page} </Typography>

        <Pagination
          count={totalPages}
          page={filters.page}
          onChange={handleChange}
          showFirstButton
          showLastButton
        />
      </Stack>
    </Paper>
  );
};

export default ActaResumenTable;