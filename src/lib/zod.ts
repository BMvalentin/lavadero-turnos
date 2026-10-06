import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Regex para permitir solo letras (incluyendo acentos y ñ) y espacios
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const registerSchema = loginSchema.extend({
  name: z.string()
    .min(2, "Nombre requerido")
    .regex(nameRegex, "El nombre solo debe contener letras y espacios"),
  telefono: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas nuevas no coinciden",
  path: ["confirmPassword"],
});


export const updateProfileSchema = z.object({
  name: z.string().min(2).regex(nameRegex, "El nombre solo debe contener letras"),
  telefono: z.string().optional(),
});

// Hora local del lavadero tal como la mandan los formularios: "2026-01-31T09:30" o con ":00".
export const horarioReservadoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Horario inválido");

// Se aceptan espacios y guiones al tipear ("AB 123 CD", "ABC-123") y se guarda limpia.
export const patenteSchema = z
  .string()
  .transform((s) => s.replace(/[\s-]/g, "").toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{5,10}$/, "Patente inválida"));

const montoSchema = z.coerce.number("Monto inválido").min(0, "Los montos no pueden ser negativos");

export const vehiculoServicioSchema = z
  .object({
    duracion: z.coerce
      .number("Duración inválida")
      .int("La duración debe ser en minutos enteros")
      .min(1, "La duración debe ser de al menos 1 minuto")
      .max(24 * 60, "La duración no puede superar las 24 horas"),
    precio: montoSchema,
    descuento: montoSchema,
    senia: montoSchema,
  })
  .refine((d) => d.descuento <= d.precio, { message: "El descuento no puede superar el precio" })
  .refine((d) => d.senia <= d.precio, { message: "La seña no puede superar el precio" });