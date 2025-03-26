package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

// Estructuras para mapear las respuestas de la API SOAP
type MonedasResponse struct {
	XMLName         xml.Name `xml:"Envelope"`
	VariablesResult struct {
		Variables []struct {
			Moneda      int    `xml:"moneda"`
			Descripcion string `xml:"descripcion"`
		} `xml:"Variables>Variable"`
	} `xml:"Body>VariablesResponse>VariablesResult"`
}

type TipoCambioResponse struct {
	XMLName         xml.Name `xml:"Envelope"`
	VariablesResult struct {
		CambioDia struct {
			Var struct {
				Moneda int     `xml:"moneda"`
				Fecha  string  `xml:"fecha"`
				Venta  float64 `xml:"venta"`
				Compra float64 `xml:"compra"`
			} `xml:"Var"`
		} `xml:"CambioDia"`
	} `xml:"Body>VariablesResponse>VariablesResult"`
}

// Estructura para representar las monedas en JSON con tipos de cambio
type Moneda struct {
	Moneda      int     `json:"moneda"`
	Descripcion string  `json:"descripcion"`
	Fecha       string  `json:"fecha"`
	Venta       float64 `json:"venta"`
	Compra      float64 `json:"compra"`
}

// Función para obtener la lista de monedas
func listarMonedas() ([]Moneda, error) {
	soapURL := "https://banguat.gob.gt/variables/ws/TipoCambio.asmx"
	soapRequest := `<?xml version="1.0" encoding="utf-8"?>
	<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	  <soap:Body>
	    <Variables xmlns="http://www.banguat.gob.gt/variables/ws/">
	      <variable>0</variable>
	    </Variables>
	  </soap:Body>
	</soap:Envelope>`

	req, err := http.NewRequest("POST", soapURL, bytes.NewBuffer([]byte(soapRequest)))
	if err != nil {
		return nil, fmt.Errorf("error al crear la solicitud: %v", err)
	}

	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", `"http://www.banguat.gob.gt/variables/ws/Variables"`)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error al enviar la solicitud: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer la respuesta: %v", err)
	}

	var response MonedasResponse
	err = xml.Unmarshal(body, &response)
	if err != nil {
		return nil, fmt.Errorf("error al procesar la respuesta XML: %v", err)
	}

	monedas := make([]Moneda, len(response.VariablesResult.Variables))
	for i, moneda := range response.VariablesResult.Variables {
		fecha, venta, compra, err := obtenerTipoCambio(moneda.Moneda)
		if err != nil {
			fecha, venta, compra = "", 0.0, 0.0
		}
		monedas[i] = Moneda{
			Moneda:      moneda.Moneda,
			Descripcion: moneda.Descripcion,
			Fecha:       fecha,
			Venta:       venta,
			Compra:      compra,
		}
	}

	return monedas, nil
}

// Función para obtener el tipo de cambio de una moneda específica
func obtenerTipoCambio(monedaID int) (string, float64, float64, error) {
	soapURL := "https://banguat.gob.gt/variables/ws/TipoCambio.asmx"
	soapRequest := fmt.Sprintf(`<?xml version="1.0" encoding="utf-8"?>
	<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	  <soap:Body>
	    <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/">
	      <variable>%d</variable>
	    </TipoCambioDia>
	  </soap:Body>
	</soap:Envelope>`, monedaID)

	req, err := http.NewRequest("POST", soapURL, bytes.NewBuffer([]byte(soapRequest)))
	if err != nil {
		return "", 0, 0, fmt.Errorf("error al crear la solicitud: %v", err)
	}

	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", `"http://www.banguat.gob.gt/variables/ws/TipoCambioDia"`)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, 0, fmt.Errorf("error al enviar la solicitud: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", 0, 0, fmt.Errorf("error al leer la respuesta: %v", err)
	}

	var response TipoCambioResponse
	err = xml.Unmarshal(body, &response)
	if err != nil {
		return "", 0, 0, fmt.Errorf("error al procesar la respuesta XML: %v", err)
	}

	fecha := response.VariablesResult.CambioDia.Var.Fecha
	venta := response.VariablesResult.CambioDia.Var.Venta
	compra := response.VariablesResult.CambioDia.Var.Compra

	return fecha, venta, compra, nil
}

// Handler para la ruta /monedas
func monedasHandler(w http.ResponseWriter, r *http.Request) {
	monedas, err := listarMonedas()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al obtener monedas: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(monedas)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al codificar JSON: %v", err), http.StatusInternalServerError)
	}
}

func main() {
	http.HandleFunc("/monedas", monedasHandler)
	fmt.Println("Servidor ejecutándose en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
