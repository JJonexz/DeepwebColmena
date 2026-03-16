# 🕸️ La Colmena — Simulador de Deep Web

**Proyecto educativo de simulación de navegación anónima**

> Alumno: **Julian Alexis Rios**
> Proyecto: Simulador interactivo Dark Web / OPSEC

---

## 📋 Descripción

**La Colmena** es un simulador web interactivo que recrea la experiencia de navegar por la dark web dentro de un entorno completamente controlado y educativo. El objetivo es enseñar conceptos de **ciberseguridad, anonimato, privacidad digital y OPSEC** de forma visual e inmersiva.

El proyecto simula un navegador anónimo con:
- 12 sitios ficticios con temáticas de la dark web
- Sistema de fachadas ("surface pages") que ocultan el acceso real
- Minijuegos de autenticación para acceder a cada sitio
- Simulación de amenazas (malware, trackers, robo de datos)
- Sistema VPN simulado
- Mensajes de hackers de sombrero blanco (whitehat)

---

## 🎯 Objetivos Pedagógicos

1. **Comprender** por qué se usa VPN y cifrado al navegar por redes anónimas
2. **Identificar** los riesgos de navegar sin protección (tracking, malware, robo de datos)
3. **Aprender** conceptos de OPSEC (Seguridad Operacional)
4. **Conocer** la arquitectura de la red Tor y los servicios .onion
5. **Entender** criptografía básica (ROT, hash, cifrado simétrico/asimétrico)

---

## 🗂️ Estructura del Proyecto

```
lacolmena/
│
├── index.html              ← Chrome del navegador (shell principal)
│
├── css/
│   ├── browser.css         ← Estilos del navegador + temas + amenazas
│   └── shared.css          ← Variables CSS compartidas por páginas
│
├── js/
│   ├── browser.js          ← Router, minijuegos, VPN, historial, config
│   ├── threats.js          ← Sistema de amenazas, whitehat, descargas
│   └── nav.js              ← Helper de navegación (postMessage)
│
├── assets/
│   └── logo.svg            ← Logo hexagonal de La Colmena
│
├── pages/                  ← Sitios reales (post-autenticación)
│   ├── home.html           ← Página de inicio del navegador
│   ├── marketcore.html     ← Marketplace anónimo
│   ├── cryptoforum.html    ← Foro underground
│   ├── shadowwiki.html     ← Wiki oculta
│   ├── mailnode.html       ← Correo cifrado
│   ├── datavault.html      ← Repositorio de archivos
│   ├── darksearch.html     ← Motor de búsqueda
│   ├── neonews.html        ← Portal de noticias underground
│   ├── ghostchat.html      ← Chat anónimo en tiempo real
│   ├── cryptex.html        ← Exchange de criptomonedas
│   ├── idforge.html        ← Simulador de documentos ficticios
│   ├── blackboard.html     ← Bolsa de trabajo anónima
│   ├── phantomvpn.html     ← Servicio VPN
│   └── error.html          ← Página 404
│
└── pages/surface/          ← Páginas de fachada (pre-autenticación)
    ├── marketcore.html     ← "TulipánHolanda" — floristería
    ├── cryptoforum.html    ← "ElHuerto.net" — foro de jardinería
    ├── shadowwiki.html     ← "RecetarioUniversal" — wiki de cocina
    ├── mailnode.html       ← "CorreoLite" — servicio de correo
    ├── datavault.html      ← "NubeSegura" — almacenamiento cloud
    ├── darksearch.html     ← "BuscadorLibre" — buscador privado
    ├── neonews.html        ← "TechDiario" — blog de tecnología
    ├── ghostchat.html      ← "SoporteVivo" — chat de atención al cliente
    ├── cryptex.html        ← "CryptoPrecios" — cotizaciones crypto
    ├── idforge.html        ← "ImprentaDigital" — diseño de documentos
    ├── blackboard.html     ← "AvisosClasificados" — empleos
    └── phantomvpn.html     ← "ProxyVerde" — VPN básico
```

---

## 🎮 Mecánicas del Juego

### Flujo de acceso a cada sitio

