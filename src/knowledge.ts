// Base de conocimiento del motor asesor de hábitos.
// Contenido basado en "Hábitos Atómicos" de James Clear, organizado según
// las Cuatro Leyes del Cambio de Conducta.
//
// Uso: sustituye el placeholder {habit} en cada "template" por el hábito
// que el usuario quiere adquirir (ej. "correr", "leer 10 páginas", "meditar").

export interface Strategy {
  id: string; // slug corto
  title: string; // nombre de la estrategia (ej: "Intención de implementación")
  concept: string; // explicación breve del concepto según el libro (2-3 frases)
  template: string; // plantilla aplicable con el placeholder {habit}
  example: string; // ejemplo concreto del libro o derivado de él
}

export interface Law {
  id: "obvious" | "attractive" | "easy" | "satisfying";
  number: number;
  titleEs: string; // "Hacerlo obvio", etc.
  summary: string; // resumen de la ley en 2-3 frases
  strategies: Strategy[]; // 4-6 estrategias por ley
}

export const LAWS: Law[] = [
  {
    id: "obvious",
    number: 1,
    titleEs: "Hacerlo obvio",
    summary:
      "Todo hábito empieza con una señal, y solemos dejar de notar las señales que ya son parte de nuestra rutina. La Primera Ley consiste en tomar conciencia de tus hábitos actuales y diseñar señales claras y visibles que desencadenen el nuevo hábito en el momento y lugar correctos.",
    strategies: [
      {
        id: "registro-habitos",
        title: "Registro de hábitos",
        concept:
          "Antes de poder cambiar un hábito necesitas ser consciente de él, porque una vez que un hábito se vuelve automático dejamos de prestarle atención. El Registro de hábitos es un ejercicio para observar tu conducta actual sin juzgarla, marcando cada acción como buena (+), mala (-) o neutral (=).",
        template:
          "Anota cada vez que hagas (o dejes de hacer) {habit} en tu Registro de Hábitos con un signo (+), (-) o (=). Hazlo sin criticarte, solo para darte cuenta de cuándo y en qué contexto ocurre.",
        example:
          "Durante esta semana, junto a {habit} anota un signo (+) si te acerca a la persona que quieres ser, (-) si te aleja, o (=) si es neutral, sin juzgarte. Revisa el registro el domingo para detectar patrones antes de cambiar nada.",
      },
      {
        id: "intencion-implementacion",
        title: "Intención de implementación",
        concept:
          "Un plan que especifica de antemano cuándo y dónde vas a actuar duplica o triplica las probabilidades de cumplirlo, según estudios citados en el libro. La motivación vaga se transforma en un plan de acción concreto al fijar tiempo y lugar.",
        template: "Decide ahora cuándo y dónde: haz {habit} a las [HORA] en [LUGAR].",
        example:
          "Escribe en tu agenda: 'Haré {habit} el lunes a las 7:00 a. m. en la sala', igual que el estudio de ejercicio en Gran Bretaña. Repite la frase cada domingo para fijar la semana siguiente.",
      },
      {
        id: "apilamiento-habitos",
        title: "Apilamiento de hábitos (habit stacking)",
        concept:
          "En vez de ligar el nuevo hábito a un horario, lo vinculas a un hábito que ya realizas todos los días sin fallar. Cada acción se convierte en la señal que desencadena la siguiente, aprovechando cadenas de conducta que ya existen.",
        template: "Después de [HÁBITO ACTUAL], haz {habit} de inmediato, sin dejar espacio para dudarlo.",
        example:
          "Identifica tu hábito más estable (servir el café, cerrar la laptop) y encádealo así: 'Después de [ese hábito], hago {habit}'. Practícalo tres días seguidos hasta que sientas el enlace automático.",
      },
      {
        id: "diseno-ambiente",
        title: "Diseño del ambiente",
        concept:
          "El ambiente es la mano invisible que moldea el comportamiento: notamos y repetimos las señales que son evidentes y accesibles, e ignoramos las que están escondidas. Rediseñar el espacio para que la señal del hábito deseado salte a la vista facilita la acción sin necesitar más motivación.",
        template:
          "Coloca [OBJETO O SEÑAL relacionado con {habit}] bien a la vista en [LUGAR], para que se convierta en el recordatorio obvio de hacer {habit}.",
        example:
          "Pon el objeto que activa {habit} (el libro, el tapete, la botella de agua) justo en el centro de la mesa o la entrada de tu casa, como el frutero de manzanas del libro. Quita de la vista cualquier cosa que te distraiga de esa señal.",
      },
      {
        id: "un-lugar-un-uso",
        title: "Un espacio, un uso (el contexto es la señal)",
        concept:
          "Con el tiempo, un hábito se asocia no solo a una señal aislada sino a todo el contexto que lo rodea. Reservar un espacio exclusivo para una sola actividad ayuda a que ese contexto se convierta en la señal automática del hábito.",
        template:
          "Reserva [LUGAR/RINCÓN/MOMENTO] exclusivamente para {habit} y no lo uses para nada más.",
        example:
          "Elige una silla, un escritorio o una franja horaria y úsala solo para {habit}, nunca para otra cosa. En un par de semanas, sentarte ahí (o llegar esa hora) bastará para que tu cuerpo sepa que toca {habit}.",
      },
    ],
  },
  {
    id: "attractive",
    number: 2,
    titleEs: "Hacerlo atractivo",
    summary:
      "Los hábitos son un circuito impulsado por la dopamina: cuanto más atractiva es una oportunidad, más ganas tenemos de actuar, porque es la anticipación de la recompensa —no su obtención— lo que nos pone en marcha. La Segunda Ley consiste en aumentar el deseo de realizar el hábito.",
    strategies: [
      {
        id: "tentacion-combinada",
        title: "Tentación combinada (temptation bundling)",
        concept:
          "Se basa en el Principio de Premack: las conductas que más te apetecen pueden reforzar las que menos te apetecen. Al vincular algo que quieres hacer con algo que necesitas hacer, tomas prestado el atractivo de lo primero para lo segundo.",
        template:
          "Permítete [ACTIVIDAD QUE TE ENCANTA] únicamente mientras haces {habit}, nunca fuera de ese momento.",
        example:
          "Guarda tu pódcast o serie favorita para escucharla o verla solo mientras haces {habit}, como el estudiante que veía Netflix únicamente pedaleando. Corta el acceso a esa actividad en cualquier otro momento del día.",
      },
      {
        id: "unirse-tribu",
        title: "Unirse a una tribu",
        concept:
          "Imitamos los hábitos del grupo cercano, del grupo numeroso y de la gente con estatus, porque pertenecer es uno de los deseos más profundos del ser humano. Un hábito se vuelve mucho más atractivo cuando es la conducta normal del grupo al que perteneces.",
        template:
          "Únete a un grupo, clase o comunidad —por ejemplo [GRUPO/CLUB/COMUNIDAD ONLINE]— donde {habit} sea la conducta normal y compartida por sus integrantes.",
        example:
          "Busca hoy mismo un club, clase o grupo online donde {habit} sea la conducta normal, como hace Nerd Fitness con el ejercicio. Únete esta semana y asiste a tu primera sesión antes de que se enfríe la decisión.",
      },
      {
        id: "ritual-motivacion",
        title: "Ritual de motivación",
        concept:
          "Puedes reprogramar tu cerebro para disfrutar hábitos difíciles asociándolos con algo que ya te resulta placentero justo antes de realizarlos. Con la repetición, esa pequeña rutina se convierte en la señal que dispara el estado de ánimo adecuado.",
        template:
          "Justo antes de {habit}, haz siempre [ACCIÓN PLACENTERA: respirar hondo y sonreír, poner una canción concreta, tomar tu bebida favorita], para asociar {habit} con una sensación positiva.",
        example:
          "Antes de {habit}, repite siempre los mismos dos o tres pasos: la misma canción, una respiración profunda, una sonrisa, como el escritor que se concentra al ponerse los audífonos. Mantén el ritual idéntico durante dos semanas para que el cerebro lo asocie con {habit}.",
      },
      {
        id: "replanteamiento-mental",
        title: "Replanteamiento mental (beneficios, no obligaciones)",
        concept:
          "Cada hábito tiene un anhelo superficial y un motivo más profundo; puedes hacer que un hábito sea más atractivo si resaltas sus beneficios en vez de sus costos, cambiando 'tengo que' por 'tengo la oportunidad de'.",
        template:
          "Cambia 'tengo que {habit}' por 'tengo la oportunidad de {habit}' cada vez que lo pienses o lo digas, recordando el beneficio real que te va a dar.",
        example:
          "La próxima vez que pienses 'tengo que {habit}', dilo en voz alta como 'tengo la oportunidad de {habit}', igual que 'Debo correr' se convirtió en 'Es hora de ganar resistencia'. Repite el cambio de frase cada vez que sientas resistencia.",
      },
    ],
  },
  {
    id: "easy",
    number: 3,
    titleEs: "Hacerlo sencillo",
    summary:
      "El comportamiento humano sigue la ley del menor esfuerzo: entre dos opciones, elegimos la que requiere menos trabajo. La Tercera Ley consiste en reducir la fricción de los buenos hábitos hasta hacerlos tan fáciles que resulte difícil no hacerlos, priorizando la repetición sobre la perfección.",
    strategies: [
      {
        id: "regla-dos-minutos",
        title: "Regla de los dos minutos",
        concept:
          "Cualquier hábito puede reducirse a una versión de dos minutos o menos. La meta no es hacer la tarea completa, sino dominar el hábito de 'presentarte' y cruzar el umbral de empezar; el resto puede venir después.",
        template:
          "Reduce {habit} a una versión de 2 minutos —por ejemplo [ACCIÓN INICIAL MUY PEQUEÑA]— y hazla sin excusas.",
        example:
          "Si {habit} es correr 3 km, empieza solo poniéndote los tenis; si es leer, lee una sola página. Comprométete únicamente a esos dos minutos y deja que seguir sea opcional.",
      },
      {
        id: "reducir-friccion",
        title: "Reducir la fricción y preparar el ambiente",
        concept:
          "Optimizar el ambiente para que el buen hábito requiera el menor número de pasos posible aumenta drásticamente las probabilidades de realizarlo. Preparar con antelación el espacio o los materiales elimina obstáculos antes de que aparezcan.",
        template:
          "Deja listo [MATERIAL/ROPA/HERRAMIENTA] en [LUGAR] desde [MOMENTO ANTERIOR], para que no haya nada entre tú y {habit}.",
        example:
          "La noche anterior, deja lista la ropa, el material o las herramientas de {habit} justo donde las veas al despertar. Elimina cualquier paso extra que hoy te haga posponerlo.",
      },
      {
        id: "momento-decisivo",
        title: "Dominar el momento decisivo",
        concept:
          "Cada día hay unos pocos momentos —caminos que se bifurcan— que determinan el resto de tus horas. Identificar y controlar ese primer pequeño paso (el 'taxi', no el 'gimnasio') encamina el resto de la conducta de forma casi automática.",
        template:
          "Identifica el momento decisivo que precede a {habit} —por ejemplo [ACCIÓN DESENCADENANTE: ponerte la ropa de deporte, sacar el cuaderno, cerrar la laptop]— y da siempre ese primer paso.",
        example:
          "Define cuál es 'el taxi' de {habit} —ponerte la ropa de deporte, sacar el cuaderno, abrir la app— y da ese primer paso apenas te levantes, como hacía Twyla Tharp subiéndose al taxi. Una vez dado ese paso, deja que el resto fluya solo.",
      },
      {
        id: "automatizar-habito",
        title: "Automatizar el hábito",
        concept:
          "Algunas decisiones de una sola vez —comprar cierto equipo, activar una app, programar un recordatorio— generan beneficios una y otra vez sin requerir fuerza de voluntad diaria. La tecnología puede volver un buen hábito prácticamente inevitable.",
        template:
          "Automatiza {habit} con una decisión de una sola vez: [ACCIÓN, ej. programar una alarma o recordatorio, contratar/comprar algo, configurar un pago o envío automático].",
        example:
          "Configura hoy una alarma, una suscripción o un pago automático que haga que {habit} ocurra sin que tengas que decidirlo, como un plan de ahorro automático. Revisa la configuración una sola vez y olvídate de decidir cada día.",
      },
      {
        id: "practica-sobre-perfeccion",
        title: "Repetición antes que perfección",
        concept:
          "Es más importante ponerte en marcha y actuar que planear el sistema perfecto. Un hábito debe estandarizarse (repetirse de forma simple y consistente) antes de poder optimizarse; la frecuencia de la práctica importa más que la calidad inicial.",
        template:
          "Haz {habit} de la forma más simple posible hoy; tu único objetivo es repetirlo muchas veces, sin buscar hacerlo perfecto todavía.",
        example:
          "Haz {habit} hoy de la forma más simple posible, aunque salga imperfecto, como los estudiantes de fotografía que tomaron muchas fotos mediocres y mejoraron más rápido. Repite mañana sin detenerte a evaluar la calidad.",
      },
    ],
  },
  {
    id: "satisfying",
    number: 4,
    titleEs: "Hacerlo satisfactorio",
    summary:
      "La regla cardinal del cambio de conducta es: lo que se recompensa de inmediato se repite, lo que se castiga se evita. Como el cerebro prioriza la gratificación inmediata, la Cuarta Ley consiste en añadir una sensación de éxito justo al terminar el hábito, para que quieras repetirlo.",
    strategies: [
      {
        id: "refuerzo-inmediato",
        title: "Refuerzo inmediato",
        concept:
          "Un hábito necesita sentirse exitoso de inmediato, aunque sea de forma modesta, para que el cerebro registre que vale la pena repetirlo. Una pequeña recompensa alineada con tu identidad deseada ayuda a sostener el hábito mientras llegan los beneficios a largo plazo.",
        template:
          "Justo después de completar {habit}, date una pequeña recompensa inmediata y coherente con quien quieres ser, como [RECOMPENSA: un baño relajante, anotar el logro, un té especial].",
        example:
          "En cuanto termines {habit}, date un gusto pequeño e inmediato —un té especial, anotar el logro, un baño relajante— como el jabón perfumado que hizo agradable lavarse las manos. Elige una recompensa que refuerce, no que sabotee, tu meta.",
      },
      {
        id: "seguimiento-habitos",
        title: "Seguimiento de hábitos (habit tracker)",
        concept:
          "Llevar un registro visual del progreso —una X en el calendario, una cuenta que se acumula— hace que el hábito sea a la vez obvio, atractivo y satisfactorio, porque ver la cadena crecer motiva a no romperla.",
        template:
          "Lleva un registro visual de {habit}: marca una X en un calendario (o mueve una ficha/clip de un recipiente a otro) cada vez que lo completes, y mantén la cadena sin interrupciones.",
        example:
          "Consigue un calendario o una app y marca una X cada vez que completes {habit}, como el 'nunca romper la cadena' de Seinfeld. Cuelga el calendario donde lo veas todos los días para que la cadena visible te motive a seguir.",
      },
      {
        id: "nunca-fallar-dos-veces",
        title: "Nunca falles dos veces",
        concept:
          "La perfección no es el objetivo; lo que distingue a quienes tienen éxito es que, tras un fallo, se recuperan rápido. Perder un día es un accidente; perderlo dos veces seguidas es el inicio de un nuevo mal hábito.",
        template:
          "Si algún día no logras hacer {habit}, retómalo en la próxima ocasión posible: no dejes que falte dos veces seguidas.",
        example:
          "Si un día no logras hacer {habit}, retómalo sin falta al día siguiente, recordando la regla del libro: 'faltar una vez es un accidente, faltar dos es el inicio de un mal hábito'. No dejes que la culpa te haga saltarte un tercer día.",
      },
      {
        id: "socio-corresponsable",
        title: "Socio corresponsable",
        concept:
          "Saber que alguien está observando tu conducta añade un costo social inmediato a fallar, porque nos importa mucho lo que los demás piensan de nosotros. Un socio corresponsable convierte el progreso (o la falta de él) en algo visible para otra persona.",
        template:
          "Pídele a [PERSONA] que sea tu socio corresponsable para {habit}: cuéntale tu plan y acuerden que te pida cuentas cada [PERIODICIDAD].",
        example:
          "Pídele a un amigo o familiar que sea tu socio corresponsable de {habit} y acuerden que te escriba cada semana para preguntarte cómo vas, como Margaret Cho con su chiste diario. Comparte tu progreso real, incluso cuando falles.",
      },
      {
        id: "contrato-habitos",
        title: "Contrato de hábitos",
        concept:
          "Un contrato de hábitos es un acuerdo escrito o verbal donde defines el hábito que te comprometes a cumplir y la consecuencia si no lo haces, firmado junto con uno o dos testigos. Añade un costo social y a veces económico que hace doloroso incumplir de inmediato.",
        template:
          "Escribe un contrato de hábitos para {habit}: define el compromiso, una consecuencia clara si no lo cumples (ej. [CONSECUENCIA]), y fírmalo junto con [TESTIGO/SOCIO].",
        example:
          "Escribe un contrato breve donde te comprometas a {habit}, define una consecuencia si no lo cumples y fírmalo junto con un testigo, como hizo Bryan Harris con su esposa y su entrenador. Guarda el contrato en un lugar visible para recordarlo.",
      },
    ],
  },
];

