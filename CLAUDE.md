# CLAUDE.md — Documentación Completa del Proyecto Lavadero Web

> Documentación técnica exhaustiva del sistema de gestión de turnos para lavadero de autos "Chapa Detail".
> Última actualización basada en análisis del código fuente completo.

---

## 1. DESCRIPCIÓN GENERAL

Sistema web full-stack para la gestión de un lavadero de autos ubicado en Santa Clara del Mar, Buenos Aires, Argentina. Permite a los usuarios reservar turnos en línea, y a los administradores gestionar toda la operación: servicios, vehículos, horarios laborales, feriados y el panel de control de turnos.

---

## 2. STACK TECNOLÓGICO

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js | 15.2.8 |
| Runtime | React | 19.0.0 |
| Lenguaje | TypeScript | ^5 |
| Base de datos | MariaDB / MySQL | — |
| ORM | Prisma | 7.2.0 |
| Adapter BD | @prisma/adapter-mariadb | 7.2.0 |
| Autenticación | NextAuth v5 (beta) | 5.0.0-beta.30 |
| Estilos | Tailwind CSS | 4 |
| Componentes UI | Radix UI | 1.4.3 |
| Animaciones | Framer Motion | 12.x |
| Uploads imágenes | Cloudinary | 2.10.0 |
| Correos | Nodemailer | 7.0.7 |
| Validación | Zod | 4.2.1 |
| Fechas | date-fns + date-fns-tz | 4.x + 3.x |
| Toasts (DíaLaboral) | Sonner | 2.0.7 |
| Hash contraseñas | bcryptjs | 3.0.3 |

---

## 3. VARIABLES DE ENTORNO REQUERIDAS

Definidas en `.env` (ignorado por git):

```env
# Base de datos (URL completa para Prisma)
DATABASE_URL="mysql://root@127.0.0.1:3306/db_lavadero"

# Credenciales individuales para el Adapter nativo de MariaDB
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="db_lavadero"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306

# Zona horaria (default: America/Argentina/Buenos_Aires)
TIMEZONE="America/Argentina/Buenos_Aires"

# NextAuth / Auth.js
AUTH_SECRET="clave_larga_y_segura"
AUTH_TRUST_HOST=true

# Google OAuth
AUTH_GOOGLE_ID="TU_GOOGLE_ID"
AUTH_GOOGLE_SECRET="TU_GOOGLE_SECRET"

# Cloudinary (uploads de imágenes)
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# SMTP para correos
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="correo@gmail.com"
SMTP_PASS="contraseña_de_aplicacion"
SMTP_FROM_EMAIL="Tu Lavadero <no-reply@tulavadero.com>"
```

---

## 4. BASE DE DATOS — ESQUEMA PRISMA

Archivo: `prisma/schema.prisma`
Generado en: `generated/prisma/` (ignorado por git)

### Modelos

#### `user`
Usuarios del sistema. Autenticación con credenciales o Google OAuth.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String? | Nombre del usuario |
| email | String (unique) | Email (login) |
| emailVerified | DateTime? | Verificación OAuth |
| image | String? | URL avatar (Google o Cloudinary) |
| password | String? | Hash bcrypt (null si solo OAuth) |
| role | user_role | `USER` o `ADMIN` |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Auto-actualizado |
| telefono | String? | Teléfono WhatsApp |

#### `account`
Cuentas OAuth vinculadas al usuario (manejado por PrismaAdapter de NextAuth).

#### `servicio`
Servicios ofrecidos por el lavadero (ej: Lavado completo, Encerado).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (UUID manual) |
| nombre | String? | Nombre del servicio |
| srcImage | String? | URL pública Cloudinary |
| cloudinaryPublicId | String? | ID en Cloudinary para borrado |
| estado | Boolean | `true` = activo |

#### `vehiculo`
Tipos de vehículos (ej: Auto, Camioneta, Moto).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (UUID manual) |
| nombre | String? | Nombre del vehículo |
| srcImage | String? | URL pública Cloudinary |
| cloudinaryPublicId | String? | ID en Cloudinary para borrado |
| estado | Boolean | `true` = activo |

#### `vehiculo_servicio`
Relación N:N entre vehículo y servicio. Define precio, duración y seña para cada combinación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (UUID manual) |
| vehiculoId | String | FK → vehiculo |
| servicioId | String | FK → servicio |
| duracion | Int | Duración en minutos |
| precio | Decimal | Precio del servicio |
| descuento | Decimal | Descuento aplicado |
| senia | Decimal | Monto de seña |
| estado | Boolean | `true` = activo |

#### `turno`
Reserva de turno de un usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (UUID manual) |
| vehiculoServicioId | String | FK → vehiculo_servicio |
| userId | String | FK → user |
| horarioReservado | DateTime | Fecha y hora UTC en BD |
| precioCongelado | Decimal | Precio al momento de la reserva |
| seniaCongelada | Decimal | Seña al momento de la reserva |
| patente | String | Patente del vehículo |
| estado | Int | `0`=cancelado, `1`=pendiente, `2`=completado |

#### `expeciones_laborales`
⚠️ **TYPO EN NOMBRE**: Debería ser `excepciones_laborales`. Días/rangos en los que el negocio no trabaja (feriados, vacaciones).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (UUID manual) |
| motivo | String | Descripción del motivo |
| desde | DateTime | Inicio de la excepción |
| hasta | DateTime | Fin de la excepción |
| estado | Boolean | `true` = activa |

#### `dia_laboral`
Configuración de qué días de la semana se trabaja.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (cuid) |
| estado | Boolean | `true` = habilitado |
| dia | Int | `0`=Dom, `1`=Lun, ..., `6`=Sáb |

