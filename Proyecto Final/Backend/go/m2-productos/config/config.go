package config

import (
    "os"
    "fmt"
)

type Config struct {
    Port        string
    DatabaseURL string
}

func LoadConfig() Config {
    return Config{
        Port:        getEnv("PORT", "3001"),
        DatabaseURL: buildDatabaseURL(),
    }
}

func getEnv(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}

func buildDatabaseURL() string {
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "testdb")

	// Construcción de la URL de conexión
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)
}
