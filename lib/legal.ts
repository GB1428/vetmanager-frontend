export type SeccionLegal = { titulo: string; parrafos: string[] };

export type AvisoDestacado = { titulo: string; parrafos: string[] };

export type DocumentoLegalContenido = {
  titulo: string;
  actualizado: string;
  intro: string;
  destacado?: AvisoDestacado;
  secciones: SeccionLegal[];
};

export const TERMINOS: DocumentoLegalContenido = {
  titulo: "Términos y Condiciones",
  actualizado: "Noviembre de 2026",
  intro:
    "Estos términos regulan el uso del Formulario de Emergencia de VetManager, a través del cual puedes solicitar que la clínica veterinaria se comunique contigo por una urgencia relacionada con tu mascota.",
  destacado: {
    titulo: "Importante: quiénes somos y hasta dónde llega nuestra responsabilidad",
    parrafos: [
      "VetManager es un software creado por un equipo de programadores. Nosotros solo desarrollamos y mantenemos la herramienta: no administramos ni gestionamos la clínica veterinaria, no atendemos a los pacientes y no decidimos qué se hace con la información que se ingresa.",
      "El uso que cada clínica decida hacer del sistema y de los datos que recibe a través de este formulario es de su exclusiva responsabilidad. Por eso, los desarrolladores de VetManager no nos hacemos responsables de ese uso, ni de la atención, las respuestas, los plazos o las decisiones de la clínica.",
    ],
  },
  secciones: [
    {
      titulo: "1. Qué es el Formulario de Emergencia",
      parrafos: [
        "Es un canal de contacto para que la clínica reciba tus datos y el motivo de tu consulta y se comunique contigo a la brevedad.",
        "Enviar el formulario no garantiza atención inmediata ni equivale a una cita agendada. La clínica evaluará tu solicitud y te contactará según su disponibilidad.",
      ],
    },
    {
      titulo: "2. Emergencias vitales",
      parrafos: [
        "Si tu mascota está en riesgo vital inminente (por ejemplo, convulsiones, dificultad grave para respirar, atropello, sangrado abundante o intoxicación), no esperes la respuesta del formulario: llama directamente a la clínica o acude a un centro de urgencias veterinarias.",
      ],
    },
    {
      titulo: "3. Información que debes entregar",
      parrafos: [
        "Para procesar tu solicitud te pedimos tu nombre, RUT, teléfono, correo electrónico, dirección, el nombre de tu mascota y la razón de tu consulta.",
        "Te comprometes a entregar información verdadera, completa y actualizada. Los datos incorrectos pueden impedir que la clínica te contacte o te atienda adecuadamente.",
      ],
    },
    {
      titulo: "4. Uso de tus datos",
      parrafos: [
        "La clínica es quien decide cómo usar tus datos: para contactarte por la solicitud enviada, coordinar la atención de tu mascota y, si corresponde, registrarte como dueño y registrar a tu mascota en su sistema de gestión.",
        "El detalle del tratamiento de tus datos personales se explica en la Política de Privacidad, que forma parte de estos términos.",
      ],
    },
    {
      titulo: "5. Uso adecuado",
      parrafos: [
        "No debes usar el formulario para enviar información falsa, ofensiva o que corresponda a datos de terceras personas sin su autorización, ni para fines distintos a solicitar atención veterinaria.",
      ],
    },
    {
      titulo: "6. Responsabilidad",
      parrafos: [
        "La información de la solicitud es una orientación inicial y no constituye un diagnóstico ni una indicación médica. La atención clínica es responsabilidad del profesional veterinario que atienda a tu mascota.",
        "La clínica no se hace responsable por demoras causadas por fallas de conexión, datos de contacto incorrectos o circunstancias fuera de su control.",
        "Los desarrolladores de VetManager solo proveemos el software. No gestionamos la clínica ni respondemos por el uso que ella haga de tus datos o del sistema; cualquier reclamo o consulta sobre la atención o el tratamiento de tu información debe dirigirse directamente a la clínica.",
      ],
    },
    {
      titulo: "7. Modificaciones",
      parrafos: [
        "Estos términos pueden actualizarse. La versión vigente será la publicada en esta página, con su fecha de actualización.",
      ],
    },
  ],
};