#### `margenes_laborales`
Horarios de trabajo dentro de un `dia_laboral` (ej: 08:00–13:00, 15:00–18:00).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK (cuid) |
| diaId | String | FK → dia_laboral |
| estado | Boolean | `true` = activo |
| desde | String | Hora inicio `"HH:mm"` |
| hasta | String | Hora fin `"HH:mm"` |

#### Enum `user_role`
```
USER  → Usuario normal (puede reservar turnos propios)
ADMIN → Administrador (acceso completo al sistema)
```

---

## 5. AUTENTICACIÓN

### Archivos clave
- `src/auth.ts` — Configuración principal de NextAuth
- `src/auth.config.ts` — Configuración base compartida con middleware
- `src/app/api/auth/[...nextauth]/route.ts` — Route handler de NextAuth
- `src/types/next-auth.d.ts` — Tipos extendidos de sesión

### Providers configurados
1. **Google OAuth** (`allowDangerousEmailAccountLinking: true`)
   - Permite vincular cuentas existentes al hacer login con Google
2. **Credentials** (email + contraseña)
   - Validación con Zod → búsqueda en BD → comparación bcrypt

### Estrategia de sesión
- **JWT** (no database sessions)
- `maxAge: 86400` (1 día)
- `updateAge: 3600` (refresh cada 1 hora)
- El JWT incluye: `id`, `role`, `telefono`, `image`, `name`

### Callbacks JWT
En cada petición, si el token tiene `id`, se consulta la BD para actualizar nombre, rol, teléfono e imagen. Esto garantiza que los datos estén siempre actualizados.

### Datos extendidos en sesión
```typescript
session.user.id       // String
session.user.role     // "USER" | "ADMIN"
session.user.telefono // String | null
session.user.image    // String | null
```

---

## 6. MIDDLEWARE Y SEGURIDAD

Archivo: `src/middleware.ts`

### Reglas de acceso

| Ruta | Autenticado | Rol |
|------|-------------|-----|
| `/login`, `/register` | No → acceder; Sí → redirige a `/dashboard` | — |
| `/dashboard` | Requerido | USER o ADMIN |
| `/turno` | Requerido | USER o ADMIN |
| `/admin/*` | Requerido | Solo ADMIN |
| `/diaLaboral` | Requerido | Solo ADMIN |
| `/excepcionesLaborales` | Requerido | Solo ADMIN |
| `/api/auth/*` | Siempre accesible | — |

---

## 7. ESTRUCTURA DE DIRECTORIOS

