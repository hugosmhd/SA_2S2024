package repository

import (
    "fmt"
    "strconv"
    "errors"
    "m2-productos/database"
    "m2-productos/models"
)

func GetAllProductsBySupplier(idSupplier int) ([]models.Product, error) {
    var products []models.Product

    if err := database.DB.Where("Id_proveedor = ?", idSupplier).
        Preload("Category"). // Esto realiza el join implícitamente para cargar la categoría
        Find(&products).Error; err != nil {
        return nil, err
    }

    return products, nil
}

func GetProductsGroupedByCategory() ([]models.Category, error) {
    var categories []models.Category
    // Obtener categorías con sus productos
    if err := database.DB.Preload("Products").Find(&categories).Error; err != nil {
        return nil, err
    }
    // Retornar las categorías con los productos agrupados
    return categories, nil
}

func GetProductByID(id string) (models.Product, error) {
    var product models.Product
    intID, err := strconv.Atoi(id)
    if err != nil {
        return product, fmt.Errorf("invalid ID format: %v", err)
    }

    if err := database.DB.First(&product, intID).Error; err != nil {
        return product, err
    }
    return product, nil
}

func CreateProduct(product models.Product, userID int) (models.Product, error) {

    var someVar uint // de tipo uint
    someVar = uint(userID) // conversión explícita de int a uint
    
    product.Id_proveedor = someVar
    if err := database.DB.Create(&product).Error; err != nil {
        return product, err
    }
    return product, nil
}

func UpdateProduct(id string, product models.Product) (models.Product, error) {
    var existingProduct models.Product
    if err := database.DB.Preload("Category").First(&existingProduct, id).Error; err != nil {
        return existingProduct, errors.New("producto no encontrado")
    }

    // Actualizar campos
    // existingProduct.ProductName = product.ProductName
    existingProduct.Precio = product.Precio
    existingProduct.Stock = product.Stock
    // existingProduct.CategoryID = product.CategoryID

    if err := database.DB.Save(&existingProduct).Error; err != nil {
        return existingProduct, err
    }
    return existingProduct, nil
}

func DeleteProduct(id string) error {
    if err := database.DB.Delete(&models.Product{}, id).Error; err != nil {
        return errors.New("producto no encontrado")
    }
    return nil
}