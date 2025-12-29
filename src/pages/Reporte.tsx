import { useRef, useState, useTransition } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ReportePorDia from "./ReportePorDia";
import type { ParamsDate } from "../models/ParamsDate";
import ReporteInfracciones from "./ReporteInfracciones";
import ReportePorGrupo from "./ReportePorGrupo";
import BarChart from "./ReportePorGrupoYPuesto";
import { obtenerActasPorGrupoPorPuesto, obtenerActasPorJerarquia, obtenerActasPorMotivo, obtenerActasPorNacionalidad, obtenerActasPorProvincia, obtenerPorcentajeDeActasPorDia, obtenerTipoDeActasPorPuesto } from "../services/ActaService";
import type { GrupoInforme } from "../models/GrupoInforme";
import type { TipoInformeList } from "../models/TipoInformeList";
import type { DiasCantidad } from "../models/DiasCantidad";
import LineChart from "./LineChart";
import type { ReporteActas } from "../models/Reporte";
import { generarPDF } from "../utilities/GenerarPdf";

const Reporte: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs());
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs());
  const [params, setParams] = useState<ParamsDate | null>(null);

  const [grupoInforme, setGrupoInforme] = useState<GrupoInforme[]>([])
  const [tipoInforme, setTipoInforme] = useState<TipoInformeList[]>([])
  const [porcentajeDiasInforme, setPorcentajeDiasInforme] = useState<DiasCantidad[]>([])
  const [nacionalidad, setNacionalidad] = useState<ReporteActas[]>([])
  const [jerarquia, setJerarquia] = useState<ReporteActas[]>([])
  const [motivo, setMotivo] = useState<ReporteActas[]>([])
  const [provincia, setProvincia] = useState<ReporteActas[]>([])
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleFilter = async () => {
    
    if (!fechaInicio || !fechaFin) {
      // validar
      console.warn("Faltan fechas");
      return;
    }

    // Formatea como quiera tu backend. Aquí uso 'YYYY-MM-DD HH:mm:ss'
    const fi = fechaInicio.format("YYYY-MM-DDTHH:mm:ssZ");
    const ff = fechaFin.format("YYYY-MM-DDTHH:mm:ssZ");

    console.log("Enviando fechas:", fi, ff);
    await fetchGruposPorPuesto(fi,ff);
    await fetchTiposDeActaPorPuesto(fi,ff);
    await fetchPorcentajePorDia(fi,ff);
    await fetchCantidadPorJerarquia(fi,ff);
    await fetchCantidadPorObservacion(fi,ff);
    await fetchCantidadPorProvincia(fi,ff);
    await fetchCantidadPorNacionalidad(fi,ff);
    setParams({ fechaInicio: fi, fechaFin: ff });
  };

  const fetchGruposPorPuesto = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerActasPorGrupoPorPuesto(fechaInicio,fechaFin);
    console.log('grupos ', data, 'fecha ', params)
    setGrupoInforme(data);
  }

  const fetchTiposDeActaPorPuesto = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerTipoDeActasPorPuesto(fechaInicio,fechaFin);
    console.log('tipos ', data, 'fecha ', params)
    setTipoInforme(data);
  }

  const fetchPorcentajePorDia = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerPorcentajeDeActasPorDia(fechaInicio,fechaFin);
    console.log('porcentaje ', data, 'fecha ', params)
    setPorcentajeDiasInforme(data);
  }

  const fetchCantidadPorJerarquia = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerActasPorJerarquia(fechaInicio,fechaFin);
    console.log('jerarquia ', data, 'fecha ', params)
    setJerarquia(data);
  }

  const fetchCantidadPorObservacion = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerActasPorMotivo(fechaInicio,fechaFin);
    console.log('motivo ', data, 'fecha ', params)
    setMotivo(data);
  }

  const fetchCantidadPorProvincia = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerActasPorProvincia(fechaInicio,fechaFin);
    console.log('provincia ', data, 'fecha ', params)
    setProvincia(data);
  }

  const fetchCantidadPorNacionalidad = async (fechaInicio: string, fechaFin: string) => {
    const data = await obtenerActasPorNacionalidad(fechaInicio,fechaFin);
    console.log('nacionalidad ', data, 'fecha ', params)
    setNacionalidad(data);
  }

  //grupos
  const labelsGrupoInformes = grupoInforme?.map(item => item.puesto);
  const gruposIds = grupoInforme[0]?.grupos.map(g => g.idGrupo);
  const seriesGruposPorPuesto = gruposIds?.map(id => ({
    label: `Grupo ${id}`,
    data: grupoInforme?.map(p => {
      const item = p.grupos.find(g => g.idGrupo === id);
      return item ? item.totalActas : 0;
    })
  }));

  //tipo acta
  const labelsTipoInformes = tipoInforme?.map(item => item.puesto);
  const tiposIds = tipoInforme[3]?.grupos.map(g => g.tipo);
  const seriesTiposPorPuesto = tiposIds?.map(tipo => ({
    label: `Tipo de acta ${tipo}`,
    data: tipoInforme?.map(p => {
      const item = p.grupos.find(g => g.tipo === tipo);
      return item ? item.totalActas : 0;
    })
  }));

  //porcentaje de actas por dia
  const labelsPorcentajes = porcentajeDiasInforme.map(d => d.dia);

  const seriesPorcentajes = [
    {
      label: "Porcentaje por día",
      data: porcentajeDiasInforme.map(d => d.cantidad)
    }
  ];

  //actas por jerarquia
  const labelsJerarquia = jerarquia.map(d => d.titulo);

  const seriesJerarquia = [
    {
      label: "Jerarquia",
      data: jerarquia.map(j => j.totalActas)
    }
  ];

  //actas por observacion
  const labelsObservacion = motivo.map(m => m.titulo);

  const seriesObservacion= [
    {
      label: "Observacion",
      data: motivo.map(m => m.totalActas)
    }
  ];

  //actas por provincia
  const labelsProvincia = provincia.map(p => p.titulo);

  const seriesProvincia= [
    {
      label: "Provincia",
      data: provincia.map(p => p.totalActas)
    }
  ];

  //actas por nacionalidad
  const labelsNacionalidad = nacionalidad.map(p => p.titulo);

  const seriesNacionalidad= [
    {
      label: "Nacionalidad",
      data: nacionalidad.map(p => p.totalActas)
    }
  ];

 const handleGenerarPdf = (params: ParamsDate) => {
    startTransition(() => {
      generarPDF(contentRef, params);
    });
  };


  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ p: 3, width: 320 }}>
          <Typography variant="h6">Seleccionar rango de fechas</Typography>

          <DatePicker
            label="Fecha inicio"
            value={fechaInicio}
            onChange={(newValue) => setFechaInicio(newValue)}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />

          <DatePicker
            label="Fecha fin"
            value={fechaFin}
            onChange={(newValue) => setFechaFin(newValue)}
            slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
          />

          <Button variant="contained" onClick={handleFilter}>
            Ver informe
          </Button>
        </Box>
      </LocalizationProvider>
      {params && <Button onClick={()=> handleGenerarPdf(params)}>Generar PDF {isPending && <CircularProgress color="primary" size={20} thickness={10} />}</Button>}
      
      {/* Paso las fechas formateadas; si no hay params, paso strings vacíos */}
      {params ? (
        <>
        <div ref={contentRef}>
        <ReportePorDia
          fechaInicio={params.fechaInicio}
          fechaFin={params.fechaFin}
        />
        <ReporteInfracciones
          fechaInicio={params.fechaInicio}
          fechaFin={params.fechaFin}
        />
        <ReportePorGrupo
          fechaInicio={params.fechaInicio}
          fechaFin={params.fechaFin}
        />
        
           <BarChart titulo={'PORCENTAJE DE ACTAS REALIZADAS EN LAS DIFERENTES GUARDIAS'}
          labels={labelsGrupoInformes} series={seriesGruposPorPuesto} height={400} />
          <BarChart titulo="CANTIDAD DE ACTAS SERIE B/PDA" labels={labelsTipoInformes} series={seriesTiposPorPuesto} height={400} />
          <LineChart labels={labelsPorcentajes} series={seriesPorcentajes} />
          <BarChart titulo="CANTIDAD DE ACTAS REALIZADAS POR JERARQUIA" labels={labelsJerarquia} series={seriesJerarquia} height={400} />
          <BarChart titulo={'RESUMEN DE ACTAS POR CATEGORIA DE EVENTO'}
          labels={labelsObservacion} series={seriesObservacion} height={400} />
          <BarChart titulo={'CLASIFICACION DE INFRACTORES POR PROVINCIA'}
          labels={labelsProvincia} series={seriesProvincia} height={400} />
          <BarChart titulo={'CLASIFICACION DE INFRACTORES POR NACIONALIDAD'}
          labels={labelsNacionalidad} series={seriesNacionalidad} height={400} />
        </div>
       
        </>
      ) : (
        <p>No se ha seleccionado ningun rango de fechas</p>
      )}
    </>
  );
};

export default Reporte;