```
lavadero-web/
├── src/
│   ├── actions/                    # Server Actions (lógica backend)
│   │   ├── admin.actions.ts        # Gestión de turnos (admin)
│   │   ├── admin-dashboard.ts      # Gestión de usuarios (admin)
│   │   ├── auth-actions.ts         # Login, register, logout
│   │   ├── bicicleta.actions.ts    # ⚠️ DEMO/LEGACY - no integrado
│   │   ├── calendario.actions.ts   # Disponibilidad horaria
│   │   ├── diaLaboral.actions.ts   # CRUD días laborales
│   │   ├── excepcionesLaborales.actions.ts # CRUD feriados
│   │   ├── margenesHorario.actions.ts      # CRUD horarios
│   │   ├── servicio-actions.ts     # CRUD servicios
│   │   ├── turno.actions.ts        # CRUD turnos + emails
│   │   ├── user-dashboard.ts       # Perfil usuario + sus turnos
│   │   └── vehiculo-actions.ts     # CRUD vehículos
│   │   └── vehiculoXServicio-actions.ts    # CRUD relaciones V-S
│   ├── app/
│   │   ├── api/auth/[...nextauth]/ # Handler NextAuth
│   │   ├── context/
│   │   │   └── Booking.tsx         # Context del modal de reserva (legacy)
│   │   ├── admin/page.tsx          # Panel admin turnos
│   │   ├── dashboard/page.tsx      # Dashboard usuario
│   │   ├── diaLaboral/page.tsx     # Config días laborales
│   │   ├── excepcionesLaborales/page.tsx   # Config feriados
│   │   ├── login/page.tsx          # Login
│   │   ├── register/page.tsx       # Registro
│   │   ├── servicio/page.tsx       # Gestión servicios
│   │   ├── turno/page.tsx          # Gestión turnos
│   │   ├── vehiculo/page.tsx       # Gestión vehículos
│   │   ├── vehiculoXServicio/page.tsx      # Asignación V-S
│   │   ├── globals.css             # Estilos globales + CSS vars
│   │   ├── layout.tsx              # Layout raíz
│   │   ├── loading.tsx             # Loading global
│   │   └── page.tsx                # Home pública
│   ├── assets/
│   │   └── hero-carwash.jpg        # Imagen hero
│   ├── components/
│   │   ├── admin/ui/
│   │   │   ├── BotonesLimpieza.tsx
│   │   │   └── ListaTurnos.tsx
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx
│   │   │   └── google-button.tsx
│   │   ├── confirm/
│   │   │   ├── ConfirmContext.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPanel.tsx
│   │   ├── diaLaboral/
│   │   │   ├── diaLaboralClient.tsx
│   │   │   ├── diaLaboralForm.tsx
│   │   │   └── diaLaboralList.tsx
│   │   ├── excepcionesLaborales/
│   │   │   ├── ExcepcionesClient.tsx
│   │   │   ├── ExcepcionesForm.tsx
│   │   │   └── ExcepcionesList.tsx
│   │   ├── horarios/
│   │   │   ├── horariosForm.tsx
│   │   │   └── horariosList.tsx
│   │   ├── providers/
│   │   │   └── SessionWrapper.tsx
│   │   ├── servicio/
│   │   │   ├── CreateServicioForm.tsx
│   │   │   ├── EditServicioModal.tsx
│   │   │   └── ServicioList.tsx
│   │   ├── toast/
│   │   │   └── ToastProvider.tsx
│   │   ├── turno/
│   │   │   ├── CreateTurnoForm.tsx
│   │   │   ├── EditarTurnoModal.tsx
│   │   │   ├── SeleccionadorHorario.tsx
│   │   │   └── TurnoList.tsx
│   │   ├── ui/                     # Componentes UI base (Radix + Shadcn)
│   │   │   ├── bicicleta/          # ⚠️ DEMO/LEGACY
│   │   │   └── [muchos componentes shadcn...]
│   │   ├── vehiculo/
│   │   │   ├── CreateVehiculoForm.tsx
│   │   │   ├── EditVehiculoModal.tsx
│   │   │   └── VehiculoList.tsx
│   │   ├── vehiculoXServicio/
│   │   │   ├── CreateVehiculoXServicioForm.tsx
│   │   │   ├── EditVehiculoXServicioModal.tsx
│   │   │   └── VehiculoXServicioList.tsx
│   │   ├── AboutSection.tsx
│   │   ├── AppGate.tsx
│   │   ├── BookingModal.tsx        # ⚠️ LEGACY - no integrado al sistema real
│   │   ├── CookieModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── HomeClient.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── LayoutComponent.tsx
│   │   ├── LocationSection.tsx
│   │   ├── LoginModal.tsx          # Modal login alternativo (no usado en main flow)
│   │   ├── PrivacyModal.tsx
│   │   └── TermsModal.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx          # Hook detección móvil (para Sidebar)
│   │   ├── use-toast.ts            # Re-export del hook toast shadcn
│   │   ├── useConfirm.ts           # Re-export del ConfirmContext
│   │   └── useToast.ts             # Re-export del ToastProvider propio
│   ├── lib/
│   │   ├── cloudinary.ts           # Upload/delete imágenes Cloudinary
│   │   ├── mail.ts                 # Templates y envío de correos
│   │   ├── prisma.ts               # Singleton PrismaClient con adapter MariaDB
│   │   ├── utils.ts                # cn() + serializeData()
│   │   └── zod.ts                  # Schemas de validación
│   ├── middleware.ts
│   └── types/
│       └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── generated/                      # ⚠️ Ignorado por git - generado por Prisma
├── public/
│   └── images/
│       ├── avatar-default.svg
│       ├── bglogin.png
│       └── logopng.png
├── prisma.config.ts
├── next.config.ts
├── tailwind.config.ts (implícito en @tailwindcss/postcss)
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 8. PÁGINAS Y RUTAS

### `src/app/page.tsx` — Home pública
- Renderiza `HomeClient` (client component)
- Muestra: Hero, carrusel de servicios, sección "Nosotros", mapa de ubicación
- **Acceso**: Público

### `src/app/login/page.tsx` — Login
- Formulario con email + contraseña usando `useActionState` + `loginAction`
- Botón de login con Google
- Redirige a `/dashboard` si ya está autenticado (middleware)
- **Acceso**: Público (solo no autenticados)

### `src/app/register/page.tsx` — Registro
- Formulario de registro con nombre, email, contraseña
- Usa `registerAction` y redirige a `/login?registered=true` al éxito
- **Acceso**: Público (solo no autenticados)

### `src/app/dashboard/page.tsx` — Dashboard de usuario
- Renderiza `DashboardPanel` con los datos de la sesión
- Tabs: Mi Perfil | Mis Turnos | (Admin) Administrar Usuarios
- **Acceso**: Autenticado (USER o ADMIN)

### `src/app/admin/page.tsx` — Panel Administrador de Turnos
- Servidor: recibe `searchParams` para filtro, búsqueda y ordenamiento
- Muestra `Buscador`, link a días laborales, botones de limpieza, `ListaTurnos`
- Usa Suspense con `LoadingOverlay` mientras carga
- **Acceso**: Solo ADMIN

### `src/app/turno/page.tsx` — Gestión de Turnos
- ADMIN: ve todos los turnos
- USER: ve solo sus propios turnos
- Renderiza `CreateTurnoForm` + `TurnoList`
- **Acceso**: Autenticado (USER o ADMIN)

### `src/app/servicio/page.tsx` — Gestión de Servicios
- Renderiza `CreateServicioForm` + `ServicioList`
- **Acceso**: Solo ADMIN

### `src/app/vehiculo/page.tsx` — Gestión de Vehículos
- Renderiza `CreateVehiculoForm` + `VehiculoList`
- **Acceso**: Solo ADMIN

### `src/app/vehiculoXServicio/page.tsx` — Asignación Servicio a Vehículo
- Renderiza `CreateVehiculoXServicioForm` + `VehiculoXServicioList`
- Permite definir precio, duración y seña para cada combinación vehículo-servicio
- **Acceso**: Solo ADMIN

### `src/app/diaLaboral/page.tsx` — Configuración Días Laborales
- Renderiza `DiaLaboralClient` con los días configurados
- Permite crear/editar/eliminar días laborales y sus márgenes horarios
- **Acceso**: Solo ADMIN

### `src/app/excepcionesLaborales/page.tsx` — Feriados y Excepciones
- Renderiza `ExcepcionesClient` con formulario + lista
- Permite definir rangos de fechas en los que el negocio está cerrado
- **Acceso**: Solo ADMIN

---

## 9. SERVER ACTIONS

### `src/actions/auth-actions.ts`

| Función | Descripción |
|---------|-------------|
| `handleSignOut()` | Cierra sesión y redirige a `/` |
| `loginAction(prevState, formData)` | Valida con Zod y llama a `signIn("credentials")` |
| `registerAction(prevState, formData)` | Verifica usuario existente, hashea contraseña y crea usuario |
| `googleLoginAction()` | Inicia flujo OAuth Google con redirect a `/dashboard` |

### `src/actions/admin.actions.ts`

| Función | Descripción |
|---------|-------------|
| `obtenerTurnos(params)` | Lista todos los turnos con filtros de búsqueda y ordenamiento. Serializa Decimales |
| `limpiarTurnosAntiguos()` | Elimina turnos con más de 2 meses de antigüedad |
| `limpiarTurnosCancelados()` | Elimina todos los turnos con `estado: 0` |

### `src/actions/admin-dashboard.ts`

| Función | Descripción |
|---------|-------------|
| `getAllUsers()` | Lista todos los usuarios ordenados por rol y fecha |
| `toggleUserRole(userId, currentRole)` | Alterna entre USER y ADMIN |
| `deleteUserAccount(userId)` | Elimina permanentemente una cuenta |

### `src/actions/turno.actions.ts`

| Función | Descripción |
|---------|-------------|
| `createTurno(prevState, formData)` | Crea turno con validación completa: horario laboral, excepciones, solapamientos. Envía email |
| `getTurnos(params)` | Lista turnos activos. Opcionalmente filtra por `userId` o `fecha`. Convierte a hora Argentina |
| `actualizarTurno(prevState, formData)` | Actualiza horario/patente con re-validación. Envía email |
| `obtenerDatosParaTurno()` | Obtiene configuraciones V-S y usuarios para el formulario de creación |
| `deleteTurno(prevState, formData)` | Borrado lógico (`estado: 0`). Envía email de cancelación |
| `completedTurno(prevState, formData)` | Marca turno como completado (`estado: 2`) |

### `src/actions/calendario.actions.ts`

| Función | Descripción |
|---------|-------------|
| `obtenerHorariosDisponibles(fechaString, vehiculoServicioId, turnoIdAExcluir?)` | Genera slots de 30 min dentro de los márgenes laborales. Marca como no disponible: slots pasados (< 15 min), turnos existentes que se solapan, y excepciones laborales |

**Lógica de zona horaria**: Todo se trabaja en UTC absoluto para comparaciones, pero la hora mostrada al usuario se convierte a `America/Argentina/Buenos_Aires` solo en el momento de formatear el texto final.

### `src/actions/vehiculo-actions.ts`

| Función | Descripción |
|---------|-------------|
| `getVehiculos()` | Lista vehículos activos con sus servicios |
| `createVehiculo(prevState, formData)` | Crea vehículo, opcionalmente sube imagen a Cloudinary |
| `actualizarVehiculo(prevState, formData)` | Actualiza vehículo, reemplaza imagen en Cloudinary si se proporciona |
| `deleteVehiculo(prevState, formData)` | Baja lógica (`estado: false`). Falla si tiene turnos asociados |

### `src/actions/servicio-actions.ts`
Idéntico en estructura a `vehiculo-actions.ts`. Incluye además:
- `getVehiculosConServicios()` — Para el carrusel de la home pública

### `src/actions/vehiculoXServicio-actions.ts`

| Función | Descripción |
|---------|-------------|
| `createVehiculoXServicio(prevState, formData)` | Crea relación V-S con precio, duración, seña y descuento |
| `actualizarVehiculoXServicio(prevState, formData)` | Actualiza. Valida que no exista duplicado activo (excluye el propio) |
| `deleteVehiculoXServicio(prevState, formData)` | Baja lógica. Falla si tiene turnos |
| `obtenerVehiculosXServicios(params?)` | Lista todas las configuraciones activas con datos de vehículo y servicio |
| `obtenerVehiculosYServicios()` | Lista separada de vehículos y servicios para dropdowns |
| `obtenerCatalogosParaModalVXS()` | Igual que el anterior pero para modales de edición |

### `src/actions/diaLaboral.actions.ts`

| Función | Descripción |
|---------|-------------|
| `create(prevState, formData)` | Crea día laboral. Verifica que no exista ya ese día de semana |
| `update(prevState, formData)` | Actualiza. Verifica conflictos con otros días |
| `deleteDiaLaboral(id)` | Elimina. Falla si tiene márgenes horarios asociados |
| `getDiasLaborales()` | Lista todos ordenados por día de semana |
| `getDiaLaboralById(id)` | Obtiene uno con sus márgenes |

### `src/actions/margenesHorario.actions.ts`

| Función | Descripción |
|---------|-------------|
| `createMargenLaboral(prevState, formData)` | Crea horario. Valida que `hasta > desde` y que no se solape con otros |
| `updateMargenLaboral(prevState, formData)` | Actualiza con mismas validaciones |
| `deleteMargenLaboral(id)` | Elimina directamente |
| `getMargenesLaborales(diaId)` | Lista horarios de un día |
| `getHorariosCompactos()` | Genera strings legibles para la sección pública (ej: "Lunes a Viernes 08:00 a 17:00") |

### `src/actions/user-dashboard.ts`

| Función | Descripción |
|---------|-------------|
| `updateProfile(userId, formData)` | Actualiza nombre y teléfono. Llama a `session.update()` |
| `getUserTurnos(userId)` | Lista todos los turnos del usuario, más recientes primero |
| `cancelTurno(turnoId)` | Cancela turno (`estado: 0`) y envía email |
| `updatePassword(userId, formData)` | Actualiza contraseña. Valida contraseña anterior si existe |

### `src/actions/excepcionesLaborales.actions.ts`

| Función | Descripción |
|---------|-------------|
| `create(prevState, formData)` | Crea excepción laboral |
| `update(prevState, formData)` | Actualiza motivo y fechas |
| `getExcepciones()` | Lista todas ordenadas por fecha de creación descendente |
| `softDeleteExcepcion(id)` | Desactiva (`estado: false`) sin eliminar |
| `deleteExcepcion(id)` | Elimina permanentemente |

---

## 10. COMPONENTES PRINCIPALES

### Infraestructura / Layout

#### `src/app/layout.tsx`
Layout raíz. Obtiene sesión del servidor y la pasa a `LayoutComponent`. Aplica fuentes Geist, `NextTopLoader` y proveedores.

#### `src/components/LayoutComponent.tsx`
Client component que envuelve `SessionWrapper` + `BookingProvider` + `Header`.

#### `src/components/AppGate.tsx`
Controla el flujo de aceptación legal:
1. `CookieModal` → debe aceptarse primero
2. `PrivacyModal` → se muestra automáticamente después de cookies
3. `TermsModal` → se muestra después de privacidad, requiere checkbox
4. Solo renderiza `children` + `Footer` cuando todo está aceptado
Usa `localStorage` para persistir el estado entre sesiones.

#### `src/components/Header.tsx`
Header fijo con navegación responsive. Muestra opciones diferentes según rol:
- **ADMIN**: Servicios, Vehículos, Asignar Servicios, Crear turnos, Panel admin
- **USER**: Servicios, Nosotros, Ubicación, Turnos
- Menú hamburguesa con sidebar animado para móvil (Framer Motion)

#### `src/components/providers/SessionWrapper.tsx`
Envuelve la app con `SessionProvider` de NextAuth para acceso al contexto de sesión en client components.

### Páginas Públicas (Home)

#### `src/components/Hero.tsx`
Sección hero de la página principal. Imagen de fondo, texto y botón "Reservar Turno Ahora" que enlaza directamente a `/turno`.
⚠️ Recibe `onBookingClick` como prop pero **no lo usa** en ningún botón visible.

#### `src/components/ImageCarousel.tsx`
Carrusel de servicios agrupados por tipo de vehículo. Carga datos desde `getVehiculosConServicios()`. Selector de vehículo con animación de layout (Framer Motion). Usa `embla-carousel-react`.

#### `src/components/AboutSection.tsx`
Sección "Sobre Nosotros" con características del negocio.

#### `src/components/LocationSection.tsx`
Sección de ubicación con datos de contacto, horarios (cargados desde BD via `getHorariosCompactos()`) y mapa de Google Maps embebido.

### Modales de Consentimiento Legal

#### `src/components/CookieModal.tsx`
Modal de cookies. Se muestra si `localStorage.cookiesAcknowledged` no existe. Al aceptar, llama a `onAccept` para continuar el flujo en `AppGate`.

#### `src/components/PrivacyModal.tsx`
Política de privacidad. Se puede abrir automáticamente (después de cookies) o manualmente desde el Footer. Se abre si `cookiesAcknowledged` existe pero `privacySeen` no.

#### `src/components/TermsModal.tsx`
Términos y condiciones. Requiere marcar checkbox antes de habilitar el botón "Aceptar". Se abre automáticamente si no hay `termsAccepted` en localStorage.

### Sistema de Confirmación

#### `src/components/confirm/ConfirmContext.tsx`
Proveedor de confirmaciones personalizadas (reemplaza `window.confirm`). Expone `confirm({ title, message })` que retorna `Promise<boolean>`.

#### `src/components/confirm/ConfirmDialog.tsx`
Dialog animado (Framer Motion) con botones "Cancelar" / "Aceptar".

#### `src/hooks/useConfirm.ts`
Re-exporta `useConfirm` desde `ConfirmContext`.

### Sistema de Toasts

#### `src/components/toast/ToastProvider.tsx`
Sistema de notificaciones propio con animaciones (Framer Motion). Soporte para tipos: `success`, `error`, `info`. Auto-descarte en 5 segundos. Admite drag para descartar. Posición: bottom-right.

#### `src/hooks/useToast.ts`
Re-exporta `useToast` desde `ToastProvider`.

### Módulo de Turnos

#### `src/components/turno/CreateTurnoForm.tsx`
Formulario completo para crear turnos:
- **ADMIN**: buscador de clientes con dropdown autocomplete
- **USER**: muestra su propia cuenta sin edición
- Selector de servicio (dropdown)
- Campo de patente
- `SeleccionadorHorario` para elegir fecha y hora

#### `src/components/turno/SeleccionadorHorario.tsx`
Componente de selección de horario disponible:
- Selector de fecha (mínimo: hoy)
- Grid de slots horarios de 30 minutos generados por `obtenerHorariosDisponibles`
- Slots marcados en verde (disponible) o rojo (ocupado/pasado)
- Escribe el valor seleccionado en un `<input type="hidden">` para el formulario padre

#### `src/components/turno/TurnoList.tsx`
Lista de turnos dividida en dos secciones: "Turnos de Hoy" (con indicador live) y "Otros Turnos". Cards con acciones de edición/cancelación según rol y estado del turno.

#### `src/components/turno/EditarTurnoModal.tsx`
Modal para editar un turno existente. Reutiliza `SeleccionadorHorario` con el turno a excluir de los solapamientos.

### Módulo Admin de Turnos

#### `src/components/admin/ui/ListaTurnos.tsx`
Tabla de gestión de turnos para el panel admin:
- Dos tablas: "Turnos de Hoy" y "Todos los Turnos"
- Columnas: Fecha, Cliente (con link WhatsApp), Servicio, Estado
- Modal de dos pasos para cambiar estado (Completar / Cancelar)
- Ordenamiento clickeable por fecha

#### `src/components/admin/ui/BotonesLimpieza.tsx`
Botones "Limpiar antiguos" y "Limpiar cancelados" con confirmación antes de ejecutar.
⚠️ **BUG**: Ver sección de errores.

### Dashboard de Usuario

#### `src/components/dashboard/DashboardPanel.tsx`
Panel principal del usuario autenticado con tres tabs:

**Mi Perfil** (`ProfileForm`):
- Editar nombre (solo letras con regex) y teléfono (con selector de código de país)
- Actualiza la sesión JWT sin necesidad de re-login

**Mis Turnos** (`TurnosList`):
- Agrupa turnos en: Hoy (con indicador pulsante), Próximos, Completados, Cancelados
- Permite cancelar turnos con modal de confirmación propio

**Administrar Usuarios** (solo ADMIN, `AdminUsersPanel`):
- Buscador de usuarios en tiempo real
- Cambio de rol USER ↔ ADMIN
- Eliminación de cuentas con confirmación

**Seguridad** (`PasswordForm`):
- Cambio de contraseña con campo de contraseña actual
- Toggle de visibilidad para cada campo

### Módulo de Días Laborales

#### `src/components/diaLaboral/diaLaboralClient.tsx`
Componente principal de gestión de días laborales. Integra lista, formulario y horarios en diálogos anidados. Usa navegación con `useRouter().refresh()` para actualizar datos.
⚠️ Usa `confirm()` nativo del browser para eliminación en lugar del sistema personalizado.

#### `src/components/diaLaboral/diaLaboralList.tsx`
Grid de cards, una por día laboral configurado. Muestra nombre del día, estado, cantidad de horarios y los horarios activos. Acciones: Asignar Horarios, Editar, Eliminar.

#### `src/components/diaLaboral/diaLaboralForm.tsx`
Formulario de creación/edición de día laboral (día de la semana + estado activo/inactivo). Usa `useFormState` (deprecated en React 19).

### Módulo de Horarios

#### `src/components/horarios/horariosList.tsx`
Lista de márgenes horarios para un día laboral específico. Permite agregar, editar y eliminar horarios. Muestra formato `HH:mm → HH:mm`.

#### `src/components/horarios/horariosForm.tsx`
Formulario de creación/edición de margen horario. Valida que no se solapen y que `hasta > desde`.

### Módulo de Servicios / Vehículos / V×S

Todos siguen el mismo patrón:
- **CreateForm**: Formulario con `useActionState` y preview de imagen
- **EditModal**: Modal con formulario pre-llenado
- **List**: Grid de cards con acciones

Los servicios y vehículos tienen upload de imagen a Cloudinary integrado.

### Módulo de Excepciones Laborales

#### `src/components/excepcionesLaborales/ExcepcionesClient.tsx`
Layout de dos columnas: formulario a la izquierda, lista a la derecha.

#### `src/components/excepcionesLaborales/ExcepcionesList.tsx`
Lista de excepciones con edición inline y acciones de desactivar/eliminar.

---

## 11. LIBRERÍAS Y UTILIDADES

### `src/lib/prisma.ts`
Singleton de PrismaClient con el adapter nativo de MariaDB. Detecta si está en localhost para desactivar SSL. Límite de 5 conexiones simultáneas.

### `src/lib/cloudinary.ts`
Wrapper sobre el SDK de Cloudinary:
- `uploadImage(buffer, options)` — Sube imagen con transformaciones automáticas (max 1200px, calidad auto, formato auto)
- `deleteImage(publicId)` — Elimina imagen por ID

### `src/lib/mail.ts`
Templates HTML de correo y funciones de envío:
- `enviarCorreoCreacionTurno()` — Email verde de confirmación
- `enviarCorreoModificacionTurno()` — Email azul de modificación
- `enviarCorreoCancelacionTurno()` — Email rojo de cancelación

Todos usan el mismo template base con el logo "TU LAVADERO" sobre fondo oscuro.

### `src/lib/utils.ts`

| Función | Descripción |
|---------|-------------|
| `cn(...inputs)` | Combina clases Tailwind con `clsx` + `tailwind-merge` |
| `serializeData<T>(data)` | Convierte tipos `Decimal` de Prisma a `number` via `JSON.parse/stringify` para evitar errores de serialización en Next.js |

### `src/lib/zod.ts`

| Schema | Uso |
|--------|-----|
| `loginSchema` | Email válido + mínimo 6 chars |
| `registerSchema` | Extiende login + nombre (solo letras/espacios) + teléfono opcional |
| `changePasswordSchema` | oldPassword + newPassword + confirmPassword con refine |
| `updateProfileSchema` | nombre + teléfono opcional |

---

## 12. ESTILOS Y DISEÑO

### Sistema de colores (`src/app/globals.css`)
CSS custom properties en `:root`. Paleta principal en tonos "celeste" (hsl 195) y "beige" (hsl 43).

### Fuentes
- **Outfit** (sans-serif) — Body
- **Playfair Display** (serif) — Headings (h1, h2, h3)
- Cargadas desde Google Fonts

### Variantes de `Button` (`src/components/ui/button.tsx`)
| Variante | Descripción |
|----------|-------------|
| `default` | Primario con sombra celeste |
| `celeste` | Gradiente celeste (color principal de la marca) |
| `rojo` | Gradiente rojo (acciones destructivas) |
| `verde` | Gradiente verde (acciones positivas) |
| `amarillo` | Gradiente amarillo (alertas/login) |
| `blanco` | Gradiente blanco (acciones secundarias) |
| `hero` | Celeste grande para hero |
| `outline-celeste` | Borde celeste |
| `destructive`, `outline`, `secondary`, `ghost`, `link` | Estándar Shadcn |

---

## 13. FLUJO DE LÓGICA DE NEGOCIOS — CREACIÓN DE TURNO

```
Usuario selecciona servicio
        ↓
