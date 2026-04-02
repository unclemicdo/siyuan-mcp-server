# siyuan-mcp-server

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [Español](./README_es.md) | [한국어](./README_ko.md)

`siyuan-mcp-server` es un servidor MCP local por `stdio` que permite a clientes de IA compatibles con MCP acceder directamente a tus notas de SiYuan. Este repositorio también incluye una skill complementaria opcional para agentes que admiten skills locales. Una vez configurado, puedes conectarlo a herramientas como Claude Code, Cursor o Codex CLI y dejar que el agente lea, recupere, reorganice y actualice tus notas, convirtiendo SiYuan de un lugar donde solo guardas información en una base de conocimiento personal con la que el agente puede trabajar activamente.

## Para qué sirve

Una vez conectado, el agente no se limita a leer una sola nota. Puede trabajar sobre muchas notas y reconstruir contexto desde tu base de conocimiento. Algunos casos de uso de alto valor son:

- reconstruir la historia de un proyecto a partir de notas diarias, reportes semanales, actas de reunión y documentos del proyecto
- resumir avances, riesgos, decisiones y trabajo pendiente basándose en lo que ya has escrito
- convertir notas dispersas, compromisos y conclusiones en una salida accionable
- continuar un borrador existente usando tu contexto real en lugar de empezar desde cero
- reorganizar cuadernos, documentos y bloques sin tener que ir haciendo clic en la interfaz

La mayoría de los usuarios no necesita escribir SQL ni gestionar atributos de bloques manualmente. Puedes describir el resultado que quieres y el agente llamará a las herramientas adecuadas.

Por ejemplo:

- "Revisa todas las notas diarias, reportes semanales y actas de reunión relacionadas con el Proyecto Alpha de los últimos 30 días, y luego genera un resumen de avance con decisiones clave, riesgos actuales, pendientes y próximos pasos."
- "Conecta mis actas de reunión y registros de trabajo de las últimas dos semanas, identifica problemas repetidos, tareas recurrentes y compromisos que todavía no se han cerrado."
- "Usa mis notas recientes de producto, borradores de requisitos y reportes semanales para armar un borrador del roadmap actual, e indica qué documentos respaldan cada conclusión importante."
- "Encuentra todas las notas recientes sobre este cliente y construye una línea de tiempo con contexto, historial de comunicación, compromisos y acciones de seguimiento."
- "Reúne el material disperso sobre este tema, reescríbelo como un resumen más claro y estructurado, y añádelo al final del documento de destino."

## Instalación

### Requisitos

- Node.js 18 o superior
- Una instancia de SiYuan en ejecución
- Un token válido de la API de SiYuan

Puedes encontrar el token en `Settings -> About -> API Token` dentro de SiYuan.

### Obtener el código

```bash
git clone https://github.com/unclemicdo/siyuan-mcp-server.git
cd siyuan-mcp-server
```

### Instalar dependencias y compilar

```bash
npm install
npm run build
```

La ruta estable de ejecución es el artefacto local `dist/index.js`.

### Configuración automática

Si tu agente o cliente admite comandos para gestionar MCP, puedes dejar que añada la configuración automáticamente. También puedes ejecutar tú mismo los mismos comandos.

Todos los ejemplos siguientes asumen que ya ejecutaste `npm install` y `npm run build`, y que `/path/to/siyuan-mcp-server` es tu ruta absoluta real.

#### Claude Code

```bash
claude mcp add -e SIYUAN_TOKEN=your-siyuan-api-token-here siyuan -- node /path/to/siyuan-mcp-server/dist/index.js
```

Si necesitas otro puerto o host, añade `-e SIYUAN_BASE_URL=http://127.0.0.1:6807`.

#### Codex CLI

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

Si necesitas cambiar la dirección o el puerto por defecto, añade `SIYUAN_BASE_URL` como otra variable de entorno.

Ejemplo:

```bash
codex mcp add siyuan \
  --env SIYUAN_TOKEN=your-siyuan-api-token-here \
  --env SIYUAN_BASE_URL=http://127.0.0.1:6807 \
  -- node /path/to/siyuan-mcp-server/dist/index.js
```

### Configuración manual

Si prefieres gestionar los archivos de configuración tú mismo, o tu cliente no ofrece un comando para añadir servidores MCP, usa una de las opciones manuales siguientes.

#### Claude Code

Configuración manual en `~/.claude.json`:

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Claude Desktop

Edita el archivo de configuración:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Cursor

Crea `.cursor/mcp.json` en la raíz del proyecto:

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

### Variables de entorno

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | Sí | none | Token de la API de SiYuan |
| `SIYUAN_BASE_URL` | No | `http://127.0.0.1:6806` | URL base de SiYuan; los destinos no locales muestran una advertencia al iniciar |

### Verificación después de la configuración

Después de instalar y configurar el cliente, conviene ejecutar al menos una verificación local:

```bash
npm test
```

Para comprobaciones interactivas del protocolo:

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

### Skill complementaria opcional

Este repositorio también incluye una skill complementaria opcional en `skills/siyuan-mcp-skill/`.

