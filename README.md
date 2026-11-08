# Exchange UCV — Plataforma académica colaborativa (Grupo 5)

Prototipo estudiantil para que estudiantes de la **Universidad César Vallejo** compartan materiales, ofrezcan asesorías entre pares y formen equipos de investigación.

> Proyecto de la Escuela Profesional de Ingeniería Civil, UCV Moyobamba (2026).
> Autores: Delgado Cerdán, Michael Jefferson · Gonzalez Guevara, José Roly · Grandez Acosta, Michael Cristofer. Docente: Ing. Alex Tongo Silva.
> **No es una herramienta oficial de la UCV ni está integrada a Trilce.**

## Qué incluye

| Sección | Descripción |
| --- | --- |
| **Registro e inicio de sesión** | Cualquier persona crea su cuenta (nombre, correo, contraseña, carrera, campus). Contraseñas guardadas con hash SHA-256 + sal, nunca en texto plano. |
| **Catálogo** | Publicaciones reales de la comunidad en las 3 secciones del proyecto (Conocimientos, Materiales, Investigación). Cada publicación **ofrece** o **busca** (pedir apoyo también es posible). Filtros por carrera, curso, tema, tipo de recurso (resumen, apuntes, presentación, mapa conceptual…) y campus. Empieza vacío. |
| **Cómo funciona** | Los 5 pasos del PDF: Ingresar → Buscar → Publicar → Contactar → Coordinar. |
| **Vistas separadas** | Inicio, Catálogo, Biblioteca y Sedes son páginas distintas (#catalogo, #biblioteca, #sedes) con animaciones de entrada escalonadas. |
| **Valoración de 5 estrellas** | En cada publicación (con reseñas y distribución) y en cada recurso de la biblioteca. |
| **Biblioteca** | 23 recursos reales: catálogo, repositorio y MyLOFT de la UCV; ALICIA, RENATI, SciELO Perú; RNE e INACAL; APA, ORCID, CTI Vitae; y guías de estudio con fuentes oficiales. Editable en `src/data/library.ts`. |
| **Sedes UCV** | Los 12 campus oficiales y los horarios de sus bibliotecas (fuente: ucv.edu.pe). Editable en `src/data/ucv.ts`. |
| **Solicitudes** | El contacto (correo / celular) solo se muestra cuando se acepta la solicitud. |
| **Panel de administración** | Usuarios, roles, moderación y reportes. Solo para cuentas con permisos. |
| **Archivos adjuntos** | Al publicar se pueden subir hasta 3 archivos (PDF, imágenes, Word, PowerPoint, Excel, ZIP; 10 MB c/u). Si es **Gratis**, cualquier usuario registrado los ve y descarga. Si es **Intercambio** o **Equipo**, todos pueden ver una **vista previa parcial** según el tamaño del PDF (1 hoja → solo la parte de arriba; 2–4 hojas → 1 hoja; 5–10 → 2 hojas; más de 10 → 3 hojas), la parte de arriba de las imágenes y las primeras líneas de los textos; el resto sale **borroso y bloqueado**, con marca de agua y sin botón de descarga. El documento completo y la **descarga** se habilitan solo cuando el autor acepta la solicitud. Se guardan en Supabase Storage (o en IndexedDB si no hay base de datos). |
| **Autor y administradores** | Ven y descargan sus archivos completos; en el visor aparece un aviso y el botón **Ver como los demás** para comprobar la vista previa parcial. |
| **Modo oscuro** | Botón en la esquina; todos los colores claros de la página tienen su versión oscura (revisado con una prueba automática de contraste en 36 pantallas). |
| **Responder comentarios** | Debajo de cada comentario/valoración hay un botón **Responder**. Las respuestas muestran el nivel de quien responde y la etiqueta **Autor** si es quien publicó; cada uno puede borrar sus respuestas (y los admins cualquiera). Se guardan en la base de datos como colección aparte (`replies`), así no se pisan entre usuarios. |
| **EXP y niveles** | Cada usuario gana EXP al publicar (+25), recibir valoraciones (+0 a +20 según las estrellas), ser destacado (+40), aceptar (+15) y completar intercambios (+30), valorar a otros (+5) y responder (+2, hasta 25 respuestas). Niveles: 1 Novato · 2 Aprendiz (60) · 3 Colaborador (150) · 4 Destacado (300) · 5 Experto (500) · 6 Mentor (800) · 7 Leyenda UCV (1200). Se ve en las tarjetas, comentarios, "Mi cuenta", el panel admin y el **Top colaboradores** del Inicio. La EXP se calcula siempre desde los datos, no se puede editar a mano. |
| **Desfile de profesionales en el Inicio** | Animación 3D de profesionales de la UCV (abogada, ingeniero civil, ingeniera de sistemas, médico, enfermera, arquitecta, docente…) con su ropa y herramientas, caminando por el campus. Cuando cada uno llega al centro se voltea, saluda y aparece su carrera; al tocarla se abre el catálogo de esa carrera. |
| **Escenas 3D de cada carrera** | Al elegir una carrera o categoría aparece su escena 3D al aire libre con su ambiente: Derecho → Palacio de Justicia con balanza y martillo; Ing. Civil → obra con grúa y edificio que crece; Medicina → hospital con ambulancia y corazón latiendo; Sistemas → centro de datos con red de datos; etc. (15 escenas). |
| **Colores por carrera** | Al elegir una carrera (en el catálogo, desde el Inicio o buscándola, p. ej. "derecho penal") toda la página toma sus colores, la letra de sus títulos y un fondo animado propio (balanza y columnas, plano y grúa, lluvia de código, electrocardiograma, dibujos de tiza…). Funciona en modo claro y oscuro; con "Todas" se vuelve a lo normal. |
| **Editar publicaciones** | El autor (y los administradores) tienen el botón **Editar publicación** en el detalle: se abre el mismo formulario con los datos cargados, se pueden quitar o agregar archivos, y queda la marca "editado el …" y el registro en el historial del admin. |
| **Declaración de responsabilidad** | Antes de publicar, la persona acepta que es responsable de su contenido (autoría, citas, sin exámenes copiados, datos verídicos). |

## Ejecutar en tu PC

Requisito: [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm install      # solo la primera vez (necesita internet)
npm run dev      # abre http://localhost:3000
npm test         # pruebas unitarias
npm run build    # versión de producción en /dist
```

En Windows también puedes hacer doble clic en `iniciar_en_windows.bat` (en Mac/Linux: `iniciar_en_mac_linux.sh`).


## Cuentas de administrador

| Cuenta | Correo | Contraseña inicial |
| --- | --- | --- |
| Administrador | `admin@exchangeucv.pe` | `AdminUCV2026` |
| Michael Jefferson Delgado Cerdán (dueño) | `mdelgadoc@ucvvirtual.edu.pe` | `AdminExchange2026*` |
| José Roly Gonzalez Guevara (dueño) | `jgonzalezg@ucvvirtual.edu.pe` | `AdminExchange2026*` |
| Michael Cristofer Grandez Acosta (dueño) | `mgrandeza@ucvvirtual.edu.pe` | `AdminExchange2026*` |

Desde el botón **Admin** se ve el registro completo de usuarios, el **historial de actividad** (registros, inicios de sesión, publicaciones, solicitudes, reportes, cambios de rol), se descargan ambos en Excel (CSV), se asignan roles (Estudiante, Profesor / Docente, Administrador, etc.), se crean roles nuevos, se moderan publicaciones y se atienden reportes.

## Base de datos compartida (Supabase)

Para que lo que publica una persona lo vean todos, la página se conecta a Supabase (gratis):

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor → New query**, pega todo el archivo `supabase/schema.sql` y pulsa **Run**. Crea las tablas, las cuentas iniciales y la carpeta de archivos `adjuntos`.
3. En **Project Settings → API** copia la **Project URL** y la clave **anon public**.
4. Pégalas en `config.js` (en la rama `gh-pages`, o en `public/config.js` del código):

```js
window.EXCHANGE_CONFIG = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJ...',
};
```

Sin esos datos la página funciona igual, pero guarda todo solo en el navegador de cada persona. El pie de página indica el modo: "Datos compartidos en línea" o "Guardado en este navegador".

Las contraseñas se guardan cifradas con bcrypt en la tabla `accounts`, que no se puede leer desde la página. El resto de datos (publicaciones, perfiles, historial) es de lectura y escritura pública con la clave anon: suficiente para un prototipo, pero no para datos sensibles.

## Estructura

```
src/
  data/ucv.ts          Datos reales de la UCV (campus, horarios, licencia, contacto)
  data/library.ts      Recursos de la biblioteca
  data/initialData.ts  Cuentas de los autores y roles (sin datos ficticios)
  context/             Estado global (cuentas, publicaciones, solicitudes)
  components/          Interfaz
  utils/security.ts    Hash de contraseñas y validación de registro
server.ts              Servidor Express + endpoint de auditoría con Gemini
```

## Fuentes de la información institucional

- Campus: https://www.ucv.edu.pe/en/campus-ucv
- Bibliotecas y horarios: https://www.ucv.edu.pe/en/information-centers
- Licenciamiento SUNEDU (Res. 077-2019-SUNEDU/CD): https://andina.pe/ingles/noticia-sunedu-otorga-licenciamiento-a-universidad-cesar-vallejo-norma-legal-y-graficos-755220.aspx

> Las escenas 3D usan [three.js](https://threejs.org) (licencia MIT), incluido en `public/vendor/three/`.
>
> El visor de PDF usa [pdf.js](https://github.com/mozilla/pdf.js) (Mozilla, licencia Apache 2.0), incluido en `public/vendor/pdfjs/`.
