import { useState } from "react";
import MapaJujuyHechosViales from "./MapaJujuyHechosViales";
import type { UbicacionPunto } from "../../models/UbicacionPunto";
import { listarHechosVialesAlcoholizados, listarHechosVialesMetricas, listarHechosVialesPorDia, listarHechosVialesPorTurnos, listarHechosVialesUbicaciones } from "../../services/HechoVialService";
import { Alert, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import LeyendaMapa from "./TablaLeyendaHechosViales";
import TablaMetricasSiniestros from "../modules/TablaMetricasHechosViales";
import type { MetricasSiniestralidad } from "../../models/Metricas";
import type { PorcentajeAlcoholizados } from "../../models/PorcentajeAlcoholizados";
import MetricaAlcohol from "../modules/MetricaAlcohol";
import { type TurnoData } from "../../models/TurnoData";
import GraficoTurnos from "../modules/GraficoTurnos";
import type { DiasCantidad } from "../../models/DiasCantidad";
import BarChart from "../../pages/ReportePorGrupoYPuesto";

const MapaJujuySource = () => {
    const [puntos, setPuntos] = useState<UbicacionPunto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metricas, setMetricas] = useState<MetricasSiniestralidad>();
    const [porcentajeAlcoholizados, setPorcentajeAlcoholizados] = useState<PorcentajeAlcoholizados>();
    const [turnos, setTurnos] = useState<TurnoData[]>();
    const [dias, setDias] = useState<DiasCantidad[]>();
    // Estados para las fechas
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const fetchMetricas = async () => {
        const data = await listarHechosVialesMetricas({fechaInicio, fechaFin});
        setMetricas(data);
        console.log(data);
    }

    const fetchAlcoholizados = async () => {
        const data = await listarHechosVialesAlcoholizados({fechaInicio, fechaFin});
        setPorcentajeAlcoholizados(data);
        console.log(data);
    }

    const fetchturnos = async () => {
        const data = await listarHechosVialesPorTurnos({fechaInicio, fechaFin});
        setTurnos(data);
    }

    const fetchDias = async () => {
        const data = await listarHechosVialesPorDia({fechaInicio, fechaFin});
        setDias(data);
    }

    //porcentaje de actas por dia
    const labelsCantidad = dias?.map(d => d.dia);

    const seriesPorcentajes = [
        {
        label: "Porcentaje por día",
        data: dias?.map(d => d.cantidad)!
        }
    ];

    const fetchData = async () => {
        if (!fechaInicio || !fechaFin) {
            setError("Debe seleccionar ambas fechas para realizar la consulta.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Ajustamos el formato si el input no envía los segundos
            const fInicio = fechaInicio.length === 16 ? `${fechaInicio}:00` : fechaInicio;
            const fFin = fechaFin.length === 16 ? `${fechaFin}:00` : fechaFin;

            const response = await listarHechosVialesUbicaciones({
                fechaInicio: fInicio,
                fechaFin: fFin,
                soloLesionados: false
            });
            setPuntos(response);
            fetchMetricas();
            fetchAlcoholizados();
            fetchturnos();
            fetchDias();
        } catch (err) {
            setError("Error al conectar con el servidor. Verifique su conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Mapa de Siniestralidad Vial - Jujuy
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    alignItems="center"
                >
                    <TextField
                        label="Fecha y Hora Inicio"
                        type="datetime-local"
                        fullWidth
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Fecha y Hora Fin"
                        type="datetime-local"
                        fullWidth
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                        onClick={fetchData}
                        disabled={loading}
                        sx={{ minWidth: '200px', height: '56px' }}
                    >
                        {loading ? "Cargando..." : "Consultar"}
                    </Button>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
                <LeyendaMapa />
            </Paper>

            <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', height: '500px' }}>
                <MapaJujuyHechosViales puntos={puntos} />
            </Paper>

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Puntos cargados actualmente: **{puntos.length}**
            </Typography>
            <Divider />
            {fechaFin && fechaFin && (
                <Box sx={{ flexGrow: 1, p: { xs: 1, md: 3 }, backgroundColor: '#fdfdfd' }}>
                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, letterSpacing: 0.5 }}>
                        Panel de Control de Siniestralidad
                    </Typography>
                    
                    {/* Contenedor Principal usando Grid2 */}
                    <Grid container spacing={4}>
                        
                        {/* Fila 1: Tabla de Resultados y Métrica de Alcohol */}
                        <Grid size={{ xs: 12, lg: 8 }}>
                        <TablaMetricasSiniestros metricas={metricas!} />
                        </Grid>

                        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <MetricaAlcohol 
                            porcentajeAlcoholizados={porcentajeAlcoholizados?.porcentajeAlcoholizados!} 
                            totalAlcoholizados={porcentajeAlcoholizados?.totalAlcoholizados!} 
                        />
                        </Grid>

                        <Grid size={12}>
                        <Divider />
                        </Grid>

                        {/* Fila 2: Gráficos Estadísticos */}
                        <Grid size={{ xs: 12, md: 6 }}>
                        <GraficoTurnos datos={turnos!} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                        <BarChart 
                            series={seriesPorcentajes} 
                            labels={labelsCantidad!} 
                            titulo="Distribución Semanal" 
                        />
                        </Grid>

                    </Grid>
                    </Box>
            )}
        </Box>
    );
};

export default MapaJujuySource;