import { useEffect, useState } from "react";
import { getResumenActas } from "../services/ActaService";
import { Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Stack, Typography } from "@mui/material";
import type { ActaResumenDto } from "../models/ActaResumenDto";

interface Filters {
  grupo?: number,
  puesto?: number,
  articulo?: number,
  page: number
}

const ActaResumenTable: React.FC = () => {
  const [actas, setActas] = useState<ActaResumenDto[]>([]);
  const [totalPages , setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({page: 1});

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters({...filters, page:value});
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
    console.log('filters ', filters)
  };

  const fetchData = async () => {
      try {
        const {content, totalPages} = await getResumenActas(filters.page, filters.grupo);
        setTotalPages(totalPages);
        setActas(content);
        console.log('actas ', content)
      } catch (error) {
        console.error('Error al obtener resumen de actas', error);
      }
    };

  useEffect(() => {
    fetchData();
  }, [filters?.page, filters?.grupo]);

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