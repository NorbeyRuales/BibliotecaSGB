/**
 * ============================================================================
 * HELPCONTENT - CONTENIDO DE LA GUÍA DE USUARIO
 * ============================================================================
 * Sistema de contenido de ayuda organizado por roles y secciones
 * Se adapta automáticamente según el tipo de usuario y el apartado actual
 * ============================================================================
 */

export interface HelpSection {
  id: string;
  titulo: string;
  contenido: string;
  pasos?: string[];
  subsecciones?: HelpSection[];
  accionesRapidas?: {
    texto: string;
    ruta?: string;
    accion?: 'registro' | 'login' | 'cerrar';
  }[];
}

export interface HelpContent {
  categoria: string;
  secciones: HelpSection[];
}

/**
 * CONTENIDO DE AYUDA PARA USUARIOS NO REGISTRADOS
 */
export const helpNoRegistrado: HelpContent[] = [
  {
    categoria: "Inicio de Sesión y Registro",
    secciones: [
      {
        id: "registro",
        titulo: "¿Cómo registrarse en la plataforma?",
        contenido: "Crear una cuenta es rápido y sencillo. Solo necesitas proporcionar algunos datos básicos.",
        pasos: [
          "Haz clic en el botón 'Crear cuenta nueva' en la pantalla de inicio",
          "Completa el formulario con tu información personal: email, identificación, nombre, apellido y fecha de nacimiento",
          "Crea una contraseña segura (mínimo 6 caracteres)",
          "Haz clic en 'Registrarse'",
          "Una vez registrado, automáticamente iniciarás sesión en la plataforma"
        ],
        accionesRapidas: [
          {
            texto: "Crear cuenta nueva",
            accion: "registro"
          }
        ]
      },
      {
        id: "login",
        titulo: "¿Cómo iniciar sesión?",
        contenido: "Si ya tienes una cuenta, puedes acceder fácilmente con tus credenciales.",
        pasos: [
          "Ingresa tu correo electrónico en el campo 'Email'",
          "Ingresa tu contraseña en el campo 'Contraseña'",
          "Haz clic en 'Iniciar sesión'",
          "Serás redirigido a tu dashboard según tu rol (Cliente o Administrador)"
        ],
        accionesRapidas: [
          {
            texto: "Iniciar sesión",
            accion: "login"
          }
        ]
      },
      {
        id: "beneficios",
        titulo: "Beneficios de registrarse",
        contenido: "Al crear una cuenta en nuestra biblioteca digital, obtienes acceso completo a todas las funcionalidades del sistema.",
        pasos: [
          "Explorar el catálogo completo de libros con detalles, categorías y disponibilidad",
          "Solicitar préstamos de libros de forma digital",
          "Gestionar tus préstamos activos: consultar fechas de devolución y renovar si es necesario",
          "Ver y consultar multas pendientes en caso de retrasos",
          "Acceder a tu historial de préstamos",
          "Recibir notificaciones sobre el estado de tus préstamos"
        ]
      }
    ]
  },
  {
    categoria: "Vista Previa de la Plataforma",
    secciones: [
      {
        id: "que-ofrece",
        titulo: "¿Qué ofrece nuestra biblioteca?",
        contenido: "Nuestra plataforma es un sistema completo de gestión de biblioteca digital con múltiples funcionalidades.",
        pasos: [
          "Catálogo extenso de libros organizados por categorías",
          "Sistema de préstamos digitales con fechas personalizables",
          "Gestión de multas automática por retrasos",
          "Panel de usuario personalizado según tu rol",
          "Sistema de búsqueda y filtros avanzados",
          "Reportes y estadísticas (disponible para administradores)"
        ]
      },
      {
        id: "catalogo-publico",
        titulo: "Explorar el catálogo público",
        contenido: "Puedes explorar libremente nuestro catálogo de libros sin necesidad de registrarte. Esta vista previa te permite conocer nuestra colección completa.",
        pasos: [
          "Utiliza la barra de búsqueda para encontrar libros por título, autor o ISBN",
          "Filtra por categoría para explorar géneros específicos",
          "Filtra por disponibilidad para ver qué libros están disponibles en este momento",
          "Haz clic en 'Ver detalles' para ver información completa del libro (ISBN, editorial, año, descripción)",
          "Los libros muestran claramente si están disponibles o no",
          "Puedes ver cuántas copias están disponibles de cada libro"
        ],
        accionesRapidas: [
          {
            texto: "Crear cuenta para solicitar préstamos",
            accion: "registro"
          }
        ]
      },
      {
        id: "solicitar-prestamo-publico",
        titulo: "¿Por qué no puedo solicitar préstamos?",
        contenido: "La vista pública está diseñada para exploración. Para solicitar préstamos y acceder a todas las funcionalidades, necesitas una cuenta.",
        pasos: [
          "Al hacer clic en 'Solicitar préstamo' verás un mensaje indicando que necesitas autenticarte",
          "Puedes elegir entre crear una cuenta nueva o iniciar sesión si ya tienes una",
          "El registro es completamente gratuito y solo toma unos segundos",
          "Una vez registrado, podrás solicitar préstamos, renovar libros, ver tu historial y gestionar multas",
          "Tu cuenta queda vinculada a tu email y puedes iniciar sesión desde cualquier dispositivo"
        ],
        accionesRapidas: [
          {
            texto: "Registrarse ahora",
            accion: "registro"
          },
          {
            texto: "Iniciar sesión",
            accion: "login"
          }
        ]
      }
    ]
  }
];

