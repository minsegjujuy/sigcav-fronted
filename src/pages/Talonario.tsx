import { Box, Button, Card, CardActions, CardContent, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import type { Talonario } from "../models/Talonario"
import { TalonarioService } from "../services/TalonarioService";
import ReusableModal from "../components/ui/modal/ReusableModal";
import FormTalonario from "../components/containers/FormTalonario";
import {  useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PaginationCustom from "../components/ui/pagination/Pagination";
import { getPuestos } from "../services/PuestoService";
import type { Puesto } from "../models/Puesto";

const Talonario = () => {
    const [talonarios, setTalonarios] = useState<Talonario[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [params, setParams] = useState<Record<string, any>>({
        page:0
    })
    const [puestos, setPuestos] = useState<Puesto[]>([]);

    const handleChangeNro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setParams(prevParams => ({...prevParams, nro:value}));
    };
    
    const fetchPuestos = async () => {
        const data = await getPuestos();
        setPuestos(data)
      }

    const fetchTalonarios = async () => {
        console.log(params)
        const {content, totalPages} = await TalonarioService.obtenerTalonarios(params);
        setTalonarios(content);
        setTotalPages(totalPages);
    }

    const goToRegistros = (idTal: number) => {
        navigate(`/dashboard/talonarios/registros?idTal=${idTal}`);
    };

    const deleteTalonario = async (idTal: Number) => {
        await TalonarioService.eliminarTalonario(idTal);
        SnackbarUtilities.info('Se eliminó el talonario');
        setTalonarios(prev =>
        prev.filter(t => t.idTal !== idTal)
        );
    }

    const clearFilters = () => {
        setParams({page:0, idPuesto: undefined, nro: undefined});
    }

    const handleChange = (page : number) => {
        console.log('page ', page);
        setParams(prevParams => ({...prevParams, page:page}))
    }


    useEffect(() => {
        fetchTalonarios();
        fetchPuestos();
    }, [params])
    return (
        <Paper sx={{ mt: 4, p: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Talonarios
            </Typography>

            <Button variant="contained" onClick={() => setOpen(true)}>Nuevo <AddCircleIcon /></Button>
            <ReusableModal
                open={open}
                onClose={() => setOpen(false)}
                title="Formulario de talonarios"
            ><FormTalonario 
                talonarios={talonarios}
                setTalonarios={setTalonarios}
                puestos={puestos}
            /></ReusableModal>
            <FormControl fullWidth>
                <InputLabel>Puesto</InputLabel>
                <Select
                value={params.idPuesto}
                label="Puesto"
                onChange={(e) => setParams(prevParams => ({...prevParams, idPuesto:Number(e.target.value)}))}
                required
                >
                {puestos.map(p => (
                    <MenuItem key={p.idPuesto} value={p.idPuesto}>
                    {p.nombre}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <TextField 
                label="Número de acta"
                type="number"
                value={params.nro}
                onChange={handleChangeNro}
                fullWidth
                 />
            </FormControl>
            <Button variant="outlined" onClick={clearFilters}>Limpiar filtros</Button>
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
                        <CardActions sx={{ justifyContent: "center" }}>
                        <Button onClick={() => goToRegistros(talonario.idTal)}>
                            Ver detalles
                        </Button>
                        <Button size="small" variant="contained" onClick={()=>deleteTalonario(talonario.idTal)}>
                            <DeleteIcon />
                        </Button>
                        </CardActions>

                    </Card>
                    </Grid>
                ))}
                </Grid>
            </Box>
            <Grid container spacing={2}>
            
        </Grid>
        
            <PaginationCustom
                page={params.page}
                totalPages={totalPages}
                onChange={(newPage)=>handleChange(newPage)}
                zeroBased={true}
                />
            </Paper>
    )
}

export default Talonario