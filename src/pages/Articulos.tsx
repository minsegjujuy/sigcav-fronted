import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ArticuloList, ArticuloRequest } from "../models/Articulo";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
  type GridColDef,
  type GridPaginationModel,
  type GridRowId,
  type GridRowSelectionModel,
  type GridRowModesModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { listarArticulos } from "../services/ArticuloService";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { modificarArticulos } from "../services/ArticuloService";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";

const ArticulosTable = () => {
  const [articulos, setArticulos] = useState<ArticuloList[]>([]);
  const [articulosEditados, setArticulosEditados] = useState<ArticuloRequest[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [nro, setNro] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState("");
  const [precioNafta, setPrecioNafta] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paginationModel, setPaginationModel] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "id",
      sort: "asc",
    },
  ]);

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const cargarArticulos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const sortField = sortModel[0]?.field ?? "id";
      const sortDirection = sortModel[0]?.sort ?? "asc";

      const response = await listarArticulos({
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: [`${sortField},${sortDirection}`],
        nro: filtroAplicado,
      });
      setArticulos(response.content);
      setArticulosEditados(
        response.content.map((articulo) => ({
          idArt: articulo.idArt,
          velocidad: articulo.velocidad,
          alcoholemia: articulo.alcoholemia,
          unidadesFijas: articulo.unidadesFijas,
          importe: articulo.importe,
        })),
      );
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los artículos.");
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, filtroAplicado]);

  useEffect(() => {
    cargarArticulos();
  }, [cargarArticulos]);

  const handleBuscar = () => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));

    setFiltroAplicado(nro.trim());
  };

  const handleLimpiar = () => {
    setNro("");
    setFiltroAplicado("");

    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  };

  const articulosSeleccionados = articulos?.filter((articulo) =>
    rowSelectionModel.type === "include"
      ? rowSelectionModel.ids.has(articulo.idArt)
      : !rowSelectionModel.ids.has(articulo.idArt)
  );

  const cantidadArticulosSeleccionados =
    rowSelectionModel.type === "include"
      ? rowSelectionModel.ids.size
      : Math.max(totalElements - rowSelectionModel.ids.size, 0);

  const articulosSeleccionadosParaGuardar = articulosEditados.filter((articulo) =>
    articulosSeleccionados?.some(
      (seleccionado) => seleccionado.idArt === articulo.idArt,
    ),
  );

  const estaSeleccionado = (id: GridRowId) =>
    rowSelectionModel.type === "include"
      ? rowSelectionModel.ids.has(id)
      : !rowSelectionModel.ids.has(id);

  const handleRowEditStart = (id: GridRowId) => {
    if (!estaSeleccionado(id)) {
      SnackbarUtilities.warning("Primero seleccioná la fila para poder editarla");
      return;
    }

    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const handleRowCancel = (id: GridRowId) => {
    setRowModesModel((current) => ({
      ...current,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
  };

  const handleCambiarPrecios = () => {
    const precio = Number(precioNafta);

    if (!Number.isFinite(precio) || precio <= 0) {
      SnackbarUtilities.warning("Ingresá un precio válido para la nafta súper");
      return;
    }

    if (articulosSeleccionados.length === 0) {
      SnackbarUtilities.warning("Seleccioná al menos un artículo para cambiar el precio");
      return;
    }

    const idsSeleccionados = new Set(articulosSeleccionados.map((articulo) => articulo.idArt));

    setArticulos((current) =>
      current.map((articulo) =>
        idsSeleccionados.has(articulo.idArt)
          ? {
              ...articulo,
              importe: articulo.unidadesFijas * precio,
            }
          : articulo,
      ),
    );

    setArticulosEditados((current) =>
      current.map((articulo) =>
        idsSeleccionados.has(articulo.idArt)
          ? {
              ...articulo,
              importe:
                (articulos.find((item) => item.idArt === articulo.idArt)?.unidadesFijas ??
                  articulo.unidadesFijas) * precio,
            }
          : articulo,
      ),
    );

    SnackbarUtilities.success("Importes actualizados en las filas seleccionadas");
  };

  const handleSaveChanges = async () => {
    if (articulosSeleccionadosParaGuardar.length === 0) {
      SnackbarUtilities.warning("Seleccioná al menos un artículo para guardar");
      return;
    }

    await modificarArticulos(articulosSeleccionadosParaGuardar);

    SnackbarUtilities.success("Artículos actualizados correctamente");
    await cargarArticulos();
  };

  const columns: GridColDef<ArticuloList>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
    },
    {
      field: "nro",
      headerName: "Número",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "detalle",
      headerName: "Descripción",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "unidadesFijas",
      headerName: "Unidades fijas",
      minWidth: 150,
      type: "number",
      editable: true,
    },
    {
      field: "importe",
      headerName: "Importe",
      minWidth: 150,
      type: "number",
      editable: true,
      valueFormatter: (value) =>
        Number(value ?? 0).toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
    },
  {
    field: "velocidad",
    headerName: "Velocidad",
    minWidth: 120,
    type: "boolean",
    editable: true,
  },
  {
    field: "alcoholemia",
    headerName: "Alcoholemia",
    minWidth: 130,
    type: "boolean",
    editable: true,
  },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 110,
      getActions: (params) => {
        const isEditing = rowModesModel[params.id]?.mode === "edit";
        const isSelected = estaSeleccionado(params.id);

        if (isEditing) {
          return [
            <GridActionsCellItem
              key="cancel"
              icon={<CloseIcon />}
              label="Cancelar"
              onClick={() => handleRowCancel(params.id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            onClick={() => handleRowEditStart(params.id)}
            color="primary"
            disabled={!isSelected}
          />,
        ];
      },
    },
  ];

  return (
    <Box>
      <Container
        maxWidth="xl"
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            p: { xs: 1, sm: 2, md: 3 },
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={600}
            mb={3}
            sx={{
              fontSize: { xs: "1.3rem", sm: "1.5rem" },
            }}
          >
            Artículos
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mb={3}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              label="Buscar por número"
              value={nro}
              onChange={(event) => setNro(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleBuscar();
                }
              }}
              size="small"
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleBuscar}
              sx={{
                minWidth: { sm: 110 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Buscar
            </Button>

            <Button
              variant="outlined"
              onClick={handleLimpiar}
              sx={{
                minWidth: { sm: 110 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Limpiar
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            mb={3}
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <TextField
              label="Precio actual de nafta súper"
              type="number"
              value={precioNafta}
              helperText="Para modificar el precio de todos los artículos, primero muestra todas las filas de la tabla y luego aplica los cambios."
              onChange={(event) => setPrecioNafta(event.target.value)}
              size="small"
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: "0.01",
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleCambiarPrecios}
              sx={{
                minWidth: { md: 170 },
                width: { xs: "100%", md: "auto" },
                whiteSpace: "nowrap",
              }}
            >
              Cambiar precios
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              backgroundColor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
            >
              <Typography variant="body2" color="text.secondary">
                Seleccionados: {cantidadArticulosSeleccionados}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => void handleSaveChanges()}
                disabled={articulosSeleccionadosParaGuardar.length === 0}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Guardar cambios
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      <Box sx={{ width: "100%", minHeight: 450 }}>
        <DataGrid
          rows={articulos}
          columns={columns}
          getRowId={(row) => row.idArt}
          rowCount={totalElements}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          editMode="row"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={(model) => {
            setSortModel(model);

            setPaginationModel((prev) => ({
              ...prev,
              page: 0,
            }));
          }}
          pageSizeOptions={[5, 10, 25, 60]}
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
          onRowClick={(params) => handleRowEditStart(params.id)}
          processRowUpdate={(newRow) => {
            const updated = newRow as ArticuloList;

            setArticulos((current) =>
              current.map((articulo) =>
                articulo.idArt === updated.idArt ? updated : articulo,
              ),
            );

            setArticulosEditados((current) =>
              current.map((articulo) =>
                articulo.idArt === updated.idArt
                  ? {
                      idArt: updated.idArt,
                      velocidad: updated.velocidad,
                      alcoholemia: updated.alcoholemia,
                      unidadesFijas: updated.unidadesFijas,
                      importe: updated.importe,
                    }
                  : articulo,
              ),
            );

            return updated;
          }}
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          slots={{
            loadingOverlay: () => (
              <Stack
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <CircularProgress />
              </Stack>
            ),
          }}
          sx={{
            backgroundColor: "background.paper",
          }}
        />
      </Box>
    </Box>
  );
};

export default ArticulosTable;
