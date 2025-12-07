import { Box, Button, Card, CardContent, Grid, Pagination, Paper, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import type { Talonario } from "../models/Talonario"
import ScrollButton from "../components/ScrollFilter";
import { TalonarioService } from "../services/TalonarioService";
import ReusableModal from "../components/ui/modal/ReusableModal";
import FormTalonario from "../components/containers/FormTalonario";
import { Link, useNavigate } from "react-router-dom";

const Talonario = () => {
    const [talonarios, setTalonarios] = useState<Talonario[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    

    const fetchTalonarios = async () => {
        const {content, totalElements, totalPages} = await TalonarioService.obtenerTalonarios({});
        setTalonarios(content);
        setTotalPages(totalPages);
    }

    const goToRegistros = (idTal: number) => {
        navigate(`/dashboard/talonarios/registros?idTal=${idTal}`);
    };


    useEffect(() => {
        fetchTalonarios();
    }, [])
    return (
        <Paper sx={{ mt: 4, p: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Talonarios
            </Typography>
            <Button onClick={() => setOpen(true)}>Crear</Button>
            <ReusableModal
                open={open}
                onClose={() => setOpen(false)}
                title="Formulario de talonarios"
            ><FormTalonario /></ReusableModal>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {talonarios.map((talonario, index) => (
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
                            Talonario Nº {talonario.nroInicial}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>Fecha:</strong> {new Date(talonario.fechaCreacion).toLocaleString()}
                        </Typography>
        
                        <Typography variant="body2" color="text.secondary">
                            <strong>Cantidad total:</strong> {talonario.cantidadTotal}
                        </Typography>
        
                        <Typography variant="body2" color="text.secondary">
                            <strong>Completadas:</strong> {talonario.cantidadCompletadas} / {talonario.cantidadTotal}
                        </Typography>
        
                        <Typography variant="body2" color="text.secondary">
                            <strong>Puesto:</strong> {talonario.puesto.nombre}
                        </Typography>
                        </CardContent>
                        <Button onClick={()=>goToRegistros(talonario.idTal)}>Ver detalles</Button>
                    </Card>
                    </Grid>
                ))}
                </Grid>
            </Box>
            <Grid container spacing={2}>
            
        </Grid>
        
            {/*<Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
                <Typography> Página actual: {filters.page + 1} </Typography>
        
                <Pagination
                count={totalPages}
                page={filtersPersonal.page}
                onChange={handleChange}
                showFirstButton
                showLastButton
                />
            </Stack> */}
            <ScrollButton />
            </Paper>
    )
}

export default Talonario