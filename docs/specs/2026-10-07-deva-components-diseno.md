# deva-components: diseño (DEVA-107)

Fecha: 7/10/2026. Se basa en el relevamiento de los autocompletados de DEVA, el portal y Nexus, hecho por 3 agentes en sólo lectura. El detalle sitio por sitio está en el ticket.

## Qué encontró el relevamiento

| App | Base | Autocompletados reales | Cómo busca |
|---|---|---|---|
| DEVA 1.3.8 | React 18, MUI 6, Formik, jest | 43 sitios con 36 Autocomplete de MUI. El que más aparece es estudio (17), seguido de planilla (7), obra social (4), paciente (3) y bioquímico (3) | Casi todo en el cliente: baja la lista entera una vez y la cachea en un Context |
| Portal 1.3.8 | React 19, Tailwind, combobox propio, vitest | 4: estudio, médico, diagnóstico y paciente por DNI, todos en `PatientEntryForm` | En el servidor, con `?q=` en Nucleus `/ward/*` |
| Nexus 1.2.2 | React 19, shadcn Select, sin tests en el frontend | 0. Sólo hay selects no buscables: plan, red, empresa y laboratorio | Listas completas |

**Problemas que confirman la decisión:**

- **Estudio.**
  - Cuatro pantallas recuperan el estudio separando la etiqueta `'code - name'` y buscando por `code`: CreateAnalysesForm, EquipmentConfigModal, AnalysisMappingSection y StudiesAutoComplete.
  - Cuando el código se repite, toman el ítem equivocado. analysesEdit, con la misma fuente de datos, lo resuelve bien por id.
- **Obra social:** hay cuatro variantes distintas. Una de ellas, la de presupuesto, es una lista escrita a mano.
- **Diagnóstico:** Nueva orden guarda el id. Orden digital guarda el code.
- **Médico y bioquímico:** comparan por etiqueta. Si no encuentran coincidencia, guardan el texto tipeado.
- **Mientras se tipea:** el genérico `AutoComple` deja `undefined` en obra social, diagnóstico y bioquímico.
- **Planillas:** en un lugar se comparan por code, en otro por id y en otro por referencia.

**Bug en producción del portal:**
- `GET /ward/studies` de Nucleus no excluye los sub-ítems sintéticos de los compuestos. El piso puede pedir, por ejemplo, un componente del Hemograma como estudio suelto.
- El criterio real de DEVA no es el prefijo "1515". Es la regex `^151\d{3,}` sobre el code como texto (`compositeAnalysis.dao.ts:239`). Cubre 1515, 1516, 1517 y 151515/151525/151535, y deja afuera el 151 real, Ceruloplasmina.

## Diseño del paquete

Repo público nuevo `sbelbey/deva-components`, que se instala con un tag fijo, igual que `deva-design`. Tiene React como `peerDependency` (`>=18`) y ninguna librería de UI.

```
src/
  core/
    useRemoteSearch.ts     debounce, descarte de respuestas viejas, loading, error, "sin resultados"
    useLocalSearch.ts      filtro en memoria sobre una lista ya cargada
    normalize.ts           sin acentos, sin puntos, minúsculas, multi-término
  study/      useStudySearch.ts    study.ts (isCompoundSubItemCode, studyLabel, matchStudy, findByExactCode)
  doctor/     useDoctorSearch.ts   doctor.ts
  diagnosis/  useDiagnosisSearch.ts
  insurance/  useInsuranceSearch.ts
  patient/    usePatientSearch.ts  patient.ts (parseDniScan: escaneo con '!')
  biochemist/ useBiochemistSearch.ts
  worksheet/  useWorksheetSearch.ts
```

- **Un hook por clase de dato, cada uno en su carpeta.** Cada uno usa el motor común (`core/`) y suma sus propias reglas: qué campos busca, cómo arma la etiqueta y qué excluye. Si falla la búsqueda de médicos, se mira `doctor/`.
- **Fuente de datos inyectada:** cada hook recibe `{ items }` (lista ya cargada, como hace DEVA) o `{ search: (q) => Promise<T[]> }` (servidor, como hacen el portal y Nucleus). El paquete no sabe de axios ni de rutas.
- **Opción normalizada:** `{ id, label, secondary?, raw }`. Siempre se compara por `id`, nunca por etiqueta ni por code.
- **Lo que devuelve cada hook:** `{ inputValue, setInputValue, options, loading, error, empty, selectById, findByExactCode? }`, listo para conectar a la piel.
- **Reglas por entidad:**
  - Estudio: busca por code, nombre, abreviatura y atajo de perfil. Excluye los sub-ítems salvo con `includeSubItems`. Puede mostrar perfiles. Con Enter resuelve por code exacto.
  - Diagnóstico: busca por code ignorando los puntos y por nombre.
  - Médico: busca por apellido, nombre y matrícula, con varios términos (hoy "Gomez Juan" no encuentra nada en el portal).
  - Paciente: busca por DNI y entiende el escaneo con '!'.
  - Obra social: muestra las suspendidas marcadas.
- **Funciones puras exportadas y testeadas aparte.** Así DEVA backend y Nucleus pueden importar, por ejemplo, `isCompoundSubItemCode`.
- **Tests:** vitest con React Testing Library. Primero las funciones puras y después los hooks con fuentes falsas.

## Pieles por app

- **DEVA:** `src/renderer/components/search/` con `StudyAutocomplete`, `DoctorAutocomplete`, etc., sobre MUI `Autocomplete`. Funcionan con Formik y con estado local. Las props son `value` (id), `onChange(id, raw)`, `label`, `disabled`, `error` y `helperText`. El texto de "sin resultados" va en español.
- **Portal:** se adapta el `Autocomplete.tsx` propio para usar los hooks: `StudyAutocomplete`, `DoctorAutocomplete` y `DiagnosisAutocomplete`, con las mismas props.
- **Nexus:** no tiene autocompletados de datos. Por ahora no se toca, y se anota como candidato el select buscable de empresa y laboratorio.

## Fuera de alcance (tickets aparte)

- `POST /medical-orders/search` arma un `RegExp` sin escapar.
- Pacientes, médicos y obras sociales se buscan sin acotar por laboratorio.
- El catálogo de derivación busca sólo por `externalName`.
- Componentes no relacionados con la búsqueda: fecha, modo oscuro, lockup y estados vacíos.
