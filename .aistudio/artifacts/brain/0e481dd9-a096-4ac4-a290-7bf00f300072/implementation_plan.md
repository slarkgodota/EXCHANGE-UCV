# Exchange UCV: Base de Datos Persistente & Auditor de Originalidad con IA

Plan integral para evolucionar **Exchange UCV** desde almacenamiento local hacia una infraestructura real en la nube con **Firebase (Firestore & Authentication)** y un motor de **auditoría de integridad académica y similitud con IA (Google Gemini 3.8 Flash)** alineado al Artículo 10 del proyecto del Grupo 5.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones Confirmadas por el Usuario:**
> 1. **Persistencia & Cuentas:** Se conectará una base de datos en la nube y autenticación de usuarios para asegurar que las publicaciones, reseñas de 5 estrellas, solicitudes de intercambio y reportes se sincronicen entre todas las sedes de la UCV.
> 2. **Evaluación de Originalidad con IA:** Se incorporará un análisis automatizado asistido por IA (usando `@google/genai` con `gemini-3.8-flash` en el servidor) que evalúa el contenido de apuntes, guías y descripciones antes o después de publicar, identificando nivel de aporte formativo, citas y posibles riesgos de plagio o fraude.
>
> **Decisión Recomendada para Aprobación:**
> - Se provisionará Firebase mediante el flujo oficial de AI Studio (`show_aistudio_ui` con `firebase_setup` y `ProvisionFirebase` RPC), generando `firestore.rules` auditadas con ABAC y RBAC para proteger el rol de los creadores del Grupo 5 y los administradores.

---

### 1. Overview & Core Concept

- **Qué hace:** Transforma el prototipo de Exchange UCV en una plataforma universitaria conectada a nivel nacional. Los estudiantes de ingeniería y carreras afines de la UCV pueden registrarse o iniciar sesión, publicar y explorar materiales legítimos de estudio, solicitar tutorías 1 a 1 y formar equipos de investigación, con la garantía de que cada material cuenta con un semáforo de integridad académica evaluado mediante IA.
- **Audiencia Objetivo:** Comunidad estudiantil y docente de todas las sedes de la Universidad César Vallejo (Lima Norte, Trujillo, Piura, Tarapoto, Moyobamba, Chiclayo, etc.), con gobernanza reservada al Grupo 5 y coordinadores académicos.
- **Valor Principal:** Elimina la dispersión de material en fotocopiadoras informales, formaliza el apoyo solidario entre pares (RSU) y previene infracciones éticas universitarias antes de que lleguen a Turnitin o tribunales docentes.

---

### 2. User Experience & Visual Design

#### A. Flujos Principales de Usuario
1. **Acceso & Perfil:** El usuario ingresa con su identidad universitaria. La sesión se mantiene persistente en la nube; se cargan en tiempo real sus solicitudes pendientes y sus publicaciones.
2. **Publicación Asistida por IA:** Al crear un material o tutoría, el estudiante puede presionar *"Analizar Originalidad & Aporte Académico"* antes de enviar. El motor de Gemini evalúa en segundos el texto o índice, asigna un índice de originalidad (0 a 100%), detecta citas correctas (APA/Vancouver) y emite un veredicto de conformidad ética.
3. **Exploración con Indicador de Confianza:** Las tarjetas del catálogo muestran un indicador sutil y no invasivo de validación académica (`Verificado UCV` y `Originalidad Ética`), complementando la tabla de valoración de 5 estrellas.
4. **Coordinación e Intercambio Seguro:** Solicitudes en vivo entre pares con revelación segura de datos de contacto (WhatsApp y correo institucional) solo cuando la solicitud es aceptada.
5. **Panel de Control & Moderación (Admin):** Visualización en tiempo real de métricas institucionales, padrón de usuarios con asignación de roles y atención de reportes de integridad.