Selecciona fecha
        ↓
obtenerHorariosDisponibles() en servidor:
  1. Verifica que el día de la semana tenga dia_laboral activo
  2. Verifica que no haya excepcion_laboral activa en ese período
  3. Para cada margen del día, genera slots de 30min
  4. Marca como no disponible: pasados, con turnos solapados, en excepciones
        ↓
Usuario selecciona slot horario
        ↓
createTurno() en servidor:
  1. Valida mínimo 10 minutos de anticipación
  2. Verifica nuevamente dia_laboral, excepciones, y solapamientos
  3. Valida que el slot entre dentro de algún margen laboral
  4. Crea el turno con precio/seña congelados del vehiculo_servicio
  5. Envía email de confirmación via Nodemailer
        ↓
Revalida caché de /turno
```

---

## 14. ERRORES Y PROBLEMAS ENCONTRADOS

### 🔴 ERRORES CRÍTICOS (pueden causar crash o comportamiento inesperado)

---

#### Error 1: `BotonesLimpieza.tsx` — Incompatibilidad en la firma de `useConfirm`

**Archivo**: `src/components/admin/ui/BotonesLimpieza.tsx`

**Problema**: El hook `useConfirm` espera un objeto `{ title: string, message: string }`, pero en `BotonesLimpieza` se llama con un `string` directamente.

```typescript
// ❌ Incorrecto — uso actual
const isConfirmed = await confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR...");

