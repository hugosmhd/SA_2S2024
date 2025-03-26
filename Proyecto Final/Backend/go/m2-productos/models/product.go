package models

type Product struct {
    Id_producto   uint     `gorm:"primaryKey;column:id_producto"`   // mapea a la columna 'id_producto'
    Id_proveedor  uint     `gorm:"column:id_proveedor"`             // mapea a la columna 'id_proveedor'
    Id_categoria  uint     `gorm:"column:id_categoria"`             // mapea a la columna 'id_categoria'
    Nombre_producto string   `gorm:"column:nombre_producto" json:"nombre_producto"` // mapea a la columna 'nombre_producto' y se usará 'name' en JSON
    Precio   float64  `gorm:"column:precio" json:"precio"`  // mapea a la columna 'precio' y se usará 'price' en JSON
    Stock       int      `gorm:"column:stock" json:"stock"`      // mapea a la columna 'stock' y se usará 'stock' en JSON
    Imagen_producto string   `gorm:"column:imagen_producto" json:"imagen_producto"` // mapea a la columna 'nombre_producto' y se usará 'name' en JSON
    Category    Category `gorm:"foreignKey:Id_categoria;references:Id_categoria"`
}

func (Product) TableName() string {
    return "Productos"
}