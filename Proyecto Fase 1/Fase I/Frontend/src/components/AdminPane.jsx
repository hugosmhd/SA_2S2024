import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  AppBar,
  Toolbar
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    tipo_usuario: "Cliente", // Default value
    nombre_empresa: "",
    nombres: "",
    apellidos: "",
    email: "",
    direccion: "",
    celular: "",
    contrasena: "", // Contraseña
  });

  const navigate = useNavigate();
  const baseURL = "http://127.0.0.1:3005/auth";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Open dialog
  const handleOpen = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setForm(user);
    } else {
      setForm({
        tipo_usuario: "Cliente",
        nombre_empresa: "",
        nombres: "",
        apellidos: "",
        email: "",
        direccion: "",
        celular: "",
        contrasena: "", // Agregar contraseña
      });
    }
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Add or edit user
  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update user
        await axios.put(`${baseURL}/users/${selectedUser.id}`, form);
      } else {
        // Add user
        await axios.post(`${baseURL}/register`, form);
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // Delete user with confirmation
  const handleDelete = async (id, tipoUsuario) => {
    const message =
      tipoUsuario === "Proveedor"
        ? "Este usuario es un proveedor y tiene artículos asociados. ¿Estás seguro de que quieres eliminarlo?"
        : "Este usuario tiene dependencias activas. ¿Estás seguro de que quieres eliminarlo?";

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${baseURL}/users/${id}`);
        Swal.fire({
          title: "Eliminado",
          text: "El usuario ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        fetchUsers();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el usuario. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    Swal.fire({
      title: "Cerrar sesión",
      text: "¿Estás seguro de que deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar cualquier dato de sesión aquí
        navigate("/");
      }
    });
  };

    // Handle logout
    const handleLogout2 = () => {
      // Limpiar cualquier dato de sesión aquí si es necesario
      navigate("/api");
    };

    const handleLogout3 = () => {
      // Limpiar cualquier dato de sesión aquí si es necesario
      navigate("/cupones");
    };
    
    const handleLogout4 = () => {
      // Limpiar cualquier dato de sesión aquí si es necesario
      navigate("/listado-devoluciones");
    };
    
    

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#232f3e" }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "#ff9900", fontWeight: "bold" }}
          >
            Panel de Administración
          </Typography>
          <Button color="inherit" onClick={handleLogout2}>
            Consumir Api
          </Button>
          <Button color="inherit" onClick={handleLogout3}>
            Cupones
          </Button>
          <Button color="inherit" onClick={handleLogout4}>
            Devoluciones
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
          
        </Toolbar>
      </AppBar>

      <Container>
        <Typography variant="h4" sx={{ textAlign: "center", marginY: 4 }}>
          Panel de Administración
        </Typography>

        <Box sx={{ textAlign: "right", marginBottom: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ff9900", color: "white" }}
            onClick={() => handleOpen()}
          >
            Agregar Usuario
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tipo de Usuario</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.nombres || "N/A"} {user.apellidos || "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.tipo_usuario}</TableCell>
                  <TableCell>{user.nombre_empresa || "N/A"}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ marginRight: 1 }}
                      onClick={() => handleOpen(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDelete(user.id, user.tipo_usuario)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for Add/Edit */}
        <Dialog open={open} onClose={handleClose} fullWidth>
          <DialogTitle>
            {selectedUser ? "Editar Usuario" : "Agregar Usuario"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de Usuario"
                  name="tipo_usuario"
                  value={form.tipo_usuario}
                  onChange={handleChange}
                >
                  <MenuItem value="Cliente">Cliente</MenuItem>
                  <MenuItem value="Proveedor">Proveedor</MenuItem>
                </TextField>
              </Grid>
              {form.tipo_usuario === "Proveedor" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de la Empresa"
                    name="nombre_empresa"
                    value={form.nombre_empresa}
                    onChange={handleChange}
                  />
                </Grid>
              )}
              {form.tipo_usuario === "Cliente" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombres"
                      name="nombres"
                      value={form.nombres}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Apellidos"
                      name="apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Celular"
                  name="celular"
                  value={form.celular}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={handleChange}
                  required={!selectedUser} // Requerido solo al agregar un nuevo usuario
                />
              </Grid>

              {form.tipo_usuario === "Proveedor" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección Física"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: "#ff9900", color: "white" }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminPanel;
