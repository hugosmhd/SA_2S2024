import React, { useEffect, useState } from "react";
import axios from "../services/axiosConfig";
import myAxios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Paper,
  TextField,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";

const apiUrl = import.meta.env.VITE_API_URL;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState("");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [message, setMessage] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const token = localStorage.getItem("token");

  const [cuponData, setCuponData] = useState({
    codigo_cupon: '',
    descuento: 0,
    fecha_vencimiento: '',
    usos_totales: '',
    usos_por_cliente: '',
    estado: 'Activo'
  });

  useEffect(() => {
    fetchCartItems();
    fetchTarjetas();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const carrito = response.data.carrito || [];
      setCartItems(carrito);

      // Calcular el subtotal del carrito
      const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
      setSubtotal(total);
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      setMessage("No se pudo cargar el carrito.");
    }
  };

  const fetchTarjetas = async () => {
    try {
      const response = await axios.get("/tarjetas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarjetas(response.data || []);
    } catch (error) {
      console.error("Error al obtener las tarjetas:", error);
    }
  };

  const handleDelete = async (id_producto) => {
    try {
      setLoading(true);
      await axios.post(
        "/cart/delete",
        { id_producto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedCart = cartItems.filter((item) => item.id_producto !== id_producto);
      setCartItems(updatedCart);

      // Actualizar subtotal
      const total = updatedCart.reduce((sum, item) => sum + item.subtotal, 0);
      setSubtotal(total);

      setMessage("Producto eliminado del carrito.");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      setMessage("No se pudo eliminar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = async () => {
    try {
      setLoading(true);

      if (metodoPago === "tarjeta") {
        if (!tarjetaSeleccionada) {
          setMessage("Por favor selecciona una tarjeta.");
          setLoading(false);
          return;
        }
      }
      console.log(cuponData.descuento);
      
      const response = await axios.post(
        "/cart/confirm",
        {
          metodo_pago: metodoPago,
          id_tarjeta: metodoPago === "tarjeta" ? tarjetaSeleccionada : undefined,
          descuento: cuponData.descuento
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // if (cuponAplicado) {
      //   const responseCupon = await myAxios.post(
      //     "http://localhost:4002/api/aplicar-cupon",
      //     {
      //       codigo_cupon: cuponData.codigo_cupon
      //     },
      //     { headers: { Authorization: `Bearer ${token}` } }
      //   );
      //   console.log(responseCupon);
      // }

      

      setMessage(`Compra confirmada. Total: Q${response.data.total.toFixed(2)}`);
      setCartItems([]);
      setSubtotal(0);
    } catch (error) {
      console.error("Error al confirmar la compra:", error);
      setMessage(error.response?.data?.error || "Error al confirmar la compra.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarCupon = async () => {
    try {
      setLoading(true);
      const response = await myAxios.get(`http://saf1.${apiUrl}.nip.io/nodem8/api/cupon`, {
        params: { codigo_cupon: cuponData.codigo_cupon, id_cliente: 21 },
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(response.data);
      setCuponData(response.data)
      setSubtotal(subtotal-(subtotal*response.data.descuento/100));
      setCuponAplicado(true);
    } catch (error) {
      console.error("Error al confirmar la compra:", error.response.data.message);
      setMessage(error.response?.data?.message || "Error al aplicar cupon.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    setCuponData({
        ...cuponData,
        [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            EconoMarket
          </Typography>
          <Button color="inherit" href="/dash-cliente">
            Productos
          </Button>
          <Button color="inherit" startIcon={<ShoppingCartIcon />} href="/cart">
            Carrito
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Carrito de Compras
        </Typography>

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <Paper
                  key={item.id_producto}
                  elevation={3}
                  sx={{
                    display: "flex",
                    mb: 2,
                    padding: 2,
                    alignItems: "center",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.imagen || "/placeholder.jpg"}
                    alt={item.nombre}
                    sx={{ width: 120, height: 120, objectFit: "cover", marginRight: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{item.nombre}</Typography>
                    <Typography variant="body2">Cantidad: {item.cantidad}</Typography>
                    <Typography variant="body2">
                      Precio: Q{item.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item.id_producto)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))
            ) : (
              <Typography variant="body1" align="center">
                El carrito está vacío.
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">Subtotal: Q{subtotal.toFixed(2)}</Typography>

              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Método de Pago</FormLabel>
                <RadioGroup
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <FormControlLabel
                    value="tarjeta"
                    control={<Radio />}
                    label="Tarjeta"
                  />
                  <FormControlLabel
                    value="cartera"
                    control={<Radio />}
                    label="Cartera"
                  />
                </RadioGroup>
              </FormControl>

              {metodoPago === "tarjeta" && (
                <select
                  value={tarjetaSeleccionada}
                  onChange={(e) => setTarjetaSeleccionada(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                >
                  <option value="">-- Selecciona una tarjeta --</option>
                  {tarjetas.map((tarjeta) => (
                    <option key={tarjeta.id_tarjeta} value={tarjeta.id_tarjeta}>
                      **** {tarjeta.numero_tarjeta.slice(-4)} - Vence: {tarjeta.fecha_vencimiento}
                    </option>
                  ))}
                </select>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={confirmPurchase}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Confirmar Compra"}
              </Button>

              {subtotal>0 && (
                <>
              <TextField
                  label="Cupon de descuento"
                  name="codigo_cupon"
                  value={cuponData.codigo_cupon}
                  onChange={handleChange}
                  fullWidth
                  disabled={cuponAplicado}
                  sx={{ marginTop: 2 }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={aplicarCupon}
                disabled={loading || cuponAplicado}
              >
                {loading ? "Procesando..." : "Aplicar Cupon"}
              </Button>
              </>

              )}

            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Cart;
