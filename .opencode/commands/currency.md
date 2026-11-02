---
description: Añade una moneda a currencyMetadata a partir de un país o código
---

Añade una moneda a `currencyMetadata` en `src/components/Table.astro`.

Argumento recibido: `$ARGUMENTS`

Si el argumento está vacío (se ejecutó el comando sin parámetro), no hagas
nada: no leas archivos, no edites nada, no preguntes nada y no respondas nada.

Si hay argumento:

1. Interprétalo como un código ISO 4217 (p. ej. `BRL`) o como el nombre de un
   país en español (p. ej. `Brasil`). Si es un país, deduce su moneda oficial;
   si es un código, deduce el país y el nombre de la moneda en español.
2. Revisa el objeto `currencyMetadata` de `src/components/Table.astro`. Si el
   código ya existe, no dupliques la entrada: dilo brevemente y termina.
3. Si no existe, inserta una entrada nueva con la misma forma y estilo que las
   existentes (tabulaciones, comas finales, orden similar):

   ```js
   BRL: {
       flag: "🇧🇷",
       name: "Real brasileño",
       country: "Brasil",
       continent: "america",
   },
   ```

   - `flag`: emoji de la bandera del país (para la UE, `🇪🇺`).
   - `name`: nombre de la moneda en español, con el mismo estilo que las demás
     entradas (`Peso colombiano`, `Won surcoreano`, `Yen japonés`, ...).
   - `country`: nombre del país en español.
   - `continent`: `america`, `europa` o `asia`; la cuadrícula de cotizaciones
     agrupa por este campo.

4. No modifiques nada más del proyecto.
5. Verifica con `pnpm build`.
