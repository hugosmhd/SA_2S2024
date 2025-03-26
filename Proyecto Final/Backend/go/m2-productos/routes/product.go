package routes

import (
	// "os"
    "fmt"
	"strings"
	"encoding/json"

    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
	

    "m2-productos/controllers"
    // "m2-productos/models"
)

var jwtSecret = []byte("11a23498c20ce53963c1b69d288c4e3244736c2e20b5ac458dddd318162c00d5")

// Middleware para verificar JWT y obtener la información del usuario
func verifyJWT(c *fiber.Ctx) error {
	// Obtener el token del header Authorization (en formato "Bearer <token>")
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "No token provided",
		})
	}

	// El token debe estar en formato: "Bearer <token>"
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization format",
		})
	}

	// Obtener el token (parte 2 de la cadena)
	tokenString := parts[1]

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("algoritmo inesperado: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Error al verificar el token",
		})
	}

	// Procesar el payload del token
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Obtener el campo "identity" como cadena JSON
		jsonString, ok := claims["sub"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Error al verificar el token",
            })
		}

		// Deserializar la cadena JSON a un mapa
		var identity map[string]interface{}
		err := json.Unmarshal([]byte(jsonString), &identity)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Error al verificar el token",
            })
		}

        c.Locals("user", identity)
	} else {
		fmt.Println("Token inválido.")
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Error al verificar el token",
		})
	}


	// Validar el token
	// token, err := jwt.ParseWithClaims(tokenString, &models.JwtClaims{}, func(token *jwt.Token) (interface{}, error) {
	// 	// Verificar el método de firma (asegurarse de que sea HMAC)
	// 	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
	// 		return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
	// 	}
	// 	return jwtSecret, nil
	// })

	// // Verificar errores y la validez del token
	// if err != nil || !token.Valid {
	// 	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
	// 		"error": "Invalid or expired token",
	// 	})
	// }

	// // Extraer los claims del token
	// claims, ok := token.Claims.(*models.JwtClaims)
	// if !ok {
	// 	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
	// 		"error": "Unable to extract claims",
	// 	})
	// }

	// // // Guardar los claims en el contexto para usarlos en la siguiente ruta
	// c.Locals("user", claims.Sub)

	// Continuar con la siguiente función
	return c.Next()
}



func SetupRoutes(app *fiber.App) {
    api := app.Group("/api")
    
    api.Get("/products-category", controllers.GetProductsByCategory)           // Get all products
    api.Get("/products/:id", controllers.GetProductByID)    // Get product by ID
    api.Put("/products/:id", controllers.UpdateProduct)     // Update a product
    api.Delete("/products/:id", controllers.DeleteProduct)  // Delete a product
    
    // protected
    api.Post("/products", verifyJWT, controllers.CreateProduct)        // Create a new product
    api.Get("/products-provider", verifyJWT, controllers.GetProducts)           // Get all products
}
