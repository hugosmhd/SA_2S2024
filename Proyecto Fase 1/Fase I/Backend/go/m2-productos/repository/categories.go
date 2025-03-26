package repository

import (
    "m2-productos/database"
    "m2-productos/models"
)

func GetAllCategories() ([]models.Category, error) {
    var categories []models.Category
    if err := database.DB.Find(&categories).Error; err != nil {
        return nil, err
    }
    return categories, nil
}