package services

import (
    "m2-productos/models"
    "m2-productos/repository"
)

func FetchAllProductsBySupplier(userID int) ([]models.Product, error) {
    return repository.GetAllProductsBySupplier(userID)
}

func FetchAllProductsByCategory() ([]models.Category, error) {
    return repository.GetProductsGroupedByCategory()
}

func FetchProductByID(id string) (models.Product, error) {
    return repository.GetProductByID(id)
}

func CreateProduct(product models.Product, userID int) (models.Product, error) {
    return repository.CreateProduct(product, userID)
}

func UpdateProduct(id string, product models.Product) (models.Product, error) {
    return repository.UpdateProduct(id, product)
}

func DeleteProduct(id string) error {
    return repository.DeleteProduct(id)
}