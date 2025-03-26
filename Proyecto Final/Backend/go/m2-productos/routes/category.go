package routes

import (
    "github.com/gofiber/fiber/v2"
    "m2-productos/controllers"
)

func SetupRoutesCategory(app *fiber.App) {
    api := app.Group("/api")
    
    api.Get("/categories", controllers.GetCategories)           // Get all products
}
