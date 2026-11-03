# UniHorario - Planificador y Simulador de Horarios Universitarios

Una aplicación web moderna y multiplataforma (Web y Android / Google Play) diseñada para resolver el problema clásico de los estudiantes universitarios: **probar diferentes combinaciones de horarios y comisiones para elegir la mejor opción sin choques de materias**.

Basada en el diseño visual moderno de la imagen de referencia: tema oscuro elegante, bloques de colores vivos con degradados sutiles, multidía agrupado, visualización de horas de cursada y huecos libres.

---

## Características Principales

1. **Mi Horario Semanal (Vista Visual Interactiva)**:
   - Vista semanal de Lunes a Sábado (y Domingo opcional) desde las 07:00 hasta las 20:00 (ajustable hasta las 23:00).
   - Bloques con nombres de materias, horarios en formato badge, aula y profesor asignado.
   - Detección inmediata de choques con aviso rojo parpadeante e indicador numérico.
   - Soporte para materias multidía (ej. Martes, Jueves y Viernes a la misma hora).
   - Botón directo para eliminar cada bloque (ícono de papelera como en la imagen de muestra).
   - Clic directo en cualquier celda horaria para programar una materia en ese día y hora.

2. **Simulador de Semestre Inteligente (Generador Automático de Combinaciones)**:
   - Resuelve automáticamente la combinatoria de comisiones entre todas las materias seleccionadas.
   - Filtros inteligentes:
     - Preferencia de turno: Mañanas, Tardes o Cualquiera.
     - Día libre preferido: Tener los Viernes, Lunes o Sábados libres.
     - Horarios compactos (con menos horas muertas / huecos).
     - Filtro estricto: Solo horarios con 0 choques.
   - Previsualización en tiempo real y posibilidad de aplicar la combinación seleccionada o guardarla como una nueva opción alternativa.

3. **Catálogo de Materias y Comisiones**:
   - Administra asignaturas con sus respectivos códigos y colores identificadores.
   - Registra múltiples comisiones o turnos para cada materia (ej. Turno Mañana vs Turno Tarde) con diferentes profesores y aulas.

4. **Comparador de Opciones y Borradores (Plan A vs Plan B)**:
   - Crea y duplica múltiples opciones de horario (por ejemplo: *"Plan A - Mañana"*, *"Plan B - Viernes Libre"*, etc.).
   - Muestra métricas comparativas: Total de horas semanales, días de cursada, días libres y horas de hueco.

5. **Exportación e Integración**:
   - **Descargar como Foto (PNG)**: Genera una imagen en alta resolución para fondo de pantalla o compartir en WhatsApp.
   - **Google Calendar (.ics)**: Exporta el archivo de calendario estándar para importar tus clases a Google Calendar en 1 clic.
   - **Copia de Seguridad JSON**: Guarda o importa tus horarios entre computadoras o celulares.

---

## Cómo Ejecutar en Desarrollo

```bash
# Iniciar el servidor local de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Cómo Publicar en Google Play (Android)

La aplicación ya tiene **Capacitor** configurado con la plataforma Android nativa en la carpeta `android/`.

### Opción Rápida (1 Clic)
Haz doble clic en el archivo:
```
build-android.bat
```

### Paso a Paso Manual:

1. **Compilar los archivos web:**
   ```bash
   npm run build
   ```

2. **Sincronizar con el proyecto de Android:**
   ```bash
   npx cap sync android
   ```

3. **Abrir en Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Generar el archivo firmado para Google Play:**
   - En Android Studio, ve al menú: **Build** → **Generate Signed Bundle / APK...**
   - Selecciona **Android App Bundle (.aab)**.
   - Sigue el asistente para firmar la aplicación con tu Keystore.
   - Se creará el archivo `app-release.aab`.

5. **Subir a Google Play Console:**
   - Entra a [Google Play Console](https://play.google.com/console).
   - Crea tu ficha de aplicación (título, descripción, capturas de pantalla).
   - Sube el archivo `app-release.aab` en la pista de Producción o Pruebas Internas.
