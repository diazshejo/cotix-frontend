# Cotix 🚀

### Cotiza más rápido. Cierra más ventas.

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge\&logo=nextdotjs)
![Django](https://img.shields.io/badge/Backend-Django-green?style=for-the-badge\&logo=django)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge\&logo=postgresql)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-orange?style=for-the-badge)

---

## 💡 ¿Qué es Cotix?

**Cotix** es una plataforma SaaS diseñada para empresas que quieren dejar de cotizar en Excel y WhatsApp, y empezar a **vender de forma profesional, organizada y escalable**.

---

## 🎯 Problema

* Cotizaciones desordenadas
* Pérdida de clientes
* Sin seguimiento comercial
* Procesos manuales lentos

---

## 💥 Solución

Cotix centraliza todo tu proceso comercial:

* Creación de cotizaciones en segundos
* Gestión de clientes
* Control de productos y servicios
* Historial completo de ventas

---

## 🖼️ Vista previa



![Dashboard](https://via.placeholder.com/900x400?text=Cotix+Dashboard)
![Cotizaciones](https://via.placeholder.com/900x400?text=Modulo+de+Cotizaciones)
![Clientes](https://via.placeholder.com/900x400?text=Gestion+de+Clientes)

---

## 🧱 Arquitectura

```text
Frontend → Next.js
Backend  → Django + DRF
DB       → PostgreSQL
Auth     → JWT / Multi-tenant
```

---

## ⚙️ Instalación

### 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Variables de entorno

Crear archivo `.env` en ambos proyectos:

```env
# Backend
SECRET_KEY=
DEBUG=True

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Roadmap

* [ ] Multi-tenant completo
* [ ] Sistema de suscripciones
* [ ] Integración de pagos (Stripe)
* [ ] Dashboard analítico
* [ ] Generación de PDF profesional
* [ ] Integración con WhatsApp

---

## 🧠 Visión

Convertir Cotix en la herramienta #1 de cotización en Latinoamérica.

---

## 👨‍💻 Autor

**Sergio Díaz**
Desarrollador & Founder

---

## ⭐ Contribuir

Si te gusta el proyecto, dale ⭐ y síguelo de cerca.
Esto apenas comienza.
