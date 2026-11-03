@echo off
echo ==============================================
echo Compilando UniHorario para Google Play / Android
echo ==============================================

call npm.cmd run build
if %ERRORLEVEL% NEQ 0 (
    echo Error al compilar el proyecto web.
    pause
    exit /b %ERRORLEVEL%
)

echo Sincronizando con Android...
call npx.cmd cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Error al sincronizar con Android.
    pause
    exit /b %ERRORLEVEL%
)

echo Abriendo en Android Studio...
call npx.cmd cap open android

echo ==============================================
echo Proceso completado. Puedes generar el .aab en Android Studio:
echo Build ^> Generate Signed Bundle / APK
echo ==============================================
pause
