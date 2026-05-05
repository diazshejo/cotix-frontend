# Cotix Frontend API Contracts

Base URL local: `http://127.0.0.1:8000/api`

Estado de integración: este documento refleja los contratos reales observados en `C:\py\Cotix\backend` mediante `config/urls.py`, serializers y viewsets.

## Auth

### POST `/auth/login/`
Backend: `LoginView(TokenObtainPairView)`.

Request:
```json
{ "email": "admin@empresa.gt", "password": "password123" }
```

Response real SimpleJWT:
```json
{ "access": "jwt-access-token" }
```

Cookie: el backend guarda el refresh token en `cotix_refresh` con `HttpOnly`, `SameSite` configurable, `Secure` configurable por entorno y `Path=/api/auth/`. El refresh token no se expone en JSON.

Nota frontend: después de login, el frontend llama `GET /auth/me/` para obtener usuario.

### GET `/auth/me/`
Response:
```json
{
  "id": 1,
  "email": "admin@empresa.gt",
  "first_name": "Ana",
  "last_name": "Ventas",
  "role": "tenant_admin",
  "tenant": {
    "id": 1,
    "slug": "empresa",
    "business_name": "Empresa S.A."
  },
  "is_active": true
}
```

### POST `/auth/register/`
Request:
```json
{
  "business_name": "Empresa S.A.",
  "trade_name": "Empresa",
  "nit": "1234567-8",
  "email": "admin@empresa.gt",
  "password": "password123",
  "first_name": "",
  "last_name": ""
}
```

Response real: `UserSerializer`, no tokens. El frontend hace login automático después de registrar.

### POST `/auth/refresh/`

Request: sin body. El backend lee el refresh token desde la cookie `HttpOnly`.

Response:
```json
{ "access": "jwt-access-token" }
```

### POST `/auth/logout/`

Limpia la cookie de refresh. Response:
```json
{ "ok": true }
```

### POST `/auth/forgot-password/`

Request:
```json
{ "email": "admin@empresa.gt" }
```

Response:
```json
{ "ok": true }
```

## Tenant Settings

### GET `/tenant/settings/`
### PUT `/tenant/settings/`

Serializer: `TenantSerializer`.

Campos reales:
```json
{
  "id": 1,
  "slug": "empresa",
  "business_name": "Empresa S.A.",
  "trade_name": "Empresa",
  "nit": "1234567-8",
  "tax_regime": "General",
  "email": "ventas@empresa.gt",
  "phone": "+502 5555-5555",
  "address_line1": "Direccion",
  "address_line2": "",
  "city": "Guatemala",
  "department": "Guatemala",
  "country_code": "GT",
  "logo_url": "",
  "primary_color": "#1a6fdb",
  "default_currency": "GTQ",
  "tax_label": "IVA",
  "tax_rate": "12.00",
  "prices_include_tax": false,
  "quote_prefix": "COT",
  "quote_next_number": 1,
  "default_footer_text": "Texto de pie",
  "status": "demo",
  "is_active": true
}
```

## Clients

### GET `/clients/`
### POST `/clients/`

Serializer: `ClientSerializer`.

Campos:
```json
{
  "id": 1,
  "name": "Roberto Garcia",
  "company_name": "Distribuidora Garcia",
  "email": "compras@empresa.gt",
  "phone": "+502 5555-5555",
  "nit": "1234567-8",
  "address_line1": "",
  "address_line2": "",
  "city": "",
  "department": "",
  "country_code": "GT",
  "notes": "",
  "is_active": true,
  "created_at": "2026-05-03T00:00:00Z",
  "updated_at": "2026-05-03T00:00:00Z"
}
```

## Catalog

### GET `/catalog/items/`
### POST `/catalog/items/`

Serializer: `CatalogItemSerializer`.

Campos:
```json
{
  "id": 1,
  "category": 1,
  "item_type": "service",
  "sku": "SERV-001",
  "name": "Implementacion inicial",
  "description": "Configuracion inicial",
  "unit_price": "5590.0000",
  "unit": "unidad",
  "currency": "GTQ",
  "taxable": true,
  "is_active": true,
  "created_at": "2026-05-03T00:00:00Z",
  "updated_at": "2026-05-03T00:00:00Z"
}
```

### GET `/catalog/categories/`
### POST `/catalog/categories/`

Existe en backend, el frontend todavia no tiene pantalla dedicada.

## Quotes

### GET `/quotes/`
### POST `/quotes/`
### GET `/quotes/:id/`
### PUT/PATCH `/quotes/:id/`

Serializer: `QuoteSerializer`.

Response:
```json
{
  "id": 1,
  "quote_number": "COT-2026-0001",
  "client": 1,
  "assigned_to": null,
  "title": "Cotizacion",
  "issue_date": "2026-05-03",
  "expiry_date": "2026-05-18",
  "currency": "GTQ",
  "internal_notes": "",
  "notes": "",
  "terms_conditions": "",
  "subtotal": "1000.00",
  "discount_total": "0.00",
  "taxable_base": "1000.00",
  "tax_rate_snapshot": "12.00",
  "total_tax": "120.00",
  "total": "1120.00",
  "status": "draft",
  "public_token": "128-char-token",
  "items": [
    {
      "id": 1,
      "catalog_item": null,
      "position": 1,
      "description": "Servicio",
      "quantity": "1.0000",
      "unit": "unidad",
      "unit_price": "1000.0000",
      "discount_type": "none",
      "discount_value": "0.0000",
      "discount_amount": "0.00",
      "line_subtotal": "1000.00",
      "line_total": "1120.00",
      "taxable": true
    }
  ]
}
```

Create payload:
```json
{
  "client": 1,
  "title": "Cotizacion",
  "issue_date": "2026-05-03",
  "expiry_date": "2026-05-18",
  "currency": "GTQ",
  "notes": "",
  "terms_conditions": "",
  "items": [
    {
      "catalog_item": null,
      "description": "Servicio",
      "quantity": 1,
      "unit": "unidad",
      "unit_price": 1000,
      "discount_type": "none",
      "discount_value": 0,
      "taxable": true
    }
  ]
}
```

### GET `/quotes/:id/pdf/`
Response: PDF binary.

### POST `/quotes/:id/send-email/`
Request opcional:
```json
{ "to": "cliente@empresa.gt", "subject": "Cotizacion", "body": "Mensaje" }
```

Response: resultado de servicio de email.

### Public quote

`GET /public/quotes/:token/`

`POST /public/quotes/:token/respond/`

Request:
```json
{ "response": "accepted", "message": "" }
```

Response real:
```json
{ "status": "accepted" }
```

## Dashboard / Reports

### GET `/reports/dashboard/`

Response:
```json
{
  "total_quoted": "2500.00",
  "total_accepted": "2500.00",
  "conversion_rate": 100,
  "quotes_created": 1,
  "quotes_sent": 0,
  "quotes_accepted": 1,
  "quotes_rejected": 0,
  "avg_quote_value": "2500.00",
  "recent_quotes": [],
  "expiring_quotes": [],
  "top_items": [],
  "conversion_series": []
}
```