// ✅ Correcto — firma esperada por ConfirmContext
const isConfirmed = await confirm({
  title: "Confirmar eliminación",
  message: "⚠️ ¿Estás seguro de que deseas ELIMINAR...?"
});
```

**Impacto**: TypeScript debería detectar esto en compilación, pero como `ignoreBuildErrors: true` está en `next.config.ts`, el código se ejecuta y puede fallar en runtime.

---

#### Error 2: `DashboardPanel.tsx` — Uso incorrecto de `useState` como efecto de inicialización

**Archivo**: `src/components/dashboard/DashboardPanel.tsx` — `ProfileForm`

**Problema**: Se usa `useState` como si fuera `useEffect` para inicializar el estado del teléfono:

```typescript
// ❌ Incorrecto — useState no es una función de efecto
useState(() => {
  if (user.telefono) {
    const strippedPhone = user.telefono.replace(/\s+/g, '');
    if (strippedPhone.startsWith("+549")) {
      setCountryCode("+54 9 ");
      setPhoneNumber(strippedPhone.slice(4));
    } else {
      setCountryCode("");
      setPhoneNumber(strippedPhone);
    }
  } else {
    setCountryCode("+54 9 ");
  }
});

// ✅ Correcto — usar initializer en useState o useEffect
useEffect(() => {
  if (user.telefono) {
    // misma lógica...
  }
}, []);
```

**Impacto**: `useState` acepta una función solo como inicializador del valor (no para ejecutar lógica de efectos). Esto puede causar llamadas inesperadas a setters durante el render, violando las reglas de React.

---

#### Error 3: `diaLaboral.actions.ts` — `update()` no maneja el caso de registro no encontrado

**Archivo**: `src/actions/diaLaboral.actions.ts`

**Problema**: En la función `update`, se busca el registro pero no se valida si fue encontrado antes de continuar:

```typescript
// Verificar si existe
const existing = await prisma.dia_laboral.findUnique({
  where: { id },
});
// ❌ Falta: if (!existing) return { success: false, error: "No encontrado" };

