package services

import (
    "m2-productos/models"
    "m2-productos/repository"
)

func FetchAllCategories() ([]models.Category, error) {
    return repository.GetAllCategories()
}