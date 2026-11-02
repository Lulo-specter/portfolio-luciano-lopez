// Union de los unicos estados de publicacion admitidos por la aplicacion.
export type EstadoPublicacion = 'borrador' | 'publicado';

// Forma de un proyecto completo tal como lo maneja el codigo TypeScript.
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string[];
  imagenUrl: string | null;
  enlaceUrl: string | null;
  estadoPublicacion: EstadoPublicacion;
}

// Datos necesarios para crear un proyecto antes de que la base genere su id.
export type NuevoProyecto = Omit<Proyecto, 'id'>;