#### B. Identidad Visual & Anti-Slop Discipline
- **Paleta Institucional UCV:**
  - Azul profundo institucional: `#14234b` y `slate-950` para estructuras, cabeceras y contrastes de alta jerarquía.
  - Rojo Vallejiano: `#ab2a30` y `red-600` como color primario de acción y acento.
  - Fondos limpios y neutrales: `bg-slate-50` y `white` con contraste WCAG AA riguroso.
  - Acentos de estado discretos: Esmeralda sobrio para verificado, ámbar cálido para valoraciones de 5 estrellas.
- **Disciplina Tipográfica:** Tipografía 'Space Grotesk' para títulos académicos y 'Plus Jakarta Sans' para cuerpo y tablas de datos.
- **Cero Píldoras Innecesarias:** Metadatos mostrados como texto limpio con separadores tipográficos (`·`, `/`), reservando los botones interactivos únicamente para filtros activos y acciones funcionales.

---

### 3. Key Product Decisions & Trade-Offs

- **Persistencia en la Nube (Firebase Firestore vs. LocalStorage puro):**
  - *Elección:* Migración transparente con arquitectura dual: los datos iniciales y la estructura de `ExchangeContext` se conectan a Firestore en tiempo real (`onSnapshot`), con fallback resiliente en caso de desconexión.
  - *Razón:* Los intercambios entre distintas sedes (ej. un estudiante de Lima Norte y otro de Trujillo) exigen sincronización multiusuario inmediata.
- **Auditoría de Integridad con Gemini 3.8 Flash (Server-Side Proxy):**
  - *Elección:* Endpoint backend `/api/ai/audit-integrity` ejecutando `ai.models.generateContent` con esquema JSON estructurado (`responseSchema`) vía `@google/genai`.
  - *Razón:* Procesa el análisis de originalidad en menos de 1 segundo sin costo excesivo, sin exponer claves en el cliente y garantizando una salida estructurada con porcentaje, fortalezas, advertencias y recomendaciones pedagógicas.
- **Gobernanza de Roles y Permisos (RBAC):**
  - *Elección:* Los fundadores oficiales del Grupo 5 (`mdelgadoc@ucvvirtual.edu.pe`, etc.) mantienen permisos raíz protegidos contra revocación accidental. Los administradores pueden promover estudiantes o catedráticos desde el panel.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE WEB (React 19)                        │
├────────────────────────────────────────────────────────────────────────┤
│  Navbar & Autenticación  │  Hero UCV & Catálogo  │  Ficha 5 Estrellas  │
│  Bandeja Intercambios    │  Modal Nueva Pub      │  Panel Admin & KPIs │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ESTADO & CONTEXTO LOCAL                         │
│                    `ExchangeContext` & Firestore Hooks                 │
└───────────────────────┬───────────────────────────────┬────────────────┘
                        │                               │
                        ▼                               ▼
      ┌─────────────────────────────────┐   ┌─────────────────────────────┐
      │      BACKEND / API PROXY        │   │    FIREBASE FIRESTORE       │
      │  (Express + Vite Middlewares)   │   │  - Colección `publications` │
      │  - POST `/api/ai/audit`         │   │  - Colección `users`        │
      │  - Google GenAI (3.8 Flash)     │   │  - Colección `requests`     │
      │  - User-Agent: 'aistudio-build' │   │  - Colección `reports`      │
      └─────────────────────────────────┘   │  - Reglas `firestore.rules` │
                                            └─────────────────────────────┘
```

#### Modelo de Datos en Firestore (`firebase-blueprint.json`):
1. `/users/{userId}`: Datos de estudiante/docente, carrera, campus, ciclo, ORCID, bio, rol (`student`, `docente`, `admin`).
2. `/publications/{publicationId}`: Título, descripción, carrera, curso, autor, categoría, valoración promedio, reseñas embebidas, etiquetas y estado de auditoría ética de IA (`integrityScore`, `aiAuditSummary`).
3. `/requests/{requestId}`: Solicitudes de contacto e intercambio académico entre remitente y destinatario con estado (`pendiente`, `aceptada`, `completada`, `rechazada`).
4. `/reports/{reportId}`: Reportes formales de irregularidad o plagio académico supervisados por coordinación.
