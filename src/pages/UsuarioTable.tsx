import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Edit,
  Refresh,
  Search,
} from "@mui/icons-material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReusableModal from "../components/ui/modal/ReusableModal";
import UsuarioForm from "./UsuarioForm";
import type { PageResponse } from "../models/PageResponse";
import type { Usuario } from "../models/User";
import { crearUsuario, listarUsuarios, modificarUsuario } from "../services/UserService";
import { SnackbarUtilities } from "../utilities/SnackbarUtilities";
import { usuarioInitialState } from "../models/User";
import { useGetJerarquiasQuery, useGetRolesQuery } from "../redux/api/puestoApi";

type SortDirection = "asc" | "desc";

const initialPage: PageResponse<Usuario> = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  last: true,
  first:false,
};

export default function UsuarioTable() {
  const [usuariosPage, setUsuariosPage] =
    useState<PageResponse<Usuario>>(initialPage);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [usernameInput, setUsernameInput] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");

  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  //const [jerarquias, setJerarquias] = useState<OpcionUsuario[]>([]);
  const { data: jerarquias = []} = useGetJerarquiasQuery();
  const { data: roles = []} = useGetRolesQuery();

  const sort = useMemo(
    () => `${sortField},${sortDirection}`,
    [sortField, sortDirection],
  );

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listarUsuarios({
        page,
        size,
        sort,
        username: usernameFilter,
      });

      setUsuariosPage(response);
    } catch (err) {
      console.error("Error al listar usuarios:", err);
      setError("No se pudo cargar el listado de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, size, sort, usernameFilter]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  const abrirNuevoUsuario = () => {
    setUsuarioEnEdicion(null);
    setModalOpen(true);
  };

  const abrirEdicion = (usuario: Usuario) => {
    setUsuarioEnEdicion(usuario);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (savingUser) {
      return;
    }

    setModalOpen(false);
    setUsuarioEnEdicion(null);
  };

  const handleGuardarUsuario = async (usuario: Usuario) => {
    setSavingUser(true);
    setError("");

    try {
      if (usuario.idUser != null) {
        await modificarUsuario(usuario);
        SnackbarUtilities.success("Usuario modificado correctamente");
      } else {
        await crearUsuario(usuario);
        SnackbarUtilities.success("Usuario creado correctamente");
      }

      setModalOpen(false);
      setUsuarioEnEdicion(null);
      await fetchUsuarios();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError("No se pudo guardar el usuario.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleBuscar = () => {
    setPage(0);
    setUsernameFilter(usernameInput.trim());
  };

  const handleLimpiarBusqueda = () => {
    setUsernameInput("");
    setUsernameFilter("");
    setPage(0);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleBuscar();
    }
  };

  const handleSort = (field: string) => {
    setPage(0);

    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const handleChangePage = (
    _event: unknown,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSize(Number(event.target.value));
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={2}
      >
        <Typography variant="h5" component="h1">
          Usuarios
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
        >
          <TextField
            size="small"
            label="Buscar por usuario"
            value={usernameInput}
            onChange={(event) =>
              setUsernameInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="outlined"
            onClick={handleBuscar}
            disabled={loading}
          >
            Buscar
          </Button>

          <Button
            variant="text"
            onClick={handleLimpiarBusqueda}
            disabled={
              loading &&
              usernameInput === "" &&
              usernameFilter === ""
            }
          >
            Limpiar
          </Button>

          <Tooltip title="Actualizar">
            <span>
              <IconButton
                onClick={() => void fetchUsuarios()}
                disabled={loading}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={abrirNuevoUsuario}
          >
            Nuevo usuario
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={
                sortField === "username"
                  ? sortDirection
                  : false
              }>
                <TableSortLabel
                  active={sortField === "username"}
                  direction={
                    sortField === "username"
                      ? sortDirection
                      : "asc"
                  }
                  onClick={() => handleSort("username")}
                >
                  Usuario
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={
                sortField === "nombreCompleto"
                  ? sortDirection
                  : false
              }>
                <TableSortLabel
                  active={sortField === "nombreCompleto"}
                  direction={
                    sortField === "nombreCompleto"
                      ? sortDirection
                      : "asc"
                  }
                  onClick={() =>
                    handleSort("nombreCompleto")
                  }
                >
                  Nombre completo
                </TableSortLabel>
              </TableCell>

              <TableCell>DNI</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Jerarquía</TableCell>
              <TableCell align="center">Rol</TableCell>
              <TableCell align="center">
                Registro diario
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box py={4}>
                    <CircularProgress size={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : usuariosPage.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography
                    color="text.secondary"
                    py={4}
                  >
                    No se encontraron usuarios.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuariosPage.content.map((usuario) => (
                <TableRow
                  key={usuario.idUser ?? usuario.username}
                  hover
                >
                  <TableCell>{usuario.username}</TableCell>

                  <TableCell>
                    {usuario.nombreCompleto}
                  </TableCell>

                  <TableCell>{usuario.dni}</TableCell>

                  <TableCell>
                    {usuario.email || "-"}
                  </TableCell>

                  <TableCell align="center">
                    {usuario.jerarquia}
                  </TableCell>

                  <TableCell align="center">
                    {usuario.role}
                  </TableCell>

                  <TableCell align="center">
                    {usuario.registroDiario ? "Sí" : "No"}
                  </TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      justifyContent="center"
                      spacing={0.5}
                    >
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => {
                            abrirEdicion(usuario);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={usuariosPage.totalElements}
        page={page}
        rowsPerPage={size}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${
            count !== -1 ? count : `más de ${to}`
          }`
        }
        />

      <ReusableModal
        open={modalOpen}
        onClose={cerrarModal}
        title={usuarioEnEdicion?.idUser != null ? "Modificar usuario" : "Nuevo usuario"}
        maxWidth="md"
      >
        <UsuarioForm
          key={usuarioEnEdicion?.idUser ?? "nuevo"}
          usuario={usuarioEnEdicion ?? usuarioInitialState}
          jerarquias={jerarquias}
          roles={roles}
          loading={savingUser}
          onSubmit={handleGuardarUsuario}
          onCancelar={cerrarModal}
        />
      </ReusableModal>
    </Paper>
  );
}
