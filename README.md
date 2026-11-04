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
| **Archivos adjuntos** | Al publicar se pueden subir hasta 3 archivos (PDF, imágenes, Word, PowerPoint, Excel, ZIP; 10 MB c/u). Si es **Gratis**, cualquier usuario registrado descarga; si es **Intercambio**, se desbloquea cuando el autor acepta la solicitud. Se guardan en IndexedDB del navegador. |
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

Desde el botón **Admin** se ve el registro completo de usuarios, se asignan roles (Estudiante, Profesor / Docente, Administrador, etc.), se crean roles nuevos, se moderan publicaciones y se atienden reportes.

## Limitación importante (siguiente paso)

Los datos se guardan en el **navegador de cada dispositivo** (`localStorage`). Es ideal para presentar el prototipo, pero dos personas en computadoras distintas no ven las mismas publicaciones. Para usarlo en serio entre estudiantes hace falta un backend con base de datos compartida y autenticación real (por ejemplo Supabase o Firebase).

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