/**
 * CONTENIDO DE AYUDA PARA CLIENTES REGISTRADOS
 */
export const helpCliente: HelpContent[] = [
  {
    categoria: "Catálogo de Libros",
    secciones: [
      {
        id: "buscar-libros",
        titulo: "¿Cómo buscar libros?",
        contenido: "El sistema ofrece múltiples formas de encontrar el libro que necesitas.",
        pasos: [
          "Ve a la sección 'Catálogo de Libros' desde el menú principal",
          "Usa la barra de búsqueda en la parte superior para buscar por título, autor o ISBN",
          "Filtra por categoría usando el selector de categorías",
          "Filtra por disponibilidad: 'Todos', 'Disponibles' o 'No disponibles'",
          "Los resultados se actualizan automáticamente mientras escribes"
        ],
        accionesRapidas: [
          {
            texto: "Ir al Catálogo",
            ruta: "/catalogo"
          }
        ]
      },
      {
        id: "ver-detalles",
        titulo: "¿Cómo ver los detalles de un libro?",
        contenido: "Cada libro tiene información detallada que puedes consultar antes de solicitar un préstamo.",
        pasos: [
          "En el catálogo, cada tarjeta de libro muestra: título, autor, categoría y disponibilidad",
          "El badge verde indica 'Disponible', el badge rojo indica 'No disponible'",
          "La cantidad de copias disponibles aparece en la parte inferior",
          "Información adicional incluye: ISBN, categoría y número de copias totales"
        ],
        accionesRapidas: [
          {
            texto: "Ir al Catálogo",
            ruta: "/catalogo"
          }
        ]
      },
      {
        id: "solicitar-prestamo",
        titulo: "¿Cómo solicitar un préstamo?",
        contenido: "Solicitar un libro prestado es muy sencillo desde el catálogo.",
        pasos: [
          "Busca el libro que deseas en el catálogo",
          "Verifica que esté disponible (badge verde 'Disponible')",
          "Haz clic en el botón azul 'Solicitar Préstamo'",
          "Aparecerá un diálogo para confirmar la solicitud",
          "Selecciona la fecha de devolución deseada (por defecto 15 días)",
          "Confirma la solicitud",
          "El préstamo aparecerá inmediatamente en tu sección 'Mis Préstamos'"
        ],
        accionesRapidas: [
          {
            texto: "Ir al Catálogo",
            ruta: "/catalogo"
          }
        ]
      }
    ]
  },
  {
    categoria: "Gestión de Préstamos",
    secciones: [
      {
        id: "ver-prestamos",
        titulo: "¿Cómo ver mis préstamos activos?",
        contenido: "Puedes consultar todos tus préstamos actuales en cualquier momento.",
        pasos: [
          "Ve a la sección 'Mis Préstamos' desde el menú principal",
          "Verás una tabla con todos tus préstamos activos",
          "Cada préstamo muestra: libro, fecha de préstamo, fecha de devolución y estado",
          "Los estados posibles son: 'Activo', 'Devuelto' o 'Vencido'",
          "Los préstamos vencidos aparecen con un badge rojo"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "renovar-prestamo",
        titulo: "¿Cómo renovar un préstamo?",
        contenido: "Si necesitas más tiempo con un libro, puedes renovar el préstamo antes de la fecha de devolución.",
        pasos: [
          "Ve a 'Mis Préstamos'",
          "Busca el préstamo que deseas renovar",
          "Haz clic en el botón turquesa 'Renovar'",
          "Selecciona la nueva fecha de devolución",
          "Confirma la renovación",
          "La fecha de devolución se actualizará automáticamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "devolver-libro",
        titulo: "¿Cómo devolver un libro?",
        contenido: "Cuando termines de leer, puedes marcar el libro como devuelto en el sistema.",
        pasos: [
          "Ve a 'Mis Préstamos'",
          "Busca el préstamo que deseas devolver",
          "Haz clic en el botón verde 'Devolver'",
          "Confirma la devolución",
          "El estado del préstamo cambiará a 'Devuelto'",
          "El libro volverá a estar disponible en el catálogo para otros usuarios"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "prestamos-vencidos",
        titulo: "¿Qué pasa si no devuelvo a tiempo?",
        contenido: "Los préstamos vencidos generan multas automáticas que debes pagar.",
        pasos: [
          "Si no devuelves un libro antes de la fecha límite, el préstamo se marca como 'Vencido'",
          "Se genera automáticamente una multa de $5.00 por día de retraso",
          "Puedes consultar tus multas en la sección 'Mis Multas'",
          "Debes pagar las multas para poder solicitar nuevos préstamos",
          "Una vez pagada la multa, podrás seguir usando el sistema normalmente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Préstamos",
            ruta: "/prestamos"
          },
          {
            texto: "Ir a Mis Multas",
            ruta: "/multas"
          }
        ]
      }
    ]
  },
  {
    categoria: "Multas",
    secciones: [
      {
        id: "consultar-multas",
        titulo: "¿Cómo consultar mis multas?",
        contenido: "Puedes ver todas tus multas pendientes y pagadas en cualquier momento.",
        pasos: [
          "Ve a la sección 'Mis Multas' desde el menú principal",
          "Verás una tabla con todas tus multas",
          "Cada multa muestra: libro, monto, fecha y estado",
          "Filtra por estado: 'Todas', 'Pendiente' o 'Pagada'",
          "Las multas pendientes tienen un badge rojo, las pagadas tienen un badge verde"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Multas",
            ruta: "/multas"
          }
        ]
      },
      {
        id: "pagar-multas",
        titulo: "¿Cómo pagar una multa?",
        contenido: "El pago de multas se realiza directamente desde la plataforma.",
        pasos: [
          "Ve a 'Mis Multas'",
          "Busca la multa que deseas pagar (estado 'Pendiente')",
          "Haz clic en el botón verde 'Pagar'",
          "Confirma el pago en el diálogo",
          "El estado cambiará a 'Pagada'",
          "Se generará un recibo digital que puedes descargar o imprimir"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Mis Multas",
            ruta: "/multas"
          }
        ]
      }
    ]
  },
  {
    categoria: "Perfil de Usuario",
    secciones: [
      {
        id: "ver-perfil",
        titulo: "¿Cómo ver mi información personal?",
        contenido: "Tu información de perfil está siempre visible en la parte superior del dashboard.",
        pasos: [
          "En la parte superior del dashboard verás tu nombre completo",
          "También puedes ver tu correo electrónico registrado",
          "La fecha de registro en el sistema aparece debajo de tu nombre"
        ]
      },
      {
        id: "cerrar-sesion",
        titulo: "¿Cómo cerrar sesión?",
        contenido: "Puedes cerrar tu sesión de forma segura en cualquier momento.",
        pasos: [
          "Haz clic en el botón 'Cerrar sesión' en la barra de navegación superior",
          "Serás redirigido a la pantalla de inicio de sesión",
          "Tu sesión se cerrará de forma segura",
          "Deberás volver a iniciar sesión para acceder nuevamente"
        ],
        accionesRapidas: [
          {
            texto: "Cerrar sesión",
            accion: "cerrar"
          }
        ]
      }
    ]
  }
];