// Verificar conflictos con otros días
const conflict = await prisma.dia_laboral.findFirst({...});
```

**Impacto**: Si el ID no existe, Prisma lanzará un error en el `update()` final en lugar de retornar un mensaje de error limpio. El error no controlado puede exponer detalles internos.

---

### 🟡 ADVERTENCIAS (no críticos pero deberían corregirse)

---

#### Advertencia 1: Uso de `useFormState` (deprecated en React 19)

**Archivos afectados**:
- `src/components/diaLaboral/diaLaboralForm.tsx`
- `src/components/horarios/horariosForm.tsx`
- `src/components/excepcionesLaborales/ExcepcionesForm.tsx`

**Problema**: Se importa `useFormState` de `react-dom` que fue deprecado en React 19 en favor de `useActionState` de `react`.

```typescript
// ❌ Deprecado
import { useFormState, useFormStatus } from "react-dom";
const [state, formAction] = useFormState(action, initialState);

// ✅ Actualizado
import { useActionState } from "react";
const [state, formAction] = useActionState(action, initialState);
```

---

#### Advertencia 2: Typo en nombre del modelo de base de datos

**Archivo**: `prisma/schema.prisma`

**Problema**: El modelo se llama `expeciones_laborales` (falta una 'c'), debería ser `excepciones_laborales`. Este typo se propaga por toda la codebase.

**Impacto**: Inconsistencia de nomenclatura. Requiere migración de BD para corregir.

---

#### Advertencia 3: `BookingModal.tsx` desconectado del sistema real

**Archivo**: `src/components/BookingModal.tsx` y `src/app/context/Booking.tsx`

**Problema**: El `BookingModal` muestra un proceso de reserva de 3 pasos con tipos de vehículo y horarios **hardcodeados** que no se conectan con la base de datos real. El `BookingProvider` proporciona `onOpen` que abre este modal, pero en la práctica el botón principal del `Hero` usa `Link href="/turno"` directamente.

**Impacto**: Código muerto que puede confundir. El modal aparece si algún componente llama a `onOpen` del contexto, pero el flujo real de reservas va a `/turno`.

---

#### Advertencia 4: Código muerto en `src/app/page.tsx`

**Archivo**: `src/app/page.tsx`

**Problema**: Hay una expresión `void` con una función nombrada que no hace nada:

```typescript
// ❌ Línea muerta sin propósito
void function onclick() { console.log("Booking clicked"); }
```

---

#### Advertencia 5: `Hero.tsx` recibe prop `onBookingClick` que nunca usa

**Archivo**: `src/components/Hero.tsx`

**Problema**: La prop `onBookingClick` se declara en la interfaz y se recibe como parámetro, pero ningún elemento del componente la llama. El botón CTA usa un `<Link>` directo.

---

#### Advertencia 6: Typo en clase CSS en `HomeClient.tsx`

**Archivo**: `src/components/HomeClient.tsx`

**Problema**: Las clases `min-h-screen` y `justify-center` están pegadas sin espacio:

```typescript
// ❌ Incorrecto
className="min-h-screenjustify-center items-center mx-auto..."

