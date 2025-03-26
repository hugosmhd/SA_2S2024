package models

type Category struct {
    Id_categoria   uint    `gorm:"primaryKey;column:id_categoria"`   // mapea a la columna 'ProductID'
    Nombre_categoria string  `gorm:"column:nombre_categoria" json:"nombre_categoria"` // mapea a la columna 'ProductName' y se usará 'name' en JSON
    Products     []Product `gorm:"foreignKey:Id_categoria;references:Id_categoria" json:"Products"`
}

func (Category) TableName() string {
    return "Categorias"
}