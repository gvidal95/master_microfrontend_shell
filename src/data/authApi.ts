// Ejemplo endpoint: http://localhost:8080/api/auth/login

const authLoginRequest = {
    "userMail": "gabriel@email.com",
    "userPassword": "123456"
}

const authLoginResponse = {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyUm9sZSI6IlVTVUFSSU9fRklOQUwiLCJ1c2VySWQiOjEsInN1YiI6ImdhYnJpZWxAZW1haWwuY29tIiwiaWF0IjoxNzg3MDc3NDAwLCJleHAiOjE3ODcxNjM4MDB9.wEfGesqPWRaYcJjJ78eWp3LmC7b6NEy7tuenHLjRM30uCRLgORtZ883E0iKUa5-SKEP-HyI58zX2OIb7z8L5rQ",
    "userId": 1,
    "userName": "Gabriel Vidal",
    "userMail": "gabriel@email.com",
    "userRole": "USUARIO_FINAL"
}