// ✅ Correcto
className="min-h-screen justify-center items-center mx-auto..."
```

**Impacto**: Ninguna de las dos clases se aplica correctamente.

---

#### Advertencia 7: Archivos `bicicleta/` son código demo no integrado

**Archivos**:
- `src/components/ui/bicicleta/Buscador.tsx`
- `src/components/ui/bicicleta/FormBicicleta.tsx`
- `src/components/ui/bicicleta/FormEditarBicicleta.tsx`
- `src/components/ui/bicicleta/ListaBicicletas.tsx`
- `src/actions/bicicleta.actions.ts` (no provisto pero referenciado)

**Problema**: Son archivos de prueba/ejemplo del tutorial inicial de Next.js + Prisma. No corresponden al dominio del negocio (lavadero). El `Buscador` de bicicletas incluso se usa en la página `/admin` pero solo como componente de búsqueda genérico.

---

#### Advertencia 8: Inconsistencia en uso del sistema de confirmación

**Archivos afectados**: `src/components/diaLaboral/diaLaboralClient.tsx`

**Problema**: La mayoría de la app usa el `ConfirmProvider` personalizado, pero este componente usa `window.confirm()`:

```typescript
// ❌ Inconsistente con el resto de la app
if (!confirm("¿Estás seguro de eliminar este día laboral?")) return;
```

---

#### Advertencia 9: Componente interno definido dentro de otro componente

**Archivo**: `src/components/admin/ui/ListaTurnos.tsx`

**Problema**: `TablaRender` se define como función dentro de `ListaTurnos`. Esto causa que React recree el componente en cada render del padre, lo que puede causar pérdida de estado interno y re-mounts innecesarios.

```typescript
// ❌ Componente definido dentro de otro
export default function ListaTurnos(...) {
  const TablaRender = ({ data, titulo }) => (...) // ← se recrea en cada render
}

