# ForHabits

App móvil para desarrollar hábitos beneficiosos y eliminar los malos, basada en
**Hábitos Atómicos** de James Clear. Construida con React Native + Expo
(compatible con App Store y Play Store).

> *"What is not defined cannot be measured. What is not measured cannot be
> improved. What is not improved always degrades."* — William Thomson Kelvin

## Funcionalidades

### 1. Records
- Registra hábitos con nombre, emoticono y periodicidad (todos los días o días
  concretos de la semana).
- Calendario mensual estilo iPhone con scroll infinito: cada día muestra los
  emoticonos de los hábitos completados.
- Botón **Today**: un toque te lleva al mes actual, otro toque resalta el día de hoy.
- Botón **Habits**: leyenda con el emoticono, nombre y periodicidad (ℹ️) de cada hábito.
- **DailyLog**: cada día a las 21:00 llega una notificación
  `DailyLog | dd/mm/aaaa` con un formulario para marcar cada hábito como
  *Completed* / *Not completed*. También puedes tocar cualquier día pasado del
  calendario para registrarlo.

### 2. Apply
- Escribe (o busca entre tus hábitos registrados) el hábito que quieres trabajar.
- El asesor, con el conocimiento del libro, te da estrategias concretas para:
  1. **Hacerlo obvio** (señal)
  2. **Hacerlo atractivo** (anhelo)
  3. **Hacerlo sencillo** (respuesta)
  4. **Hacerlo satisfactorio** (recompensa)
- Modo *Eliminar hábito*: usa las leyes inversas (invisible, poco atractivo,
  difícil, insatisfactorio).

### 3. Premium

Pestaña **Premium**. Sin claves configuradas funciona en local: el botón *Activar
Premium* desbloquea en el dispositivo y los rivales de los retos son simulados.
En cuanto se rellenan las variables de `.env.example` se activan solos el pago real
(Stripe Checkout) y la clasificación con gente real (Supabase). Los pasos exactos
están en [SETUP.md](SETUP.md).

- **Bolsa de retos**: entra en un reto del catálogo (7–30 días) vinculándolo a uno
  de tus hábitos y compite en una clasificación. Con Supabase configurado los
  rivales son personas reales; sin configurar son **simulados en el propio
  dispositivo**, etiquetados `(demo)` y con aviso en la tabla.
- **Podio de rachas**: tus hábitos ordenados por racha actual, con medallas para el
  top 3 y la mejor racha histórica de cada uno.
- **Gráficas de seguimiento**: cumplimiento diario (7/30/90 días), por hábito y por
  día de la semana. Los días sin hábitos programados no cuentan como 0 %.

## Desarrollo

```bash
npm install
npx expo start        # escanea el QR con Expo Go
npm run web           # vista previa en el navegador
npm run check         # tipos + self-check de la lógica premium
```

## Estructura

```
App.tsx                  # raíz: intro + navegación + notificaciones
src/
  knowledge.ts           # base de conocimiento de las 4 leyes (del libro)
  advisor.ts             # motor asesor (rellena plantillas con tu hábito)
  store.tsx              # estado global + persistencia (AsyncStorage)
  notifications.ts       # DailyLog diario (expo-notifications)
  theme.ts, types.ts
  screens/               # Intro, Main (Records | Apply), Records, Apply
  components/            # Typewriter, MonthCalendar, HabitForm, DailyLogSheet…
```

## Pendiente
- Logo definitivo (en diseño).
- Publicación en App Store / Play Store (EAS Build).
- Futuras funcionalidades de pago.