/**
 * CONTENIDO DE AYUDA PARA ADMINISTRADORES
 */
export const helpAdmin: HelpContent[] = [
  {
    categoria: "Panel de Administración",
    secciones: [
      {
        id: "dashboard-admin",
        titulo: "Panel de Control del Administrador",
        contenido: "El dashboard administrativo te da acceso completo a todas las funcionalidades de gestión del sistema.",
        pasos: [
          "Accede a estadísticas generales: total de libros, usuarios, préstamos activos y multas pendientes",
          "Navega entre módulos usando el menú de navegación superior",
          "Cada módulo tiene operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)",
          "Todas tus acciones quedan registradas en el sistema de auditoría"
        ]
      }
    ]
  },
  {
    categoria: "Gestión de Libros",
    secciones: [
      {
        id: "crear-libro",
        titulo: "¿Cómo crear un nuevo libro?",
        contenido: "Agregar libros al catálogo es un proceso simple y rápido.",
        pasos: [
          "Ve al módulo 'Libros' desde el menú principal",
          "Haz clic en el botón verde 'Nuevo Libro'",
          "Completa el formulario con la información del libro:",
          "  - Título del libro",
          "  - Autor del libro",
          "  - ISBN (código único del libro)",
          "  - Categoría (selecciona de la lista)",
          "  - Número de copias disponibles",
          "Haz clic en 'Crear Libro'",
          "El libro aparecerá inmediatamente en el catálogo"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Libros",
            ruta: "/libros"
          }
        ]
      },
      {
        id: "editar-libro",
        titulo: "¿Cómo editar la información de un libro?",
        contenido: "Puedes modificar cualquier dato de un libro existente.",
        pasos: [
          "En el módulo 'Libros', busca el libro que deseas editar",
          "Haz clic en el botón azul 'Editar' en la fila del libro",
          "Modifica los campos que necesites actualizar",
          "Haz clic en 'Guardar Cambios'",
          "Los cambios se reflejarán inmediatamente en todo el sistema"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Libros",
            ruta: "/libros"
          }
        ]
      },
      {
        id: "eliminar-libro",
        titulo: "¿Cómo eliminar un libro?",
        contenido: "El sistema utiliza borrado lógico, lo que permite recuperar libros eliminados.",
        pasos: [
          "En el módulo 'Libros', busca el libro que deseas eliminar",
          "Haz clic en el botón rojo 'Eliminar'",
          "Confirma la eliminación en el diálogo",
          "El libro se marcará como eliminado pero no se borrará de la base de datos",
          "Puedes ver y restaurar libros eliminados desde 'Elementos Eliminados'"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Libros",
            ruta: "/libros"
          }
        ]
      },
      {
        id: "actualizar-inventario",
        titulo: "¿Cómo actualizar el inventario de libros?",
        contenido: "Puedes ajustar la cantidad de copias disponibles en cualquier momento.",
        pasos: [
          "Edita el libro que deseas actualizar",
          "Modifica el campo 'Copias Disponibles'",
          "Guarda los cambios",
          "El sistema automáticamente actualizará la disponibilidad en el catálogo"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Libros",
            ruta: "/libros"
          }
        ]
      },
      {
        id: "buscar-filtrar-libros",
        titulo: "¿Cómo buscar y filtrar libros?",
        contenido: "El módulo de libros incluye herramientas avanzadas de búsqueda y filtrado.",
        pasos: [
          "Usa la barra de búsqueda para buscar por título, autor o ISBN",
          "Filtra por categoría usando el selector",
          "Filtra por estado: 'Activos' o 'Eliminados'",
          "Los resultados se actualizan en tiempo real"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Libros",
            ruta: "/libros"
          }
        ]
      }
    ]
  },
  {
    categoria: "Gestión de Usuarios",
    secciones: [
      {
        id: "ver-usuarios",
        titulo: "¿Cómo ver todos los usuarios?",
        contenido: "Puedes consultar y gestionar todos los usuarios registrados en el sistema.",
        pasos: [
          "Ve al módulo 'Usuarios' desde el menú principal",
          "Verás una tabla con todos los usuarios del sistema",
          "Cada usuario muestra: nombre, email, identificación, rol y estado",
          "Usa los filtros para buscar usuarios específicos"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Usuarios",
            ruta: "/usuarios"
          }
        ]
      },
      {
        id: "crear-usuario",
        titulo: "¿Cómo crear un nuevo usuario?",
        contenido: "Puedes crear usuarios manualmente desde el panel de administración.",
        pasos: [
          "En el módulo 'Usuarios', haz clic en 'Nuevo Usuario'",
          "Completa el formulario con los datos del usuario",
          "Asigna un rol: 'Cliente' o 'Admin'",
          "Crea una contraseña inicial para el usuario",
          "Haz clic en 'Crear Usuario'",
          "El usuario podrá iniciar sesión inmediatamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Usuarios",
            ruta: "/usuarios"
          }
        ]
      },
      {
        id: "editar-usuario",
        titulo: "¿Cómo editar información de un usuario?",
        contenido: "Puedes modificar datos de usuarios existentes, incluyendo su rol.",
        pasos: [
          "Busca el usuario que deseas editar",
          "Haz clic en 'Editar'",
          "Modifica los campos necesarios (nombre, email, rol, etc.)",
          "Guarda los cambios",
          "Los cambios se aplicarán inmediatamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Usuarios",
            ruta: "/usuarios"
          }
        ]
      },
      {
        id: "bloquear-usuario",
        titulo: "¿Cómo bloquear/desbloquear un usuario?",
        contenido: "Puedes bloquear usuarios para evitar que accedan al sistema.",
        pasos: [
          "En la tabla de usuarios, usa el switch en la columna 'Bloqueado'",
          "Activa el switch para bloquear al usuario",
          "Desactiva el switch para desbloquear",
          "Los usuarios bloqueados no podrán iniciar sesión",
          "El bloqueo es inmediato y reversible"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Usuarios",
            ruta: "/usuarios"
          }
        ]
      },
      {
        id: "eliminar-usuario",
        titulo: "¿Cómo eliminar un usuario?",
        contenido: "Al igual que con los libros, se usa borrado lógico para usuarios.",
        pasos: [
          "Busca el usuario que deseas eliminar",
          "Haz clic en el botón rojo 'Eliminar'",
          "Confirma la eliminación",
          "El usuario se marcará como eliminado pero no se borrará completamente",
          "Puedes restaurar usuarios eliminados desde 'Elementos Eliminados'"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Usuarios",
            ruta: "/usuarios"
          }
        ]
      }
    ]
  },
  {
    categoria: "Gestión de Préstamos",
    secciones: [
      {
        id: "ver-prestamos-admin",
        titulo: "¿Cómo ver todos los préstamos?",
        contenido: "Como administrador, puedes ver y gestionar todos los préstamos del sistema.",
        pasos: [
          "Ve al módulo 'Préstamos' desde el menú principal",
          "Verás una tabla con todos los préstamos (activos, devueltos y vencidos)",
          "Cada préstamo muestra: usuario, libro, fechas y estado",
          "Filtra por estado: 'Todos', 'Activos', 'Devueltos' o 'Vencidos'"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "crear-prestamo-admin",
        titulo: "¿Cómo crear un préstamo manualmente?",
        contenido: "Puedes crear préstamos en nombre de cualquier usuario.",
        pasos: [
          "En el módulo 'Préstamos', haz clic en 'Nuevo Préstamo'",
          "Selecciona el usuario que recibirá el préstamo",
          "Selecciona el libro a prestar",
          "Establece la fecha de devolución",
          "Confirma la creación",
          "El préstamo aparecerá en el sistema inmediatamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "modificar-estado-prestamo",
        titulo: "¿Cómo modificar el estado de un préstamo?",
        contenido: "Puedes cambiar manualmente el estado de cualquier préstamo.",
        pasos: [
          "Busca el préstamo que deseas modificar",
          "Haz clic en 'Editar'",
          "Cambia el estado: 'Activo', 'Devuelto' o 'Vencido'",
          "Modifica fechas si es necesario",
          "Guarda los cambios",
          "El estado se actualizará en todo el sistema"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "devolver-prestamo-admin",
        titulo: "¿Cómo marcar un préstamo como devuelto?",
        contenido: "Puedes procesar devoluciones en nombre de los usuarios.",
        pasos: [
          "Busca el préstamo en la tabla",
          "Haz clic en el botón verde 'Devolver'",
          "Confirma la devolución",
          "El estado cambiará a 'Devuelto'",
          "El libro volverá a estar disponible en el catálogo"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Préstamos",
            ruta: "/prestamos"
          }
        ]
      },
      {
        id: "eliminar-prestamo",
        titulo: "¿Cómo eliminar un préstamo?",
        contenido: "Los préstamos también usan borrado lógico.",
        pasos: [
          "Busca el préstamo que deseas eliminar",
          "Haz clic en el botón rojo 'Eliminar'",
          "Confirma la eliminación",
          "El préstamo se marcará como eliminado",
          "Puedes restaurarlo desde 'Elementos Eliminados' si es necesario"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Préstamos",
            ruta: "/prestamos"
          }
        ]
      }
    ]
  },
  {
    categoria: "Gestión de Multas",
    secciones: [
      {
        id: "ver-multas-admin",
        titulo: "¿Cómo ver todas las multas?",
        contenido: "Puedes consultar todas las multas del sistema y su estado de pago.",
        pasos: [
          "Ve al módulo 'Multas' desde el menú principal",
          "Verás una tabla con todas las multas generadas",
          "Cada multa muestra: usuario, libro, monto, fecha y estado",
          "Filtra por estado: 'Todas', 'Pendiente' o 'Pagada'"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Multas",
            ruta: "/multas"
          }
        ]
      },
      {
        id: "crear-multa",
        titulo: "¿Cómo crear una multa manualmente?",
        contenido: "Puedes crear multas adicionales fuera del sistema automático.",
        pasos: [
          "En el módulo 'Multas', haz clic en 'Nueva Multa'",
          "Selecciona el usuario",
          "Selecciona el libro relacionado",
          "Ingresa el monto de la multa",
          "Agrega una descripción o motivo (opcional)",
          "Confirma la creación",
          "La multa aparecerá como 'Pendiente' en el sistema"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Multas",
            ruta: "/multas"
          }
        ]
      },
      {
        id: "modificar-multa",
        titulo: "¿Cómo modificar una multa existente?",
        contenido: "Puedes ajustar montos o cambiar el estado de las multas.",
        pasos: [
          "Busca la multa que deseas modificar",
          "Haz clic en 'Editar'",
          "Modifica el monto, fecha o estado según sea necesario",
          "Guarda los cambios",
          "Los cambios se aplicarán inmediatamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Multas",
            ruta: "/multas"
          }
        ]
      },
      {
        id: "marcar-multa-pagada",
        titulo: "¿Cómo marcar una multa como pagada?",
        contenido: "Puedes registrar pagos de multas manualmente.",
        pasos: [
          "Busca la multa en estado 'Pendiente'",
          "Haz clic en el botón verde 'Marcar como Pagada'",
          "Confirma el pago",
          "El estado cambiará a 'Pagada'",
          "Se generará un recibo digital automáticamente"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Multas",
            ruta: "/multas"
          }
        ]
      },
      {
        id: "eliminar-multa",
        titulo: "¿Cómo eliminar una multa?",
        contenido: "Las multas también pueden eliminarse con borrado lógico.",
        pasos: [
          "Busca la multa que deseas eliminar",
          "Haz clic en el botón rojo 'Eliminar'",
          "Confirma la eliminación",
          "La multa se marcará como eliminada",
          "Puedes restaurarla desde 'Elementos Eliminados'"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Gestión de Multas",
            ruta: "/multas"
          }
        ]
      }
    ]
  },
  {
    categoria: "Categorías",
    secciones: [
      {
        id: "gestionar-categorias",
        titulo: "¿Cómo gestionar categorías de libros?",
        contenido: "Puedes crear, editar y eliminar categorías para organizar el catálogo.",
        pasos: [
          "Ve al módulo 'Categorías'",
          "Para crear: haz clic en 'Nueva Categoría', ingresa el nombre y guarda",
          "Para editar: haz clic en 'Editar', modifica el nombre y guarda",
          "Para eliminar: haz clic en 'Eliminar' y confirma",
          "Las categorías se usan para organizar y filtrar libros en el catálogo"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Categorías",
            ruta: "/categorias"
          }
        ]
      }
    ]
  },
  {
    categoria: "Reportes y Estadísticas",
    secciones: [
      {
        id: "ver-estadisticas",
        titulo: "¿Cómo ver las estadísticas del sistema?",
        contenido: "El módulo de estadísticas muestra métricas clave del sistema con gráficos.",
        pasos: [
          "Ve al módulo 'Estadísticas' desde el menú principal",
          "Verás tarjetas con totales: libros, usuarios, préstamos activos y multas pendientes",
          "Explora gráficos interactivos con datos visuales",
          "Las estadísticas se actualizan en tiempo real"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Estadísticas",
            ruta: "/estadisticas"
          }
        ]
      },
      {
        id: "generar-reportes",
        titulo: "¿Cómo generar reportes?",
        contenido: "Puedes exportar datos del sistema a Excel para análisis externo.",
        pasos: [
          "Ve al módulo 'Reportes'",
          "Selecciona el tipo de reporte que deseas generar:",
          "  - Reporte de libros",
          "  - Reporte de usuarios",
          "  - Reporte de préstamos",
          "  - Reporte de multas",
          "Haz clic en 'Exportar a Excel'",
          "El archivo se descargará automáticamente a tu computadora"
        ],
        accionesRapidas: [
          {
            texto: "Ir a Reportes",
            ruta: "/reportes"
          }
        ]
      }
    ]
  },
  {
    categoria: "Elementos Eliminados",
    secciones: [
      {
        id: "ver-eliminados",
        titulo: "¿Cómo ver elementos eliminados?",
        contenido: "El sistema mantiene un registro de todos los elementos eliminados que puedes consultar.",
        pasos: [
          "Cada módulo (Libros, Usuarios, Préstamos, Multas) tiene una opción de filtro",
          "Selecciona 'Eliminados' en el filtro de estado",
          "Verás todos los elementos marcados como eliminados",
          "Puedes restaurar cualquier elemento eliminado"
        ]
      },
      {
        id: "restaurar-elementos",
        titulo: "¿Cómo restaurar elementos eliminados?",
        contenido: "El borrado lógico permite recuperar elementos eliminados fácilmente.",
        pasos: [
          "Filtra para ver elementos eliminados",
          "Busca el elemento que deseas restaurar",
          "Haz clic en el botón 'Restaurar' o 'Activar'",
          "Confirma la restauración",
          "El elemento volverá a estar activo en el sistema",
          "Todos sus datos originales se mantendrán intactos"
        ]
      }
    ]
  },
  {
    categoria: "Logs de Auditoría",
    secciones: [
      {
        id: "ver-logs",
        titulo: "¿Cómo consultar los logs de auditoría?",
        contenido: "El sistema registra todas las acciones administrativas para seguridad y trazabilidad.",
        pasos: [
          "Ve al módulo 'Logs de Auditoría' desde el menú principal",
          "Verás una tabla con todas las acciones registradas",
          "Cada log muestra: fecha/hora, usuario, acción, módulo y detalles",
          "Filtra por módulo para ver acciones específicas",
          "Filtra por tipo de acción: CREAR, EDITAR, ELIMINAR, etc.",
          "Usa la búsqueda para encontrar logs específicos por usuario o detalles"
        ]
      },
      {
        id: "interpretar-logs",
        titulo: "¿Cómo interpretar los logs de auditoría?",
        contenido: "Los logs proporcionan información detallada sobre cada acción en el sistema.",
        pasos: [
          "Timestamp: Fecha y hora exacta de la acción",
          "Usuario: Nombre y email del administrador que realizó la acción",
          "Acción: Tipo de operación (CREAR, EDITAR, ELIMINAR, VER, etc.)",
          "Módulo: Sección del sistema afectada (LIBROS, USUARIOS, PRÉSTAMOS, etc.)",
          "Entidad ID: Identificador único del registro afectado",
          "Detalles: Información adicional en formato JSON con los datos modificados"
        ]
      }
    ]
  }
];

