package controllers

import (
    "github.com/gofiber/fiber/v2"
    "m2-productos/services"
)

func GetCategories(c *fiber.Ctx) error {
    categories, err := services.FetchAllCategories()
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "No se pudieron obtener los productos"})
    }
    return c.JSON(categories)
}