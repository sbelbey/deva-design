# deva-components: decisión (DEVA-107)

Fecha: 7/10/2026. Esto es lo que va en la descripción de DEVA-107 en Jira.

## Decisión: opción A, paquete compartido

Un paquete nuevo, `deva-components`, en un repo propio al lado de `deva-design`. Se instala igual que `deva-design`: desde GitHub, con un tag fijo.

- **La lógica vive una sola vez en el paquete**, como hooks sin estilo: `usePatientSearch`, `useDoctorSearch`, `useStudySearch`, etc. Cada hook resuelve:
  - la búsqueda;
  - el formato de la opción;
  - la comparación por `_id`;
  - la carga y el "sin resultados".

  Los bugs se arreglan ahí, una vez, para todas las apps.
- **Cada app pone sólo la piel:** DEVA con MUI; el portal y Nexus con Tailwind/shadcn. Los componentes tienen el mismo nombre y las mismas props en todas las apps: `value`, `onChange`, `label`, `disabled`, `error` y `helperText`.
- Los colores salen de `deva-design`.
- Se descartó la opción B, un componente escrito dentro de cada app, porque duplicaba la lógica, que es donde aparecen los bugs.

## Orden propuesto

1. Armar el paquete y el primer hook con sus tests. Probablemente `useStudySearch`, que es el que más bugs tuvo.
2. Hacer las pieles en DEVA y en el portal, y migrar las pantallas que usan ese buscador.
3. Seguir con el resto de los autocompletes, uno por uno, migrando cada pantalla cuando se toque.
4. Después, los otros componentes que se repiten entre apps: selector de fecha, selector de modo oscuro, lockup "logo | Producto" y estados vacíos.

## A definir al arrancar

- Cómo recibe cada hook la función que busca en el servidor, porque DEVA consulta su backend local y el portal y Nexus consultan Nucleus. Propuesta: que el hook reciba una función `search(texto)` y que cada app pase la suya.
