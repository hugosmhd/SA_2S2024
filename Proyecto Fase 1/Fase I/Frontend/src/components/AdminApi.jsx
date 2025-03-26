import React, { useState } from "react";
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
  AppBar,
  Toolbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Para manejar redirecciones

const AdminApi = () => {
  const [products, setProducts] = useState([]); // Estado para productos externos
  const [apiUrl, setApiUrl] = useState(""); // Estado para el endpoint de la API externa
  const [monedas] = useState([
    { moneda: 4, descripcion: "Francos Belgas", fecha: "", venta: 0, compra: 0 },
    { moneda: 5, descripcion: "Francos Suizos", fecha: "", venta: 0, compra: 0 },
    { moneda: 6, descripcion: "Francos Franceses", fecha: "", venta: 0, compra: 0 },
    { moneda: 7, descripcion: "Dólares Canadienses", fecha: "", venta: 0, compra: 0 },
    { moneda: 8, descripcion: "Liras Italianas", fecha: "", venta: 0, compra: 0 },
    { moneda: 9, descripcion: "Libras Esterlinas", fecha: "", venta: 0, compra: 0 },
    { moneda: 11, descripcion: "Marcos Alemanes", fecha: "", venta: 0, compra: 0 },
    { moneda: 12, descripcion: "Pesetas Españolas", fecha: "", venta: 0, compra: 0 },
    { moneda: 13, descripcion: "Chelines Austríacos", fecha: "", venta: 0, compra: 0 },
    { moneda: 14, descripcion: "Florines Holandeses", fecha: "", venta: 0, compra: 0 },
  ]); // Monedas disponibles
  const [selectedMoneda, setSelectedMoneda] = useState(""); // Moneda seleccionada
  const [monedasAgregadas, setMonedasAgregadas] = useState([]); // Monedas agregadas
  const navigate = useNavigate(); // Hook para redirección

  const backendURL = "http://127.0.0.1:3005/auth"; // Reemplaza con la URL de tu backend

  const handleAgregarMoneda = () => {
    if (!selectedMoneda) {
      Swal.fire("Error", "Por favor, selecciona una moneda.", "error");
      return;
    }

    const monedaSeleccionada = monedas.find(
      (moneda) => moneda.descripcion === selectedMoneda
    );

    setMonedasAgregadas((prev) => [...prev, monedaSeleccionada]);
    Swal.fire(
      "Éxito",
      `Moneda ${monedaSeleccionada.descripcion} agregada correctamente.`,
      "success"
    );
    setSelectedMoneda("");
  };

  const handleApiConsumptionAndSave = async () => {
    if (!apiUrl) {
      Swal.fire("Error", "Por favor, introduce un endpoint válido.", "error");
      return;
    }

    try {
      const response = await axios.get(apiUrl);
      const { body, message } = response.data;

      if (body && Array.isArray(body)) {
        setProducts(body);
        Swal.fire("Éxito", message || "Productos obtenidos correctamente.", "success");

        const saveResponse = await axios.post(`${backendURL}/productos-externos/consumir`, {
          api_url: apiUrl,
        });

        if (saveResponse.status === 201) {
          Swal.fire("Éxito", "Productos guardados correctamente en la base de datos.", "success");
        } else {
          Swal.fire("Error", "No se pudieron guardar los productos en la base de datos.", "error");
        }
      } else {
        Swal.fire("Error", "No se encontraron productos en la API.", "error");
      }
    } catch (error) {
      console.error("Error al procesar los productos:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al consumir la API o guardar los datos. Revisa el endpoint y vuelve a intentarlo.",
        "error"
      );
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro de que deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/login");
      }
    });
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
          <Button
            color="inherit"
            onClick={() => navigate("/admin")}
            sx={{ marginRight: 2 }}
          >
            Volver al Panel Principal
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

        {/* Sección para agregar moneda */}
        <Box
          sx={{
            marginY: 4,
            padding: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Agregar Moneda</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <FormControl fullWidth>
                <InputLabel id="moneda-select-label">Selecciona Moneda</InputLabel>
                <Select
                  labelId="moneda-select-label"
                  value={selectedMoneda}
                  onChange={(e) => setSelectedMoneda(e.target.value)}
                >
                  {monedas.map((moneda) => (
                    <MenuItem key={moneda.moneda} value={moneda.descripcion}>
                      {moneda.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAgregarMoneda}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabla para mostrar monedas agregadas */}
        {monedasAgregadas.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Monedas Agregadas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Venta</TableCell>
                    <TableCell>Compra</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monedasAgregadas.map((moneda) => (
                    <TableRow key={moneda.moneda}>
                      <TableCell>{moneda.moneda}</TableCell>
                      <TableCell>{moneda.descripcion}</TableCell>
                      <TableCell>{moneda.venta}</TableCell>
                      <TableCell>{moneda.compra}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Sección para consumir API externa */}
        <Box
          sx={{
            marginY: 4,
            padding: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Consumir API Externa y Guardar</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="URL de la API"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Introduce el endpoint de la API externa"
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApiConsumptionAndSave}
              >
                Consumir y Guardar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabla para mostrar productos externos */}
        {products.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Productos Externos
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Imagen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.SKU}>
                      <TableCell>{product.SKU}</TableCell>
                      <TableCell>{product.Nombre}</TableCell>
                      <TableCell>{product.Categoria}</TableCell>
                      <TableCell>{product.Precio}</TableCell>
                      <TableCell>{product.Stock}</TableCell>
                      <TableCell>
                        <img
                          src={product.Imagen}
                          alt={product.Nombre}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </>
  );
};

export default AdminApi;
