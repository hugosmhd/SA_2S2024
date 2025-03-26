import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Register = () => {
  const [formData, setFormData] = useState({
    tipo_usuario: "Cliente", // Valor predeterminado
    nombre_empresa: "",
    nombres: "",
    apellidos: "",
    email: "",
    contrasena: "",
    direccion: "",
    celular: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://saf1.35.192.41.172.nip.io/pythonm1/auth/register", formData);

      setMessage(response.data.message);
      setLoading(false);
      navigate("/login"); // Redirigir al login después del registro exitoso
    } catch (error) {
      setMessage(error.response?.data?.error || "Error al registrar el usuario");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#232f3e" }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: "#ff9900",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            EconoMarket
          </Typography>
          <Button
            color="inherit"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/register")}
            sx={{ marginRight: 1 }}
          >
            Registrarse
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 500,
            padding: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "white",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#232f3e", textAlign: "center" }}
          >
            Registrarse
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              select
              label="Tipo de Usuario"
              fullWidth
              margin="normal"
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleChange}
              required
            >
              <MenuItem value="Cliente">Cliente</MenuItem>
              <MenuItem value="Proveedor">Proveedor</MenuItem>
            </TextField>
            {formData.tipo_usuario === "Proveedor" && (
              <TextField
                label="Nombre de la Empresa"
                fullWidth
                margin="normal"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleChange}
                required
              />
            )}
            {formData.tipo_usuario === "Cliente" && (
              <>
                <TextField
                  label="Nombres"
                  fullWidth
                  margin="normal"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Apellidos"
                  fullWidth
                  margin="normal"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <TextField
              label="Correo Electrónico"
              fullWidth
              margin="normal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Contraseña"
              fullWidth
              margin="normal"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
            <TextField
              label="Celular"
              fullWidth
              margin="normal"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              required
            />
            {formData.tipo_usuario === "Proveedor" && (
              <TextField
                label="Dirección Física"
                fullWidth
                margin="normal"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                backgroundColor: "#ff9900",
                color: "white",
                "&:hover": { backgroundColor: "#cc7a00" },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Registrar"}
            </Button>
          </form>
          {message && (
            <Alert
              severity={message.includes("exitosamente") ? "success" : "error"}
              sx={{
                mt: 2,
                backgroundColor: message.includes("exitosamente")
                  ? "#e6f4ea"
                  : "#fbeaea",
              }}
            >
              {message}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: "#232f3e", color: "white", padding: 2, textAlign: "center" }}>
        <Typography variant="body1">© 2024 EconoMarket - Todos los derechos reservados.</Typography>
      </Box>
    </Box>
  );
};

export default Register;
