package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"
)

func enableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Cambia "*" por el dominio de tu frontend si es necesario
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Responder a las solicitudes OPTIONS directamente
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Estructuras para mapear la respuesta XML del endpoint Variables
type VariablesResponse struct {
	XMLName         xml.Name `xml:"Envelope"`
	VariablesResult struct {
		CambioDolar struct {
			VarDolar struct {
				Fecha      string `xml:"fecha"`
				Referencia string `xml:"referencia"`
			} `xml:"VarDolar"`
		} `xml:"CambioDolar"`
		CambioDia struct {
			Var struct {
				Moneda int    `xml:"moneda"`
				Fecha  string `xml:"fecha"`
				Venta  string `xml:"venta"`
				Compra string `xml:"compra"`
			} `xml:"Var"`
		} `xml:"CambioDia"`
	} `xml:"Body>VariablesResponse>VariablesResult"`
}

type JsonResponse struct {
	Fecha       string  `json:"fecha"`
	Referencia  float64 `json:"referencia,omitempty"`
	Moneda      int     `json:"moneda,omitempty"`
	Venta       float64 `json:"venta,omitempty"`
	Compra      float64 `json:"compra,omitempty"`
	Description string  `json:"description"`
}

// Función para obtener el tipo de cambio según el ID
func obtenerTipoCambioPorVariable(variableID int) (JsonResponse, error) {
	// URL del servicio SOAP
	soapURL := "https://banguat.gob.gt/variables/ws/TipoCambio.asmx"

	// Solicitud SOAP para el endpoint Variables
	soapRequest := fmt.Sprintf(`<?xml version="1.0" encoding="utf-8"?>
	<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	  <soap:Body>
	    <Variables xmlns="http://www.banguat.gob.gt/variables/ws/">
	      <variable>%d</variable>
	    </Variables>
	  </soap:Body>
	</soap:Envelope>`, variableID)

	// Crear solicitud HTTP
	req, err := http.NewRequest("POST", soapURL, bytes.NewBuffer([]byte(soapRequest)))
	if err != nil {
		return JsonResponse{}, fmt.Errorf("error al crear la solicitud: %v", err)
	}

	// Establecer encabezados
	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", `"http://www.banguat.gob.gt/variables/ws/Variables"`)

	// Cliente HTTP con timeout
	client := &http.Client{
		Timeout: time.Second * 30,
	}

	// Enviar solicitud
	resp, err := client.Do(req)
	if err != nil {
		return JsonResponse{}, fmt.Errorf("error al enviar la solicitud: %v", err)
	}
	defer resp.Body.Close()

	// Leer la respuesta
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return JsonResponse{}, fmt.Errorf("error al leer la respuesta: %v", err)
	}

	// Procesar la respuesta XML
	var response VariablesResponse
	if err := xml.Unmarshal(body, &response); err != nil {
		return JsonResponse{}, fmt.Errorf("error al procesar la respuesta XML: %v", err)
	}

	// Decidir el tipo de respuesta basado en el ID
	if variableID == 2 { // USD
		return JsonResponse{
			Fecha:       response.VariablesResult.CambioDolar.VarDolar.Fecha,
			Referencia:  parseFloat(response.VariablesResult.CambioDolar.VarDolar.Referencia),
			Description: "Tipo de cambio del dólar (USD)",
		}, nil
	} else { // MXN o JPY
		return JsonResponse{
			Fecha:       response.VariablesResult.CambioDia.Var.Fecha,
			Moneda:      response.VariablesResult.CambioDia.Var.Moneda,
			Venta:       parseFloat(response.VariablesResult.CambioDia.Var.Venta),
			Compra:      parseFloat(response.VariablesResult.CambioDia.Var.Compra),
			Description: "Tipo de cambio de la moneda solicitada",
		}, nil
	}
}

func parseFloat(value string) float64 {
	result, err := strconv.ParseFloat(value, 64)
	if err != nil {
		log.Printf("Error convirtiendo referencia a float: %v", err)
		return 0.0
	}
	return result
}

// Función para convertir quetzales a otra moneda
// Función para convertir quetzales a otra moneda
func convertirQuetzales(variableID int, cantidad float64) (map[string]interface{}, error) {
	tipoCambio, err := obtenerTipoCambioPorVariable(variableID)
	if err != nil {
		return nil, err
	}

	// Realizar conversión basado en el tipo de cambio
	var conversion float64
	if variableID == 2 { // USD
		conversion = cantidad * tipoCambio.Referencia
	} else { // MXN, JPY
		conversion = cantidad / tipoCambio.Venta
	}

	// Crear respuesta
	return map[string]interface{}{
		"cantidad_quetzales": cantidad,
		"conversion":         conversion,
		"moneda_destino":     tipoCambio.Description,
		"fecha":              tipoCambio.Fecha,
	}, nil
}

// Servidor HTTP para manejar las peticiones
func main() {
	// Crear un router
	mux := http.NewServeMux()

	// Ruta principal
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, "hello, world Go!")
		} else {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		}
	})

	// Rutas adicionales (tipo-cambio y convertir)
	mux.HandleFunc("/tipo-cambio", func(w http.ResponseWriter, r *http.Request) {
		ids, ok := r.URL.Query()["id"]
		if !ok || len(ids[0]) < 1 {
			http.Error(w, "ID de variable faltante en la solicitud", http.StatusBadRequest)
			return
		}

		varID, err := strconv.Atoi(ids[0])
		if err != nil || (varID != 2 && varID != 18 && varID != 3) {
			http.Error(w, "ID de variable inválido. Debe ser 2 (USD), 18 (MXN) o 3 (JPY)", http.StatusBadRequest)
			return
		}

		tipoCambio, err := obtenerTipoCambioPorVariable(varID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error al obtener el tipo de cambio: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tipoCambio)
	})

	mux.HandleFunc("/convertir", func(w http.ResponseWriter, r *http.Request) {
		ids, ok := r.URL.Query()["id"]
		if !ok || len(ids[0]) < 1 {
			http.Error(w, "ID de variable faltante en la solicitud", http.StatusBadRequest)
			return
		}
		cantidades, ok := r.URL.Query()["cantidad"]
		if !ok || len(cantidades[0]) < 1 {
			http.Error(w, "Cantidad faltante en la solicitud", http.StatusBadRequest)
			return
		}

		varID, err := strconv.Atoi(ids[0])
		if err != nil || (varID != 2 && varID != 18 && varID != 3) {
			http.Error(w, "ID de variable inválido. Debe ser 2 (USD), 18 (MXN) o 3 (JPY)", http.StatusBadRequest)
			return
		}
		cantidad, err := strconv.ParseFloat(cantidades[0], 64)
		if err != nil || cantidad <= 0 {
			http.Error(w, "Cantidad inválida", http.StatusBadRequest)
			return
		}

		conversion, err := convertirQuetzales(varID, cantidad)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error al convertir: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(conversion)
	})

	// Configurar el servidor para escuchar en 0.0.0.0:8080 con middleware CORS
	host := "0.0.0.0"
	port := 8080
	fmt.Printf("Servidor iniciado en %s:%d...\n", host, port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%d", host, port), enableCors(mux)))
}
