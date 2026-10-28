export type EstadoPublicacion = 'borrador' | 'publicado';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string[];
  imagenUrl: string | null;
  enlaceUrl: string | null;
  estadoPublicacion: EstadoPublicacion;
}

export type NuevoProyecto = Omit<Proyecto, 'id'>;