// Versión inversa de las Cuatro Leyes: estrategias para ELIMINAR malos hábitos.
// Hacerlo invisible, poco atractivo, difícil e insatisfactorio.
export const INVERSE_LAWS: Law[] = [
  {
    id: "obvious",
    number: 1,
    titleEs: "Hacerlo invisible",
    summary:
      "Una vez que un hábito está grabado en el cerebro, es casi imposible olvidarlo del todo, así que la mejor defensa a largo plazo no es resistir la tentación sino reducir la exposición a las señales que la desencadenan.",
    strategies: [
      {
        id: "reducir-exposicion",
        title: "Reducir la exposición a la señal",
        concept:
          "El autocontrol es una estrategia de corto plazo: es más fácil evitar una tentación que resistirla una y otra vez. Eliminar o esconder la señal que dispara el mal hábito suele bastar para que el hábito completo se desvanezca.",
        template:
          "Elimina o esconde las señales que te llevan a {habit}: por ejemplo, [ACCIÓN: guardar el objeto fuera de la vista, desinstalar la app, no comprarlo].",
        example:
          "Guarda fuera de la vista, desinstala o deja de comprar lo que dispara {habit}, como dejar el teléfono en otra habitación para evitar revisarlo sin parar. Si no ves la señal, es mucho más difícil que actúes sobre {habit}.",
      },
      {
        id: "cambiar-contexto",
        title: "Cambiar de ambiente o contexto",
        concept:
          "Los hábitos se asocian con todo el contexto que los rodea, no solo con una señal aislada. Alejarte del ambiente donde sueles caer en el hábito —o rediseñarlo— te libera de tener que luchar constantemente contra las mismas señales.",
        template:
          "Evita los lugares, momentos o situaciones donde sueles caer en {habit}, o cambia ese entorno (otra ruta, otra habitación, otra rutina) para escapar de sus señales habituales.",
        example:
          "Cambia de ruta, de habitación o de rutina para alejarte del entorno donde sueles caer en {habit}, como los soldados en Vietnam que dejaron la heroína al cambiar de ambiente por completo. Sustituye ese contexto por uno nuevo sin las señales habituales.",
      },
    ],
  },
  {
    id: "attractive",
    number: 2,
    titleEs: "Hacerlo poco atractivo",
    summary:
      "Cada mal hábito tiene un motivo profundo que en el momento parece resolver un problema. Si consigues replantear la manera en que percibes ese hábito y resaltas sus verdaderos costos, dejará de resultarte atractivo.",
    strategies: [
      {
        id: "replantear-costos",
        title: "Replantear la mentalidad",
        concept:
          "La causa de un hábito es la predicción y el sentimiento que lo precede, no el hábito en sí. Al hacer explícitos los costos reales y los beneficios de NO hacerlo, puedes desmontar la historia que hace que el mal hábito parezca deseable.",
        template:
          "Anota con claridad los costos reales de {habit} y todo lo que ganas al evitarlo (salud, tiempo, dinero, tranquilidad), para que deje de parecerte una opción atractiva.",
        example:
          "Escribe en una lista los costos reales de {habit} (salud, tiempo, dinero) y todo lo que ganarías al dejarlo, como hace el método de Allen Carr para dejar de fumar. Relee la lista cada vez que sientas la tentación de {habit}.",
      },
      {
        id: "cambiar-entorno-social",
        title: "Alejarte del grupo que lo normaliza",
        concept:
          "Tendemos a imitar los hábitos del grupo al que pertenecemos porque nos ayuda a encajar. Si {habit} es la norma social de tu entorno cercano, pasar más tiempo con personas para quienes esa conducta no es normal reduce su atractivo.",
        template:
          "Busca pasar más tiempo con personas para quienes {habit} no es la norma, o aléjate (dentro de lo razonable) de los grupos o contextos donde esta conducta se celebra o se espera.",
        example:
          "Busca pasar más tiempo con personas para quienes {habit} no es la norma y reduce el tiempo con quienes lo celebran, recordando que 'siempre empiezas con tus amigos'. Con el tiempo, la nueva compañía hará que {habit} deje de sentirse necesario para encajar.",
      },
    ],
  },
  {
    id: "easy",
    number: 3,
    titleEs: "Hacerlo difícil",
    summary:
      "Así como se puede reducir la fricción de los buenos hábitos, se puede aumentar deliberadamente la fricción de los malos hábitos hasta el punto de volverlos poco prácticos, usando mecanismos de compromiso que atan tu conducta futura.",
    strategies: [
      {
        id: "aumentar-friccion",
        title: "Aumentar la fricción",
        concept:
          "Cuantos más pasos y esfuerzo se interpongan entre tú y el mal hábito, menos probable es que lo repitas. Añadir obstáculos deliberados —por pequeños que parezcan— reduce notablemente la frecuencia del hábito.",
        template:
          "Añade pasos u obstáculos entre tú y {habit}: por ejemplo, [ACCIÓN: desconectar el dispositivo y guardarlo, quitar la app del teléfono, dejarlo fuera de un lugar de fácil acceso].",
        example:
          "Pon un obstáculo real entre tú y {habit}: desconecta el aparato, guarda el objeto lejos o borra la app, como quitar las baterías del control remoto. Cada paso extra que agregues reduce las probabilidades de que caigas en {habit}.",
      },
      {
        id: "mecanismo-compromiso",
        title: "Mecanismo de compromiso",
        concept:
          "Un mecanismo de compromiso es una decisión que tomas hoy para restringir tus opciones futuras y evitar el mal hábito, aprovechando tu fuerza de voluntad presente antes de que llegue la tentación.",
        template:
          "Crea un mecanismo de compromiso que te impida hacer {habit} en el futuro, como [ACCIÓN: bloquear el sitio o la app, pedirle a alguien que guarde el acceso, inscribirte en una lista de autoexclusión].",
        example:
          "Diseña una restricción hoy que te impida hacer {habit} mañana, como bloquear el sitio o pedirle a alguien que guarde el acceso, al estilo de Víctor Hugo guardando su ropa para no salir de casa. Aprovecha tu fuerza de voluntad de hoy para proteger tu decisión de mañana.",
      },
    ],
  },
  {
    id: "satisfying",
    number: 4,
    titleEs: "Hacerlo insatisfactorio",
    summary:
      "Lo que se castiga de inmediato se evita. Añadir un costo inmediato, visible y doloroso —en vez de uno lejano e incierto— a un mal hábito acelera enormemente el abandono de esa conducta.",
    strategies: [
      {
        id: "supervision-social",
        title: "Que alguien te observe",
        concept:
          "Saber que otra persona está al tanto de tu conducta añade un costo social inmediato al fallo, porque nos importa mucho la opinión de los demás sobre nosotros.",
        template:
          "Pídele a [PERSONA] que sepa que estás tratando de dejar {habit} y que te pregunte regularmente cómo vas, para sentir el costo social de fallar de inmediato.",
        example:
          "Cuéntale a alguien de confianza que estás dejando {habit} y pídele que te pregunte tu avance cada semana. Saber que te van a preguntar añade un costo social inmediato a caer en {habit}.",
      },
      {
        id: "contrato-castigo",
        title: "Contrato de hábitos con castigo",
        concept:
          "Un contrato que especifica una consecuencia dolorosa e inmediata en caso de recaer en el mal hábito, firmado ante testigos, vuelve el incumplimiento costoso y público en vez de abstracto y lejano.",
        template:
          "Firma un contrato en el que te comprometas a evitar {habit}, con una consecuencia inmediata y clara si fallas (ej. [CASTIGO: pagar una cantidad de dinero a un amigo, usar una prenda que no te guste, una tarea incómoda]), atestiguado por [TESTIGO].",
        example:
          "Firma con un testigo un contrato en el que te comprometas a evitar {habit}, con un castigo inmediato y molesto si fallas, como pagarle dinero a un amigo, al estilo del contrato de Bryan Harris. Elige un castigo lo bastante incómodo para que de verdad te frene.",
      },
    ],
  },
];
