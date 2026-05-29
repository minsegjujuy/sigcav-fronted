import React, { lazy } from 'react';
import type { RouteConfig } from '../models/RouteConfig';

const ActaResumenTable = lazy(() => import('../pages/ActaResumenTabla'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
//const Talonario = lazy(() => import('../pages/Talonario'));
const RegistroTalonario = lazy(() => import('../pages/RegistroTalonario'));
const Reporte = lazy(() => import('../pages/Reporte'));
const ActaForm = lazy(() => import('../pages/ActaForm'));
const FormularioHechoVial = lazy(() => import('../pages/HechoVialForm'));
const HechosVialesTable = lazy(() => import('../pages/HechosVialesTable'));
const MapaJujuySource = lazy(() => import('../components/containers/MapaJujuySource'));
const ActaSalienteTable = lazy(() => import('../pages/ActaSalienteTable'));
const ActaSalienteDetalle = lazy(() => import('../pages/RegistrosActaSaliente'));
const PrintTestButton = React.lazy(() => 
  import("../pages/PrintTestButton") as Promise<{ default: React.ComponentType<any> }>
);
const TwoFactorSetup = lazy(() => import('../pages/TwoFactorSetup'));

export const protectedRoutes: RouteConfig[] = [

  // Todos
  { path: "/dashboard/mis-actas",                    component: ActaResumenTable,    allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "JEFE", "PERSONAL", "OFICIAL_DE_GUARDIA"] },
  { path: "/dashboard",                              component: Dashboard,           allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "JEFE", "PERSONAL", "OFICIAL_DE_GUARDIA", "DICTAMEN"] },
  { path: "/dashboard/2fa-qr",                              component: TwoFactorSetup,           allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "JEFE", "PERSONAL", "OFICIAL_DE_GUARDIA", "DICTAMEN"] },
  { path: "/actas-salientes/:id",                    component: ActaSalienteDetalle, allowedRoles: ["ADMIN", "DICTAMEN"] },
  { path: "/print",                    component: PrintTestButton, allowedRoles: ["ADMIN", "DICTAMEN"] },

  // Visualización
  //{ path: "/dashboard/talonarios",                   component: Talonario,           allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "JEFE"] },
  { path: "/dashboard/talonarios/registros",         component: RegistroTalonario,   allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "JEFE"] },
  { path: "/dashboard/actas-salientes",              component: ActaSalienteTable,   allowedRoles: ["ADMIN", "DICTAMEN"] },

  // Modificación
  { path: "/dashboard/modificacion",                 component: ActaForm,            allowedRoles: ["ADMIN", "REPAT", "SECRETARIO", "PERSONAL"] },

  // Alta y modificación
  { path: "/dashboard/nueva-acta",                   component: ActaForm,            allowedRoles: ["ADMIN", "SECRETARIO", "PERSONAL"] },
  { path: "/dashboard/hechos-viales/modificacion/:id", component: FormularioHechoVial, allowedRoles: ["ADMIN", "SECRETARIO", "PERSONAL"] },

  // Hechos viales
  { path: "/dashboard/hechos-viales/mapa",           component: MapaJujuySource,     allowedRoles: ["ADMIN", "REPAT", "JEFE", "OFICIAL_DE_GUARDIA"] },
  { path: "/dashboard/hechos-viales/nuevo",          component: FormularioHechoVial, allowedRoles: ["ADMIN", "REPAT", "PERSONAL", "JEFE", "OFICIAL_DE_GUARDIA"] },
  { path: "/dashboard/informes",                     component: Reporte,             allowedRoles: ["ADMIN", "REPAT", "JEFE", "OFICIAL_DE_GUARDIA"] },
  { path: "/dashboard/hechos-viales",                component: HechosVialesTable,   allowedRoles: ["ADMIN", "REPAT", "PERSONAL", "JEFE", "OFICIAL_DE_GUARDIA"] },

];