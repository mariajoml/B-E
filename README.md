# B&P — Landing

Landing de una sola página para la productora de eventos **B&P**.
HTML, CSS y JavaScript planos: sin framework, sin build, sin dependencias.

**En vivo:** https://mariajoml.github.io/B-E/

---

## Correr en local

```bash
python3 -m http.server 4321
```

Y abrir http://localhost:4321

## Estructura

```
index.html   → todo el marcado + el sprite SVG del logo
styles.css   → estilos (tokens de color arriba del todo)
main.js      → loader, reveals, acordeón, cursor, formulario
assets/      → logo vectorizado, favicon, imagen para redes
```

## Marca

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#1800AC` | Color del logo. Base de la marca. |
| `--acid` | `#D8FF3E` | Acento: botones, índices, detalles. |
| `--ink` | `#07030F` | Secciones oscuras. |
| `--paper` | `#F3F1EA` | Secciones claras. |

Tipografía: **Archivo** (variable, se estira con `wdth`) + **JetBrains Mono**
para las etiquetas chicas. Ambas desde Google Fonts.

El logo se vectorizó a partir del PNG original (`assets/_source-logo.png`)
y vive como sprite SVG dentro de `index.html` (`#bp-wordmark` y `#bp-amp`).
Escala nítido a cualquier tamaño y toma el color del contexto con
`currentColor`. Si llega el logo oficial en vectorial, reemplazar esos dos
`<symbol>`.

## Qué falta reemplazar

Todo lo que hay que cambiar está marcado con `REEMPLAZAR` en el código.

- **Contacto** (`index.html`, sección `#contacto`): `hola@byp.events` y el
  teléfono son de relleno. El mismo correo está en `main.js` como `DESTINO`.
- **Redes**: los tres enlaces apuntan a `#`.
- **Trabajo** (`index.html`, sección `#trabajo`): las cuatro tarjetas usan el
  ampersand sobre un degradado en lugar de fotos. Para poner fotos reales,
  cambiar cada `<div class="work__art">` por:
  ```html
  <img class="work__art" src="assets/trabajo-01.jpg" alt="…">
  ```
  Los títulos y bajadas también son genéricos: no son clientes reales.

## Formulario

No hay backend. Al enviar se arma un `mailto:` con los campos y se abre el
cliente de correo. Si más adelante se quiere recibir los mensajes de verdad,
sirve cualquier servicio de formularios (Formspree, Basin) cambiando el
`submit` en `main.js`.

## Accesibilidad

Navegación por teclado, foco visible, marcado semántico y soporte de
`prefers-reduced-motion` (con movimiento reducido no hay loader, ni parallax,
ni reveals).
