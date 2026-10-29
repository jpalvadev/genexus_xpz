# 04: Contracción y pin del contrato tri-estado

**What to build:** El contrato tri-estado queda cerrado y pinneado: el valor inválido se
rechaza con copy español end to end, y nada del mundo booleano sobrevive en el feature. El
usuario que envía una respuesta que no es `Sí`, `No` ni `N/A` ve
*"Las respuestas de la Revisión de Seguridad deben ser Sí, No o N/A"*, evaluada **antes** de
la regla de obligatoriedad, tanto en el frontend como —si el frontend lo deja pasar— en el
backend, como 400 con cuerpo `ErrorResponse` (nunca un `ValidationProblemDetails` del
framework). El feature OPS ya no tiene ni un solo `bool?` de Revisión, ni código muerto del
camino anterior.

**Blocked by:** 03 (el barrido dejó sin llamantes la forma booleana).

**Status:** ready-for-agent

- [ ] Regla de valor fuera del set vigente en el backend, evaluada antes de la de
      obligatoriedad, con la cadena de "primera violación" intacta para el resto de reglas.
- [ ] Espejo zod con el mismo mensaje español y el mismo orden; test de la regla por
      valor inválido y test de que el mensaje de obligatoriedad no cambió.
- [ ] Check 400 de valor inválido agregado al barrido de paridad en el estilo `check()` de
      la casa, y `spanish-visible-copy-check.sh` verde con el literal nuevo.
- [ ] Sin restos del contrato booleano: ni propiedades, ni cadenas de respuestas, ni
      helpers de conversión muertos; el checkbox del Observador (*Estado*, elegibilidad)
      sigue siendo booleano y no se toca.
- [ ] Grilla, export Excel y filtros Gridify sin cambios verificables (los doce campos no
      aparecen en ninguno).
- [ ] Pasada de cierre en una sola bota del harness (recapture de fixtures, los cuatro
      pin scripts y los spot checks de wire), suite completa verde en el push de `master`,
      integración mergeada a `master` y rama borrada en `origin` y local.
