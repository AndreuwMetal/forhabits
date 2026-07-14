# Compartir ForHabits en iPhones (gratis, vía Expo Go)

Distribución gratuita a móviles concretos usando **Expo Go + EAS Update**.
Genera un QR permanente que se abre en la app Expo Go, sin tu PC encendido.

## Requisitos (una sola vez)
1. Cuenta gratuita en https://expo.dev
2. Quien vaya a usar la app instala **Expo Go** gratis:
   - iPhone: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"

## Publicar (en tu terminal WSL, dentro de ~/forhabits)
```bash
npx eas-cli login              # tus credenciales de expo.dev (login interactivo)
npx eas-cli init               # crea el proyecto y rellena el projectId en app.json
npx eas-cli update:configure   # configura las actualizaciones OTA
npx eas-cli update --branch preview --message "Primera version"
```

## Compartir
- Tras `eas update`, entra en https://expo.dev → proyecto **forhabits** → pestaña
  **Updates** → abre el update → verás un **QR**.
- Quien tenga Expo Go escanea ese QR (iPhone: con la cámara; Android: desde Expo Go)
  y se abre ForHabits.
- El QR es permanente: mientras no borres el proyecto, la app sigue accesible.

## Actualizar la app más adelante
Cada vez que cambies algo, vuelve a publicar y todos reciben la nueva versión:
```bash
npx eas-cli update --branch preview --message "Que he cambiado"
```

## Limitaciones dentro de Expo Go (a tener en cuenta)
- La app se abre "dentro" de Expo Go, no como app propia con su icono en la pantalla.
- Las notificaciones locales (DailyLog, análisis) funcionan, pero los **botones de
  acción** de la notificación pueden no aparecer en Expo Go. Para eso haría falta un
  build propio (development build), que en iPhone requiere cuenta Apple de pago.
- Para una app 100% nativa e independiente en iPhone: Apple Developer (99 $/año) +
  TestFlight o distribución ad-hoc. Ver STORE.md / eas.json.
