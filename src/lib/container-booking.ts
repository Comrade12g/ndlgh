import { z } from "zod";

export const containerBookingSchema = z.object({
  container_size: z.enum(["20ft", "40ft", "40hq"]),
  quantity: z.coerce.number().int().min(1).max(50),
  origin_city: z.string().trim().min(2).max(80),
  commodity: z.string().trim().min(2).max(200),
  cargo_ready_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  delivery_city: z.string().trim().max(80),
  notes: z.string().trim().max(1000),
});
export const guestBookingSchema = containerBookingSchema.extend({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,30}$/),
  email: z.string().trim().email().max(255).or(z.literal("")),
  consent: z.literal(true),
  website: z.string().max(0),
});
export const staffBookingSchema = containerBookingSchema.extend({ customer_id: z.string().uuid() });
export function bookingFields(data: z.infer<typeof containerBookingSchema>) {
  return { container_size: data.container_size, quantity: data.quantity, origin_city: data.origin_city, commodity: data.commodity, cargo_ready_date: data.cargo_ready_date || null, delivery_city: data.delivery_city || null, notes: data.notes || null };
}