/**
 * Función para buscar contenido de ayuda
 * @param query - Término de búsqueda
 * @param role - Rol del usuario ('guest', 'cliente', 'admin')
 * @returns Array de secciones que coinciden con la búsqueda
 */
export function searchHelpContent(query: string, role: 'guest' | 'cliente' | 'admin'): HelpSection[] {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.toLowerCase().trim();
  const content = role === 'guest' ? helpNoRegistrado : role === 'cliente' ? helpCliente : helpAdmin;
  const results: HelpSection[] = [];

  content.forEach(categoria => {
    categoria.secciones.forEach(seccion => {
      // Buscar en título
      if (seccion.titulo.toLowerCase().includes(searchTerm)) {
        results.push(seccion);
        return;
      }
      
      // Buscar en contenido
      if (seccion.contenido.toLowerCase().includes(searchTerm)) {
        results.push(seccion);
        return;
      }
      
      // Buscar en pasos
      if (seccion.pasos && seccion.pasos.some(paso => paso.toLowerCase().includes(searchTerm))) {
        results.push(seccion);
        return;
      }
    });
  });

  return results;
}

/**
 * Función para obtener contenido contextual según la sección actual
 * @param role - Rol del usuario
 * @param currentSection - Sección actual donde se encuentra el usuario
 * @returns Contenido de ayuda filtrado para esa sección
 */
export function getContextualHelp(
  role: 'guest' | 'cliente' | 'admin',
  currentSection?: string
): HelpContent[] {
  const content = role === 'guest' ? helpNoRegistrado : role === 'cliente' ? helpCliente : helpAdmin;
  
  if (!currentSection) return content;

  // Mapeo de secciones a categorías
  const sectionToCategoryMap: Record<string, string> = {
    // Cliente
    'catalogo': 'Catálogo de Libros',
    'prestamos': 'Gestión de Préstamos',
    'multas': 'Multas',
    'perfil': 'Perfil de Usuario',
    // Admin
    'libros': 'Gestión de Libros',
    'usuarios': 'Gestión de Usuarios',
    'prestamos-admin': 'Gestión de Préstamos',
    'multas-admin': 'Gestión de Multas',
    'categorias': 'Categorías',
    'estadisticas': 'Reportes y Estadísticas',
    'reportes': 'Reportes y Estadísticas',
    'logs': 'Logs de Auditoría',
    'eliminados': 'Elementos Eliminados'
  };

  const categoryName = sectionToCategoryMap[currentSection];
  
  if (categoryName) {
    const filtered = content.filter(cat => cat.categoria === categoryName);
    return filtered.length > 0 ? filtered : content;
  }

  return content;
}