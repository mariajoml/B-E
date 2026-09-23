# B&P, landing

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
styles.css   → estilos (los tokens de color y tipografía están arriba del todo)
main.js      → loader, reveals, riel, parallax, cursor, formulario
assets/      → logo vectorizado, favicon, imagen para redes
assets/mock/ → imágenes generadas, provisionales
```

## Dirección visual

Oscuro cinematográfico. Negro de base, el azul de marca usado como luz y
crema para el texto. Referencias: Siena Film Foundation (el ticket troquelado,
el collage tipográfico, las fichas de proyecto), Cassette y Cloudstudio.

| Token | Valor | Uso |
|---|---|---|
| `--black` | `#070708` | Fondo principal. |
| `--void` | `#0D0D11` | Secciones alternas. |
| `--cream` | `#F2EFE6` | Texto y tickets. |
| `--blue` | `#1800AC` | Color del logo. Horarios, detalles. |
| `--blue-lift` | `#4526FF` | El azul como luz: acentos, hovers. |

Tipografía: **Anton** para titulares (condensada, mayúsculas), **Manrope**
para leer y **JetBrains Mono** para rótulos, horarios y datos técnicos.

El logo se vectorizó desde el PNG original (`assets/_source-logo.png`) y vive
como sprite SVG dentro de `index.html` (`#bp-wordmark` y `#bp-amp`). Escala
nítido a cualquier tamaño y toma el color del contexto con `currentColor`. Si
llega el logo oficial en vectorial, reemplazar esos dos `<symbol>`.

## Qué falta reemplazar

Todo lo que hay que cambiar está marcado con `REEMPLAZAR` en el código.

- **Las imágenes de `assets/mock/` no son fotos.** Están generadas por
  script (`scratchpad/mock.py`): son manchas de luz sobre negro que simulan
  un escenario. Sirven para ver el diseño, no para publicar. Reemplazar por
  fotografía real de eventos manteniendo los mismos nombres de archivo.
- **Contacto**: `hola@byp.events` y el teléfono son de relleno. El mismo
  correo está en `main.js` como `DESTINO`.
- **Redes**: Instagram, LinkedIn y WhatsApp apuntan a `#`.
- **Trabajo**: los cuatro proyectos son genéricos. No son clientes reales.
- **Rider**: la lista de equipo es estándar, no sé qué tienen propio.
- **Minuto a minuto**: es un ejemplo, no un evento real.

## Formulario

No hay backend. Al enviar se arma un `mailto:` con los campos y se abre el
cliente de correo. Si más adelante se quiere recibir los mensajes de verdad,
sirve cualquier servicio de formularios (Formspree, Basin) cambiando el
`submit` en `main.js`.

## Accesibilidad

Navegación por teclado, foco visible, marcado semántico y soporte de
`prefers-reduced-motion` (con movimiento reducido no hay loader, ni parallax,
ni reveals).
