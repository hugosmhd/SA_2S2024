package models

import (
    "github.com/golang-jwt/jwt/v5"
)

type UserInfo struct {
	ID   int    `json:"id"`
	Tipo string `json:"tipo"`
}

// Estructura de los claims con los datos del token
type JwtClaims struct {
	Fresh bool     `json:"fresh"`
	Iat   int64    `json:"iat"`
	Jti   string   `json:"jti"`
	Type  string   `json:"type"`
	Sub   UserInfo `json:"sub"`
	Nbf   int64    `json:"nbf"`
	Csrf  string   `json:"csrf"`
	Exp   int64    `json:"exp"`
	jwt.RegisteredClaims
}