#!/bin/bash

# URL base
BASE_URL="http://localhost:5001/api"
TOKEN=""

echo "=== Test de Endpoints ==="

# 1. Login como admin
echo "\n1. Login como admin"
response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@odontologos.com","password":"Admin@2024!"}')
TOKEN=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token obtenido: $TOKEN"

# 2. Crear un nuevo médico
echo "\n2. Crear nuevo médico"
curl -X POST "$BASE_URL/medicos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Test",
    "email": "doctor.test@example.com",
    "specialization": ["general"],
    "licenseNumber": "12345",
    "experience": 5
  }'

# 3. Listar todos los médicos
echo "\n3. Listar médicos"
curl -X GET "$BASE_URL/medicos" \
  -H "Authorization: Bearer $TOKEN"

# 4. Actualizar estado de un médico (reemplazar ID)
echo "\n4. Actualizar estado de médico (reemplazar ID)"
echo "curl -X PUT \"$BASE_URL/medicos/DOCTOR_ID\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer $TOKEN\" \\"
echo "  -d '{\"status\":\"inactive\"}'"

# 5. Eliminar un médico (reemplazar ID)
echo "\n5. Eliminar médico (reemplazar ID)"
echo "curl -X DELETE \"$BASE_URL/medicos/DOCTOR_ID\" \\"
echo "  -H \"Authorization: Bearer $TOKEN\""

echo "\n=== Fin de las pruebas ===" 