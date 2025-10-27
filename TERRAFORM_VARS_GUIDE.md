# Guía de Variables de Entorno para Terraform

## Variables Críticas para el Despliegue

Tu compañero necesita configurar estas 3 variables OBLIGATORIAS para el build del frontend:

### 1. VITE_API_BASE_URL
**¿Qué es?** URL donde está desplegado el backend API

**Valores por entorno:**
```bash
# Desarrollo
VITE_API_BASE_URL=http://localhost:8080/api

# Producción (ejemplo)
VITE_API_BASE_URL=https://api.educloud.com/api
```

**En Terraform:**
```hcl
variable "api_base_url" {
  description = "URL del backend API"
  type        = string
  default     = "https://api.educloud.com/api"
}
```

---

### 2. VITE_RSA_PUBLIC_KEY
**¿Qué es?** Clave pública RSA para cifrar contraseñas en el frontend

**IMPORTANTE:**
- Es una clave **PÚBLICA** - es SEGURO que esté en el frontend
- Debe coincidir con la clave privada del backend
- Se usa solo para CIFRAR (no descifrar)

**Formato:**
```bash
VITE_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0QFwed5G4KLpGKa9a4GQ
...
fQIDAQAB
-----END PUBLIC KEY-----"
```

**Obtener la clave:**
1. Contactar al equipo de backend
2. O desde AWS Secrets Manager si ya está guardada
3. O generar un nuevo par de claves (coordinar con backend)

**En Terraform:**
```hcl
# Opción 1: Desde AWS Secrets Manager
data "aws_secretsmanager_secret_version" "rsa_public_key" {
  secret_id = "educloud/rsa_public_key"
}

# Opción 2: Desde variable (no recomendado para producción)
variable "rsa_public_key" {
  description = "RSA Public Key para cifrado frontend"
  type        = string
  sensitive   = false  # Es pública, no es secreto
}
```

---

### 3. VITE_AES_SECRET_KEY
**¿Qué es?** Clave secreta para cifrado AES en localStorage del navegador

**IMPORTANTE:**
- Generar una NUEVA para cada entorno
- NO reutilizar la misma clave entre entornos

**Generar nueva clave:**
```bash
openssl rand -base64 32
```

Ejemplo de salida:
```
Kx4h8GfR2Lm9Np3Qs7Tv1Wx5Yz6Ac0Be2Df4Eg8Hj=
```

**En Terraform:**
```hcl
# Opción 1: Generar en Terraform
resource "random_password" "aes_key" {
  length  = 32
  special = true
}

# Opción 2: Desde AWS Secrets Manager
data "aws_secretsmanager_secret_version" "aes_key" {
  secret_id = "educloud/frontend_aes_key"
}
```

---

## Ejemplo Completo de Terraform

### Archivo: `variables.tf`
```hcl
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "api_base_url" {
  description = "Backend API URL"
  type        = string
}

variable "rsa_public_key" {
  description = "RSA Public Key for frontend encryption"
  type        = string
}
```

### Archivo: `frontend-build.tf`
```hcl
# Generar clave AES única por entorno
resource "random_password" "aes_key" {
  length  = 32
  special = true
  lifecycle {
    ignore_changes = [length, special]
  }
}

# Build del frontend con variables de entorno
resource "null_resource" "frontend_build" {
  triggers = {
    api_url = var.api_base_url
    rsa_key = var.rsa_public_key
  }

  provisioner "local-exec" {
    working_dir = "../educloud"  # Path al repo del frontend
    command     = <<-EOT
      cat > .env <<EOF
VITE_API_BASE_URL=${var.api_base_url}
VITE_RSA_PUBLIC_KEY="${var.rsa_public_key}"
VITE_AES_SECRET_KEY=${random_password.aes_key.result}
VITE_APP_ENV=${var.environment}
VITE_APP_NAME=EduCloud Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_HEALTH_CHECK=true
VITE_DEBUG_MODE=${var.environment == "prod" ? "false" : "true"}
VITE_API_TIMEOUT=30000
VITE_HEALTH_CHECK_TIMEOUT=5000
VITE_TOKEN_REFRESH_INTERVAL=3600000
VITE_SOURCEMAP=${var.environment == "prod" ? "false" : "true"}
EOF
      npm install
      npm run build
    EOT
  }
}

# Subir a S3 (ejemplo)
resource "aws_s3_object" "frontend_dist" {
  for_each = fileset("../educloud/dist", "**/*")

  bucket       = aws_s3_bucket.frontend.id
  key          = each.value
  source       = "../educloud/dist/${each.value}"
  etag         = filemd5("../educloud/dist/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.value), "application/octet-stream")

  depends_on = [null_resource.frontend_build]
}
```

### Archivo: `terraform.tfvars`
```hcl
environment    = "production"
api_base_url   = "https://api.educloud.com/api"
rsa_public_key = <<-EOT
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0QFwed5G4KLpGKa9a4GQ
RZrxRffPBF6yPNrNG5p6wg36CQM8IsoJ5Hwdgq82XPVk9jn1QR4zYbZMIw30TDeH
+jAcGA2YO6YxPHpa0zvlaE/45wuXUNHhUM07uOP1xowbRyHAAuzYdV1jkTMdCjn9
fJPP0F796iF5aRs4nxXUF5cVqDUUIlJwBJMa3q2h4lQ+3FGILJBhJzUKk6oRaAvZ
uEs1ndz+ugLVC1kDwOLG5qRT/zcnPsITVLeWkJ0DXLWqQWlLqlugEJ0ncPON4CuU
n0yobbJ8aiL/Ymu8FF7DzN1GILL4kGD6Pc/iPvfWdBUDSuhMLGuXyR/CzLy304j1
fQIDAQAB
-----END PUBLIC KEY-----
EOT
```

---

## Checklist para tu Compañero

- [ ] Obtener la clave RSA pública del backend
- [ ] Decidir cómo gestionar secretos (Secrets Manager, Vault, etc.)
- [ ] Generar clave AES para el entorno con `openssl rand -base64 32`
- [ ] Configurar las variables en `terraform.tfvars`
- [ ] Validar que el build funciona localmente primero
- [ ] Aplicar Terraform para desplegar

---

## Preguntas Frecuentes

**Q: ¿Es seguro que la clave RSA pública esté en el código?**
A: SÍ. Es una clave PÚBLICA, diseñada para compartirse. Solo puede cifrar, nunca descifrar.

**Q: ¿Y la clave AES?**
A: Es menos crítica porque solo cifra datos en el localStorage del navegador del usuario. Pero es buena práctica usar una única por entorno.

**Q: ¿Dónde está la clave RSA privada?**
A: En el BACKEND. Nunca debe estar en el frontend ni en variables de entorno públicas.

**Q: ¿Qué pasa si cambio la URL de la API después del build?**
A: Hay que hacer un nuevo build. Las variables `VITE_*` se embeben en el JavaScript compilado.

---

## Contacto

Si tienes dudas sobre las claves o variables:
1. Revisa el archivo `.env.example` en el repo del frontend
2. Contacta al equipo de backend para la clave RSA
3. Lee la documentación en `README.md`