La skill no añade nuevas herramientas MCP. Enseña al agente a usar las herramientas existentes de SiYuan de forma más fiable para búsquedas, trazabilidad, síntesis y escrituras seguras.

Si tu agente admite skills locales, instálala copiando el directorio a tu carpeta de skills. Para entornos de estilo Codex:

```bash
mkdir -p ~/.agents/skills
rm -rf ~/.agents/skills/siyuan-mcp-skill
cp -R skills/siyuan-mcp-skill ~/.agents/skills/
```

Después de instalarla, puedes invocarla explícitamente en entornos que admiten invocación de skills:

- Estilo Codex: `$siyuan-mcp-skill`
- Estilo Claude Code: `/siyuan-mcp-skill`

Úsala cuando quieras que el agente busque entre muchas notas, reconstruya líneas de tiempo, continúe un documento existente o tome decisiones de escritura más seguras con este MCP.

## Funciones

Actualmente el servidor expone 22 herramientas, agrupadas así:

| Categoría | Cantidad | Descripción |
| --- | --- | --- |
| Gestión de cuadernos | 5 | Listar, crear, abrir, cerrar y renombrar cuadernos |
| Operaciones con documentos | 5 | Crear, renombrar, eliminar, mover y exportar Markdown |
| Operaciones con bloques | 7 | Insertar, añadir, actualizar, eliminar e inspeccionar bloques |
| Atributos de bloques | 2 | Leer y escribir metadatos personalizados de bloques |
| Consulta SQL | 1 | Consultas `SELECT` de solo lectura |
| Herramientas del sistema | 2 | Obtener versión y enviar notificaciones |

Desde la perspectiva de un usuario normal, esto significa principalmente:

- encontrar contenido por título, etiqueta, fecha de actualización o alcance del contenido
- leer contenido como bloques, estructura de documentos o Markdown completo
- modificar contenido añadiendo secciones, actualizando bloques o creando y moviendo documentos
- reorganizar la estructura entre cuadernos, documentos y bloques

Como integración para una base de conocimiento personal, el valor real es que el agente puede trabajar dentro de tu propio contexto en lugar de darte respuestas genéricas. Puede continuar desde tus notas, resumirlas, rastrear decisiones a través de ellas y organizarlas por ti.

Hay dos áreas más avanzadas:

- `siyuan_sql_query` existe para que un agente pueda hacer búsquedas más eficientes cuando sea necesario. La mayoría de los usuarios nunca tendrá que escribir SQL directamente.
- Las herramientas de atributos de bloques son útiles si ya usas metadatos `custom-*` en tu propio flujo de trabajo. Si no usas ese patrón, puedes ignorarlas.

Para ver la redacción exacta de cada herramienta, consulta las descripciones en `src/tools/*.ts`.

## Notas y limitaciones

Este servidor es una integración local con privilegios elevados. Una vez configurado, el cliente habla con SiYuan usando tu token de API.

- El destino por defecto es `http://127.0.0.1:6806`
- Si apuntas `SIYUAN_BASE_URL` a una dirección no local, tu token y el contenido de tus notas se enviarán allí
- Si ese destino no local no usa HTTPS, tu token y tu contenido podrían quedar expuestos en tránsito
- Las herramientas de eliminar, mover y actualizar realizan escrituras reales sobre tu base de conocimiento
- `siyuan_sql_query` solo acepta una instrucción `SELECT` de solo lectura y rechaza `UPDATE`, `DELETE`, `PRAGMA` y cargas con múltiples instrucciones

Desde esta versión, el servidor muestra advertencias al iniciar si `SIYUAN_BASE_URL` no es local o no usa HTTPS.

Actualmente este proyecto se distribuye como un servidor MCP local por `stdio`:

- Adecuado para clientes que pueden lanzar un proceso MCP local
- No está pensado como gateway MCP alojado, multiusuario o gestionado remotamente

## Solución de problemas

### Falta `SIYUAN_TOKEN`

El servidor termina al iniciarse. Añade el token al entorno del servidor MCP en la configuración de tu cliente.

### No se puede conectar a SiYuan

Comprueba:

- si SiYuan está en ejecución
- si `SIYUAN_BASE_URL` es correcto
- si el destino configurado es local o remoto

Si ves una advertencia de destino no local, la configuración actual enviará tu token fuera del host.

### 401 Unauthorized

Normalmente significa que el token es incorrecto, ha expirado o pertenece a otra instancia de SiYuan. Asegúrate de que el token y `SIYUAN_BASE_URL` correspondan a la misma instancia.

### Los resultados SQL se truncaron

Los resultados grandes se truncan intencionalmente. Añade `LIMIT`, `WHERE` o selecciona menos columnas.

## Limitaciones conocidas

- Solo admite un servidor `stdio` lanzado localmente, no un servicio MCP remoto alojado
- No hay una capa adicional de permisos más allá del token de la API de SiYuan
- La herramienta SQL solo admite `SELECT` de solo lectura
- Los conjuntos de resultados grandes se truncarán antes de llegar al cliente

## Agradecimientos

Este proyecto se implementó tomando como referencia la documentación oficial de la API de SiYuan.

- Repositorio de SiYuan: [github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- Documentación de la API de SiYuan: [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
