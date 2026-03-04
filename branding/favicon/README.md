# Favicon files

The favicon files belong in the **`/static/`** directory of the repository root,
not inside this `branding/favicon/` folder. Place your source artwork here and
export/copy the final files to `/static/`.

## Required files and deployment paths

| Source file (this folder)      | Deploy to (`/static/`)           | Size        | Notes                                            |
|--------------------------------|----------------------------------|-------------|--------------------------------------------------|
| `favicon-source.svg`           | `static/favicon.ico`             | 16, 32, 48 px multi-size ICO | Use a tool like `sharp`, `Inkscape`, or `realfavicongenerator.net` |
| `favicon-16.png`               | `static/favicon-16.png`          | 16 × 16 px  | Optional; modern browsers prefer `favicon.ico`  |
| `favicon-32.png`               | `static/favicon-32.png`          | 32 × 32 px  | Referenced by `<link rel="icon" sizes="32x32">` |
| `apple-touch-icon.png`         | `static/apple-touch-icon.png`    | 180 × 180 px| iOS home screen; referenced by `<link rel="apple-touch-icon">` |
| `favicon-source.svg`           | `static/favicon.svg`             | SVG (any)   | Used by browsers that support SVG favicons (Chrome 80+, Firefox) |

## HTML `<head>` snippet

Add these lines to the `<head>` of **every** HTML page:

```html
<link rel="icon" type="image/x-icon"   href="/static/favicon.ico" />
<link rel="icon" type="image/svg+xml"  href="/static/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180"    href="/static/apple-touch-icon.png" />
```

## How to generate the ICO

Using `sharp` (Node.js):

```bash
npx sharp-cli -i branding/favicon/favicon-source.svg -o static/favicon.ico \
  --resize 48 --format ico
```

Or use the free online tool at <https://realfavicongenerator.net>.
