import type { ComponentType, LazyExoticComponent } from "react";

// types
export type RoleList = "ADMIN" | "REPAT" | "SECRETARIO" | "JEFE" | "PERSONAL" | "OFICIAL_DE_GUARDIA" | "DICTAMEN";

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  allowedRoles: RoleList[];
}