// ✅ Definirlo fuera del componente padre
function TablaRender({ data, titulo }) {...}
export default function ListaTurnos(...) {...}
```

---

#### Advertencia 10: `next.config.ts` ignora errores de TypeScript y ESLint en build

**Archivo**: `next.config.ts`

```typescript
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true },
```

Esto enmascara errores reales (como el Error 1 de `BotonesLimpieza`). Para producción se recomienda activar estas validaciones.

---

#### Advertencia 11: Zona horaria del cliente puede diferir del servidor

**Archivos afectados**: `DashboardPanel.tsx`, `TurnoList.tsx`

En varios client components se usa `new Date().toDateString()` o `fecha.toLocaleDateString('es-AR', ...)` sin especificar timezone. Si el usuario accede desde fuera de Argentina, las fechas se mostrarán en su zona horaria local en lugar de la hora argentina.

**Solución**: Usar `date-fns-tz` también en el cliente o formatear las fechas en el servidor y pasarlas como strings ya formateados.

---

#### Advertencia 12: Protección incompleta de sub-rutas en middleware

**Archivo**: `src/middleware.ts`

```typescript
const isGestionRoute = ["/admin", "/excepcionesLaborales", "/diaLaboral"].includes(nextUrl.pathname);
```

Esta verificación usa `.includes()` con coincidencia exacta, por lo que `/diaLaboral/cualquier-subruta` o `/excepcionesLaborales/algo` no estarían protegidas. `/admin/*` sí está protegida gracias a `nextUrl.pathname.startsWith("/admin")` en `isAdminRoute`.

**Solución**: Cambiar a `startsWith` para las rutas de gestión:
```typescript
const isGestionRoute = ["/excepcionesLaborales", "/diaLaboral"].some(r => nextUrl.pathname.startsWith(r));
```

---

### 🔵 OBSERVACIONES (mejoras opcionales)

- **Paginación en `/admin`**: La lista de turnos no tiene paginación. Con muchos registros puede ser lenta.
- **Rate limiting**: No hay protección contra fuerza bruta en el login.
- **Imágenes NextJS**: `unoptimized: true` en `next.config.ts` desactiva la optimización de imágenes de Next.js. Cloudinary ya optimiza, pero las imágenes locales (`/images/logopng.png`) no se beneficiarán de la optimización de Next.
- **`LoginModal.tsx`**: Existe un modal de login alternativo que no parece estar en uso en el flujo principal (hay página `/login` dedicada).
- **Dependencia de `react-resizable-panels`**: Importada via `src/components/ui/resizable.tsx` pero no se usa en ninguna página visible del proyecto.
- **`src/components/ui/bicicleta/Buscador.tsx`**: El componente buscador está en la carpeta `bicicleta/` siendo un componente de uso general. Idealmente debería moverse a `ui/` o `admin/ui/`.

---

## 15. COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev                    # Inicia con Turbopack en puerto 3000

# Base de datos
npx prisma generate            # Genera el cliente Prisma en /generated/prisma
npx prisma db push             # Sincroniza schema con la BD (sin migraciones)
npx prisma studio              # UI visual de la BD en localhost:5555

# Build
npm run build                  # prisma generate + prisma db push (si hay BD) + next build
npm run start                  # Inicia en modo producción
npm run lint                   # ESLint
```

---

## 16. NOTAS PARA DESARROLLO FUTURO

1. **Migrar `useFormState` a `useActionState`** en todos los formularios que aún usan la API deprecated.
2. **Corregir el typo** del modelo `expeciones_laborales` → `excepciones_laborales` en la BD y en todo el código (requiere migración).
3. **Eliminar el `BookingModal` legacy** y el `BookingProvider` si no se van a usar.
4. **Activar validaciones de TypeScript y ESLint en build** una vez corregidos los errores existentes.
5. **Implementar paginación** en el panel admin de turnos.
6. **Unificar el sistema de diálogos**: reemplazar los `window.confirm()` restantes con el `ConfirmProvider`.
7. **Limpiar archivos de bicicleta**: eliminar o mover los archivos demo de la carpeta `ui/bicicleta/`.