```
[Usuario ingresa URL] 
        ↓
[Página de Fachada]   ← Sitio inocente que oculta el acceso real
        ↓
[Trigger Oculto]      ← Elemento escondido que el usuario debe encontrar
        ↓
[Minijuego]           ← Desafío de seguridad (5 tipos distintos)
        ↓
[Animación TOR]       ← Simulación de conexión por nodos relay
        ↓
[Sitio Real]          ← El sitio underground real
```

### Triggers ocultos (por sitio)

| Sitio | Fachada | Cómo acceder |
|-------|---------|-------------|
| marketcore.onion | TulipánHolanda | Clic 3 veces en "Catálogo B2B ▸" (footer) |
| cryptoforum.onion | ElHuerto.net | Clic en "Sección privada…" (sidebar) |
| shadowwiki.onion | RecetarioUniversal | Clic en "v2.1 →" (navegación) |
| mailnode.onion | CorreoLite | Triple clic en ícono 🔒 |
| datavault.onion | NubeSegura | Clic en badge "v2.0" del logo |
| darksearch.onion | BuscadorLibre | Buscar la palabra **acceso** |
| neonews.onion | TechDiario | Clic en categoría "RESTRINGIDO" |
| ghostchat.onion | SoporteVivo | Escribir **admin** en el chat |
| cryptex.onion | CryptoPrecios | Clic en "Modo Avanzado ⚙" |
| idforge.onion | ImprentaDigital | Clic en "Plantillas Pro ▸" |
| blackboard.onion | AvisosClasificados | Seleccionar "Sin restricciones ●" |
| phantomvpn.onion | ProxyVerde | Clic en "Política de privacidad" |

### Minijuegos de autenticación (5 tipos, aleatorios)

1. **Terminal** — Escribir el comando de conexión exacto
2. **Cifrado ROT-3** — Descifrar una palabra desplazada 3 letras
3. **Patrón de seguridad** — Memorizar y replicar una secuencia en grilla 3×3
4. **Hash SHA-256** — Identificar los últimos 4 caracteres de un hash
5. **Conectar cables** — Emparejar terminales izquierda↔derecha

---

## 🛡️ Sistema de Amenazas

### Sin VPN activo, al visitar sitios peligrosos:

1. **Notificación de advertencia** — aparece inmediatamente al cargar el sitio
2. **Hacker Whitehat** — aparece en la esquina inferior con consejos de seguridad
3. **Overlay de amenaza** (uno de tres tipos):
   - **Malware** — simula un script malicioso con log de actividad
   - **Tracker** — muestra IP, ISP y ubicación detectados
   - **Robo de datos** — simula exfiltración de datos de sesión

### Con VPN activo:
- Las amenazas no se activan
- Notificación verde de confirmación al conectar

---

## 💾 Sistema de Descargas Simuladas

Al descargar archivos en MarketCore o DataVault:
- Se muestra una barra de progreso realista
- Se descarga un **archivo .txt inofensivo** con contenido educativo
- Si no hay VPN activo, aparece una advertencia de "IP registrada"

Los archivos simulados incluyen:
- `rat_v4.2_FUD.exe`
- `keylogger_pro.exe`
- `DATOS_FILTRADOS.zip`
- `exploit_kit.tar.gz`
- `credentials_dump.txt`

> ⚠️ **Todos son archivos .txt completamente inofensivos** con texto explicativo.

---

## ⚙️ Panel de Configuración

Accesible desde el botón **⚙** en la barra de navegación:

### 🎨 Apariencia
- Modo oscuro / claro
- 7 colores de acento (azul, cian, verde, morado, naranja, rojo, dorado)
- Efecto scanlines on/off
- Animación TOR on/off
- Minijuegos on/off

### 🛡 VPN Simulado
- 10 países disponibles (Alemania, Países Bajos, Suiza, Suecia, Islandia, EE.UU., Japón, Brasil, Singapur, Australia)
- Estadísticas en tiempo real: ping, velocidad, tiempo de conexión, cifrado
- IP falsa que aparece en la barra de información
- Kill Switch, Tor-sobre-VPN, política no-log

