package controllers

import (
    "fmt"
    "github.com/gofiber/fiber/v2"

    "m2-productos/models"
    "m2-productos/services"
)

func GetProducts(c *fiber.Ctx) error {
    userData := c.Locals("user").(map[string]interface{})
    userIDRaw := userData["id"]
    userID, ok := userIDRaw.(float64)
    if !ok {
        return fmt.Errorf("El campo 'id' no es un número válido")
    }
    finalUserID := int(userID)


    products, err := services.FetchAllProductsBySupplier(finalUserID)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "No se pudieron obtener los productos"})
    }
    return c.JSON(products)
}

func GetProductsByCategory(c *fiber.Ctx) error {
    products, err := services.FetchAllProductsByCategory()
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "No se pudieron obtener los productos"})
    }
    return c.JSON(products)
}

func GetProductByID(c *fiber.Ctx) error {
    id := c.Params("id")
    product, err := services.FetchProductByID(id)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Producto no encontrado"})
    }
    return c.JSON(product)
}

func CreateProduct(c *fiber.Ctx) error {
    var product models.Product
    if err := c.BodyParser(&product); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
    }
    
    userData := c.Locals("user").(map[string]interface{})
    userIDRaw := userData["id"]
    userID, ok := userIDRaw.(float64)
    if !ok {
        return fmt.Errorf("El campo 'id' no es un número válido")
    }
    finalUserID := int(userID)

    // userID := user["sub"].(map[string]interface{})["id"]
    // userTipo := user["sub"].(map[string]interface{})["tipo"]
    // fmt.Println(userInfo.ID)

    createdProduct, err := services.CreateProduct(product, finalUserID)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el producto"})
    }
    return c.Status(201).JSON(createdProduct)
}

func UpdateProduct(c *fiber.Ctx) error {
    id := c.Params("id")
    var product models.Product
    if err := c.BodyParser(&product); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
    }

    updatedProduct, err := services.UpdateProduct(id, product)
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Producto no encontrado"})
    }
    return c.JSON(updatedProduct)
}

func DeleteProduct(c *fiber.Ctx) error {
    id := c.Params("id")
    if err := services.DeleteProduct(id); err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Producto no encontrado"})
    }
    return c.SendStatus(204)
}