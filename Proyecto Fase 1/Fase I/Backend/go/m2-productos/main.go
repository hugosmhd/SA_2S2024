package main

import (
    "log"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/joho/godotenv"

    "m2-productos/config"
    "m2-productos/database"
    "m2-productos/routes"
)

func main() {

    err := godotenv.Load()

    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Carga configuración
    config := config.LoadConfig()

    // Inicializa la conexión a la base de datos
    database.ConnectDB(config.DatabaseURL)

    // Inicia Fiber
    app := fiber.New()
    app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PATCH, DELETE, PUT",
		AllowCredentials: false,
	}))

    // Configura rutas
    routes.SetupRoutes(app)
    routes.SetupRoutesCategory(app)
    // Ruta "hello, world Go!"
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).SendString("hello, world Go!")
	})

    // Inicia el servidor
    log.Fatal(app.Listen(":" + config.Port))
}