### 🕐 Historial
- Registro de todos los sitios visitados con hora
- Búsqueda en tiempo real
- Eliminar entradas individuales o borrar todo

---

## 🚀 Cómo ejecutar

1. Descomprimir el archivo `lacolmena.zip`
2. Abrir `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge)
3. No requiere servidor, instalación ni internet (excepto fuente tipográfica)

> **Recomendado:** Chrome o Edge para mejor compatibilidad visual

---

## 🔧 Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de todas las páginas |
| CSS3 | Estilos, animaciones, temas, modo claro/oscuro |
| JavaScript (ES5/ES6) | Lógica del navegador, minijuegos, amenazas |
| CSS Variables | Sistema de temas y colores de acento |
| postMessage API | Comunicación entre iframes sin restricciones |
| localStorage API | Persistencia del tema seleccionado |
| Blob API | Generación de archivos descargables |
| iframe | Aislamiento de páginas individuales |

---

## ⚠️ Aviso Legal y Educativo

Este proyecto es **100% ficticio y educativo**. Todos los sitios, productos, usuarios, transacciones, datos y eventos son **simulaciones creadas con fines pedagógicos**.

- No existe conexión real a ninguna red Tor o dark web
- Los "archivos descargables" son archivos .txt inofensivos
- Ningún dato personal es recolectado ni transmitido
- Las amenazas mostradas son animaciones educativas, no malware real

---

## 👤 Autor

**Julian Alexis Rios**
Proyecto educativo — Simulador Dark Web / Ciberseguridad

---

*La Colmena — "La red oculta, dentro de tu navegador"*
<<<<<<< HEAD

---

## 🏢 Empresa Desarrolladora

**RBSC** es la empresa responsable del desarrollo, mantenimiento y distribución de **La Colmena**.

RBSC crea soluciones educativas de simulación en ciberseguridad con el objetivo de acercar conceptos técnicos avanzados a estudiantes y público general de forma segura, interactiva y pedagógica.

---

## 📄 Términos y Condiciones

**© 2024 RBSC — Todos los derechos reservados.**

Al usar este software aceptás los siguientes términos:

1. **Uso exclusivamente educativo.** La Colmena está diseñada para fines pedagógicos únicamente. Queda prohibido cualquier uso con intención de replicar, facilitar o promover actividades ilegales.

2. **Simulación ficticia.** Todos los sitios, productos, usuarios, transacciones y eventos dentro del simulador son completamente ficticios. Ningún elemento representa personas, organizaciones o actividades reales.

3. **Sin conexión real.** El software no establece ninguna conexión a redes externas, servicios .onion reales, ni a ninguna infraestructura de la dark web. Todo ocurre localmente en el navegador del usuario.

4. **Archivos inofensivos.** Los archivos descargables generados por el simulador son documentos de texto plano (.txt) con contenido educativo. No contienen código ejecutable ni malware de ningún tipo.

5. **Sin recolección de datos.** RBSC no recolecta, almacena ni transmite datos personales de los usuarios. El único almacenamiento utilizado es `localStorage` del propio navegador, de forma local y bajo control del usuario.

6. **Propiedad intelectual.** El código fuente, diseño, estructura y contenido de La Colmena son propiedad de RBSC. Se permite su uso y modificación con fines educativos citando la fuente.

7. **Exención de responsabilidad.** RBSC no se hace responsable del uso indebido de este software fuera del contexto educativo para el que fue diseñado.

8. **Distribución.** Este software puede distribuirse libremente en entornos académicos siempre que se mantenga la autoría de RBSC y de los desarrolladores participantes.

---

## 👥 Participantes del Proyecto

| Nombre | Rol |
|--------|-----|
| **Julian Alexis Rios** | Desarrollador / Diseñador |
| **Maximo Thiago Estigarribia** | Desarrollador / Colaborador |

**Empresa:** RBSC
**Proyecto:** La Colmena — Simulador Interactivo Dark Web
=======
>>>>>>> 77925169c7a22ebc0228537f897cadf2f8a488ac
