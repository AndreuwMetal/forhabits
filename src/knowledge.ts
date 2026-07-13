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
          "Cada vez que haga (o deje de hacer) {habit}, lo anotaré en mi Registro de Hábitos con un signo (+), (-) o (=), simplemente para darme cuenta de cuándo y en qué contexto ocurre, sin criticarme.",
        example:
          "Como en el libro con la rutina matutina (despertar, revisar el teléfono, bañarse), anota junto a '{habit}' si se trata de un hábito que refuerza o que entra en conflicto con la persona que quieres llegar a ser.",
      },
      {
        id: "intencion-implementacion",
        title: "Intención de implementación",
        concept:
          "Un plan que especifica de antemano cuándo y dónde vas a actuar duplica o triplica las probabilidades de cumplirlo, según estudios citados en el libro. La motivación vaga se transforma en un plan de acción concreto al fijar tiempo y lugar.",
        template: "Voy a {habit} a las [HORA] en [LUGAR].",
        example:
          "Igual que en el estudio de ejercicio de Gran Bretaña: 'Voy a hacer 20 minutos de ejercicio vigoroso el martes a las 7:00 a. m. en el parque', aplica la fórmula a {habit}.",
      },
      {
        id: "apilamiento-habitos",
        title: "Apilamiento de hábitos (habit stacking)",
        concept:
          "En vez de ligar el nuevo hábito a un horario, lo vinculas a un hábito que ya realizas todos los días sin fallar. Cada acción se convierte en la señal que desencadena la siguiente, aprovechando cadenas de conducta que ya existen.",
        template: "Después de [HÁBITO ACTUAL], voy a {habit}.",
        example:
          "Como 'Después de servirme el café cada mañana, voy a meditar durante un minuto', puedes escribir: 'Después de [tu hábito actual más estable], voy a {habit}'.",
      },
      {
        id: "diseno-ambiente",
        title: "Diseño del ambiente",
        concept:
          "El ambiente es la mano invisible que moldea el comportamiento: notamos y repetimos las señales que son evidentes y accesibles, e ignoramos las que están escondidas. Rediseñar el espacio para que la señal del hábito deseado salte a la vista facilita la acción sin necesitar más motivación.",
        template:
          "Voy a colocar [OBJETO O SEÑAL relacionado con {habit}] en un lugar muy visible de [LUGAR], para que se convierta en el recordatorio obvio de hacer {habit}.",
        example:
          "Como el autor con el frutero de manzanas en el centro de la mesa: si quieres {habit}, pon el objeto que lo activa (el libro, el tapete de yoga, la botella de agua) justo donde no puedas evitar verlo.",
      },
      {
        id: "un-lugar-un-uso",
        title: "Un espacio, un uso (el contexto es la señal)",
        concept:
          "Con el tiempo, un hábito se asocia no solo a una señal aislada sino a todo el contexto que lo rodea. Reservar un espacio exclusivo para una sola actividad ayuda a que ese contexto se convierta en la señal automática del hábito.",
        template:
          "Voy a reservar [LUGAR/RINCÓN/MOMENTO] exclusivamente para {habit}, y no lo usaré para nada más, de modo que ese contexto por sí solo me impulse a actuar.",
        example:
          "El libro sugiere una silla solo para leer o un escritorio solo para escribir; aplica la misma idea creando un rincón o momento del día dedicado únicamente a {habit}.",
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
          "Después de {habit} (lo que necesito hacer), me permitiré [ACTIVIDAD QUE ME ENCANTA] (lo que quiero hacer).",
        example:
          "Como el estudiante que solo veía Netflix mientras pedaleaba en su bicicleta fija: combina {habit} con algo que disfrutes, por ejemplo escuchar tu pódcast favorito solo mientras haces {habit}.",
      },
      {
        id: "unirse-tribu",
        title: "Unirse a una tribu",
        concept:
          "Imitamos los hábitos del grupo cercano, del grupo numeroso y de la gente con estatus, porque pertenecer es uno de los deseos más profundos del ser humano. Un hábito se vuelve mucho más atractivo cuando es la conducta normal del grupo al que perteneces.",
        template:
          "Me uniré a un grupo, clase o comunidad donde {habit} sea la conducta normal y compartida por sus integrantes —por ejemplo [GRUPO/CLUB/COMUNIDAD ONLINE]— para que mi identidad se refuerce junto con la de los demás.",
        example:
          "Como Nerd Fitness, que ayuda a la gente a ponerse en forma rodeándola de personas afines: busca una comunidad (un club de running, un grupo de lectura) donde {habit} ya sea el estándar.",
      },
      {
        id: "ritual-motivacion",
        title: "Ritual de motivación",
        concept:
          "Puedes reprogramar tu cerebro para disfrutar hábitos difíciles asociándolos con algo que ya te resulta placentero justo antes de realizarlos. Con la repetición, esa pequeña rutina se convierte en la señal que dispara el estado de ánimo adecuado.",
        template:
          "Justo antes de {habit}, haré algo pequeño que disfruto mucho, como [ACCIÓN PLACENTERA: respirar hondo y sonreír, poner una canción concreta, tomar mi bebida favorita], para asociar {habit} con una sensación positiva.",
        example:
          "Como el escritor que se concentra en cuanto se pone los audífonos, sin necesidad de música: crea un pequeño ritual de dos o tres pasos que siempre repitas justo antes de {habit}.",
      },
      {
        id: "replanteamiento-mental",
        title: "Replanteamiento mental (beneficios, no obligaciones)",
        concept:
          "Cada hábito tiene un anhelo superficial y un motivo más profundo; puedes hacer que un hábito sea más atractivo si resaltas sus beneficios en vez de sus costos, cambiando 'tengo que' por 'tengo la oportunidad de'.",
        template:
          "En lugar de decir 'tengo que {habit}', diré 'tengo la oportunidad de {habit}', recordando el beneficio real que me va a dar.",
        example:
          "Como el ejemplo del libro: 'Debo ir a correr' se convierte en 'Es hora de desarrollar mi resistencia y volverme más veloz'. Aplica el mismo cambio de lenguaje a {habit}.",
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
          "Reduciré {habit} a su versión mínima de dos minutos, por ejemplo: [ACCIÓN INICIAL MUY PEQUEÑA], y me comprometo solo a hacer eso.",
        example:
          "Como 'leer antes de dormir' se convierte en 'leer una página' o 'correr 3 km' se convierte en 'ponerme los tenis': encuentra la versión de dos minutos de {habit}.",
      },
      {
        id: "reducir-friccion",
        title: "Reducir la fricción y preparar el ambiente",
        concept:
          "Optimizar el ambiente para que el buen hábito requiera el menor número de pasos posible aumenta drásticamente las probabilidades de realizarlo. Preparar con antelación el espacio o los materiales elimina obstáculos antes de que aparezcan.",
        template:
          "Prepararé con anticipación todo lo necesario para {habit}: dejaré listo [MATERIAL/ROPA/HERRAMIENTA] en [LUGAR] desde [MOMENTO ANTERIOR], para que no haya nada entre yo y la acción.",
        example:
          "Como dejar la ropa de entrenar, los tenis y la botella de agua listos la noche anterior: identifica qué preparativo elimina la mayor fricción para {habit}.",
      },
      {
        id: "momento-decisivo",
        title: "Dominar el momento decisivo",
        concept:
          "Cada día hay unos pocos momentos —caminos que se bifurcan— que determinan el resto de tus horas. Identificar y controlar ese primer pequeño paso (el 'taxi', no el 'gimnasio') encamina el resto de la conducta de forma casi automática.",
        template:
          "Identificaré el momento decisivo que precede a {habit} —por ejemplo [ACCIÓN DESENCADENANTE: ponerme la ropa de deporte, sacar el cuaderno, cerrar la laptop]— y me aseguraré de dar siempre ese primer paso.",
        example:
          "Como Twyla Tharp, cuyo verdadero ritual es subirse al taxi, no el entrenamiento en sí: define cuál es 'el taxi' que garantiza que llegues a {habit}.",
      },
      {
        id: "automatizar-habito",
        title: "Automatizar el hábito",
        concept:
          "Algunas decisiones de una sola vez —comprar cierto equipo, activar una app, programar un recordatorio— generan beneficios una y otra vez sin requerir fuerza de voluntad diaria. La tecnología puede volver un buen hábito prácticamente inevitable.",
        template:
          "Automatizaré {habit} con una decisión de una sola vez: [ACCIÓN, ej. programar una alarma o recordatorio, contratar/comprar algo, configurar un pago o envío automático] para que ocurra sin que tenga que decidirlo cada día.",
        example:
          "Como inscribirse en un plan de ahorro automático o programar recordatorios del médico: busca qué configuración única puede hacer que {habit} suceda solo.",
      },
      {
        id: "practica-sobre-perfeccion",
        title: "Repetición antes que perfección",
        concept:
          "Es más importante ponerte en marcha y actuar que planear el sistema perfecto. Un hábito debe estandarizarse (repetirse de forma simple y consistente) antes de poder optimizarse; la frecuencia de la práctica importa más que la calidad inicial.",
        template:
          "Practicaré {habit} de la forma más simple posible, con el único objetivo de repetirlo muchas veces, sin buscar hacerlo perfecto todavía.",
        example:
          "Como los estudiantes de fotografía que, al tomar muchas fotos imperfectas, terminaron con mejores resultados que quienes solo teorizaban sobre la foto perfecta: prioriza hacer {habit} una y otra vez.",
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
          "Justo después de completar {habit}, me daré una pequeña recompensa inmediata y coherente con quien quiero ser, como [RECOMPENSA: un baño relajante, anotar el logro, un té especial], para sentir que valió la pena.",
        example:
          "Como el jabón perfumado que hizo que lavarse las manos se sintiera bien y por eso se repitiera: elige una recompensa para {habit} que refuerce tu identidad, no que la contradiga.",
      },
      {
        id: "seguimiento-habitos",
        title: "Seguimiento de hábitos (habit tracker)",
        concept:
          "Llevar un registro visual del progreso —una X en el calendario, una cuenta que se acumula— hace que el hábito sea a la vez obvio, atractivo y satisfactorio, porque ver la cadena crecer motiva a no romperla.",
        template:
          "Llevaré un registro visual de {habit}: marcaré una X en un calendario (o moveré una ficha/clip de un recipiente a otro) cada vez que lo complete, y trataré de mantener la cadena sin interrupciones.",
        example:
          "Como la 'Estrategia del clip' de Trent Dyrsmid o el 'nunca romper la cadena' de Jerry Seinfeld: aplica el mismo sistema de marcas visuales a {habit}.",
      },
      {
        id: "nunca-fallar-dos-veces",
        title: "Nunca falles dos veces",
        concept:
          "La perfección no es el objetivo; lo que distingue a quienes tienen éxito es que, tras un fallo, se recuperan rápido. Perder un día es un accidente; perderlo dos veces seguidas es el inicio de un nuevo mal hábito.",
        template:
          "Si algún día no logro hacer {habit}, me comprometo a retomarlo la próxima ocasión posible, sin dejar que falte dos veces seguidas.",
        example:
          "Como el consejo del libro: 'Faltar a un entrenamiento es posible, pero no perderé dos entrenamientos consecutivos'. Aplica esa misma regla a {habit}.",
      },
      {
        id: "socio-corresponsable",
        title: "Socio corresponsable",
        concept:
          "Saber que alguien está observando tu conducta añade un costo social inmediato a fallar, porque nos importa mucho lo que los demás piensan de nosotros. Un socio corresponsable convierte el progreso (o la falta de él) en algo visible para otra persona.",
        template:
          "Le pediré a [PERSONA] que sea mi socio corresponsable para {habit}: le contaré mi plan y acordaremos que me pida cuentas cada [PERIODICIDAD].",
        example:
          "Como la comediante Margaret Cho, que escribe un chiste al día apoyada por una amiga: busca a alguien que revise contigo tu avance en {habit}.",
      },
      {
        id: "contrato-habitos",
        title: "Contrato de hábitos",
        concept:
          "Un contrato de hábitos es un acuerdo escrito o verbal donde defines el hábito que te comprometes a cumplir y la consecuencia si no lo haces, firmado junto con uno o dos testigos. Añade un costo social y a veces económico que hace doloroso incumplir de inmediato.",
        template:
          "Escribiré un contrato de hábitos para {habit}: definiré el compromiso, una consecuencia clara si no lo cumplo (ej. [CONSECUENCIA]), y lo firmaré junto con [TESTIGO/SOCIO].",
        example:
          "Como el contrato de Bryan Harris con su esposa y su entrenador, donde el incumplimiento tenía un costo económico y social concreto: redacta un contrato similar para {habit}.",
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
          "Eliminaré o esconderé las señales que me llevan a {habit}: por ejemplo, [ACCIÓN: guardar el objeto fuera de la vista, desinstalar la app, no comprarlo].",
        example:
          "Como dejar el teléfono en otra habitación para evitar revisarlo sin parar: identifica la señal visible que dispara {habit} y sácala de tu entorno.",
      },
      {
        id: "cambiar-contexto",
        title: "Cambiar de ambiente o contexto",
        concept:
          "Los hábitos se asocian con todo el contexto que los rodea, no solo con una señal aislada. Alejarte del ambiente donde sueles caer en el hábito —o rediseñarlo— te libera de tener que luchar constantemente contra las mismas señales.",
        template:
          "Evitaré los lugares, momentos o situaciones donde suelo caer en {habit}, o cambiaré ese entorno (otra ruta, otra habitación, otra rutina) para escapar de sus señales habituales.",
        example:
          "Como los soldados en Vietnam que dejaron la heroína casi sin esfuerzo al cambiar de ambiente por completo: busca qué cambio de contexto te aleja de las señales de {habit}.",
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
          "Anotaré con claridad los costos reales de {habit} y todo lo que gano al evitarlo (salud, tiempo, dinero, tranquilidad), para que deje de parecerme una opción atractiva.",
        example:
          "Como el libro que usa Allen Carr para dejar de fumar, que desmonta uno por uno los supuestos beneficios del cigarro: haz el mismo ejercicio con {habit}.",
      },
      {
        id: "cambiar-entorno-social",
        title: "Alejarte del grupo que lo normaliza",
        concept:
          "Tendemos a imitar los hábitos del grupo al que pertenecemos porque nos ayuda a encajar. Si {habit} es la norma social de tu entorno cercano, pasar más tiempo con personas para quienes esa conducta no es normal reduce su atractivo.",
        template:
          "Buscaré pasar más tiempo con personas para quienes {habit} no es la norma, o me alejaré (dentro de lo razonable) de los grupos o contextos donde esta conducta se celebra o se espera.",
        example:
          "Como el fumador que dijo 'siempre empiezas con tus amigos': si el entorno social refuerza {habit}, cambiar de compañía reduce la presión para repetirlo.",
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
          "Añadiré pasos u obstáculos entre yo y {habit}: por ejemplo, [ACCIÓN: desconectar el dispositivo y guardarlo, quitar la app del teléfono, dejarlo fuera de un lugar de fácil acceso].",
        example:
          "Como quitar las baterías del control remoto o guardar la televisión en el clóset: identifica qué paso adicional puede interponerse entre tú y {habit}.",
      },
      {
        id: "mecanismo-compromiso",
        title: "Mecanismo de compromiso",
        concept:
          "Un mecanismo de compromiso es una decisión que tomas hoy para restringir tus opciones futuras y evitar el mal hábito, aprovechando tu fuerza de voluntad presente antes de que llegue la tentación.",
        template:
          "Crearé un mecanismo de compromiso que me impida hacer {habit} en el futuro, como [ACCIÓN: bloquear el sitio o la app, pedirle a alguien que guarde el acceso, inscribirme en una lista de autoexclusión].",
        example:
          "Como Víctor Hugo, que hizo guardar toda su ropa para no poder salir de casa y así terminar su libro a tiempo: diseña tu propio 'baúl cerrado' para {habit}.",
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
          "Le pediré a [PERSONA] que sepa que estoy tratando de dejar {habit} y que me pregunte regularmente cómo voy, para sentir el costo social de fallar de inmediato.",
        example:
          "Como el uso de socios corresponsables para cumplir metas: aplica la misma lógica de supervisión social para dejar {habit}.",
      },
      {
        id: "contrato-castigo",
        title: "Contrato de hábitos con castigo",
        concept:
          "Un contrato que especifica una consecuencia dolorosa e inmediata en caso de recaer en el mal hábito, firmado ante testigos, vuelve el incumplimiento costoso y público en vez de abstracto y lejano.",
        template:
          "Firmaré un contrato en el que me comprometo a evitar {habit}, con una consecuencia inmediata y clara si fallo (ej. [CASTIGO: pagar una cantidad de dinero a un amigo, usar una prenda que no me guste, una tarea incómoda]), atestiguado por [TESTIGO].",
        example:
          "Como el contrato de Bryan Harris, que incluía pagar dinero a su entrenador o vestir de forma incómoda si fallaba: crea un contrato con un castigo igual de concreto para {habit}.",
      },
    ],
  },
];