export const PRIVACIDAD: DocumentoLegalContenido = {
  titulo: "Política de Privacidad",
  actualizado: "Noviembre de 2026",
  intro:
    "Esta política explica qué datos personales se recopilan a través del Formulario de Emergencia, para qué los usa la clínica y cuáles son tus derechos, conforme a la normativa chilena de protección de datos personales.",
  destacado: {
    titulo: "Importante: quién es responsable de tus datos",
    parrafos: [
      "VetManager es un software creado por un equipo de programadores. Nosotros solo desarrollamos y mantenemos la herramienta: no gestionamos la clínica veterinaria ni decidimos para qué se usan los datos que se reciben.",
      "La clínica que utiliza VetManager es la responsable del uso y del tratamiento de tus datos personales. Los desarrolladores no nos hacemos responsables de lo que la clínica decida hacer con esa información, y no usamos tus datos para fines propios.",
    ],
  },
  secciones: [
    {
      titulo: "1. Datos que recopilamos",
      parrafos: [
        "Datos del dueño: nombre completo, RUT, teléfono, correo electrónico y dirección.",
        "Datos de la mascota y de la consulta: nombre de la mascota y la razón de consulta que describes en el formulario.",
        "No solicitamos datos bancarios ni de pago en este formulario.",
      ],
    },
    {
      titulo: "2. Para qué usamos tus datos",
      parrafos: [
        "La clínica puede usar tus datos para contactarte por la emergencia o consulta que enviaste.",
        "También para coordinar la atención veterinaria de tu mascota y, cuando corresponda, crear tu ficha de dueño y la ficha clínica de tu mascota.",
        "Y para mantener un registro interno de las solicitudes recibidas para gestionar su atención.",
        "Los desarrolladores de VetManager no usamos tus datos para publicidad ni los vendemos a terceros.",
      ],
    },
    {
      titulo: "3. Con quién los compartimos",
      parrafos: [
        "Tus datos son vistos por el personal autorizado de la clínica que atiende tu solicitud, que es quien decide cómo usarlos.",
        "Pueden ser tratados por proveedores de infraestructura tecnológica (por ejemplo, de alojamiento del sistema) que actúan por cuenta de la clínica y bajo deber de confidencialidad.",
        "Solo los entregaremos a una autoridad cuando una ley o una orden legítima lo exija.",
      ],
    },
    {
      titulo: "4. Cuánto tiempo los conservamos",
      parrafos: [
        "Conservamos tus datos mientras sean necesarios para atender tu solicitud y mantener la relación con la clínica, y por los plazos que exija la normativa aplicable. Luego se eliminan o se anonimizan.",
      ],
    },
    {
      titulo: "5. Seguridad",
      parrafos: [
        "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados, pérdida o alteración. El acceso al sistema se restringe a usuarios autorizados.",
      ],
    },
    {
      titulo: "6. Tus derechos",
      parrafos: [
        "Puedes solicitar acceso a tus datos, su rectificación si son inexactos, su eliminación cuando corresponda, y oponerte o bloquear su uso en los casos que establece la ley.",
        "Para ejercer estos derechos, comunícate directamente con la clínica por sus canales de contacto indicando tu nombre y RUT, ya que es ella quien responde por el tratamiento de tus datos.",
      ],
    },
    {
      titulo: "7. Consentimiento",
      parrafos: [
        "Al aceptar esta política y enviar el formulario, autorizas el tratamiento de tus datos para las finalidades descritas. Puedes retirar tu consentimiento en cualquier momento contactando a la clínica, sin efecto retroactivo.",
      ],
    },
    {
      titulo: "8. Cambios en esta política",
      parrafos: [
        "Si actualizamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización.",
      ],
    },
  ],
};
