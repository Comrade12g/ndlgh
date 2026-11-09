import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingFields, guestBookingSchema, staffBookingSchema } from "./container-booking";

export const submitContainerBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => guestBookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const authorization = getRequestHeader("authorization");
    let customerId: string | null = null;
    if (authorization) {
      if (!authorization.startsWith("Bearer ")) throw new Error("Please sign in again.");
      const { data: auth, error } = await supabaseAdmin.auth.getUser(authorization.slice(7));
      if (error || !auth.user) throw new Error("Please sign in again.");
      customerId = auth.user.id;
    }
    const result = customerId
      ? await supabaseAdmin.from("container_bookings").insert({ ...bookingFields(data), customer_id: customerId }).select("code").single()
      : await supabaseAdmin.from("guest_container_bookings").insert({ ...bookingFields(data), full_name: data.full_name, phone: data.phone, email: data.email || null }).select("code").single();
    if (result.error || !result.data) throw new Error("Could not send your booking. Please try again.");
    return { code: result.data.code, customerBooking: Boolean(customerId) };
  });

export const createStaffContainerBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => staffBookingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isStaff, error: roleError } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (roleError || !isStaff) throw new Error("Staff access required.");
    const { data: booking, error } = await context.supabase.from("container_bookings").insert({ ...bookingFields(data), customer_id: data.customer_id }).select("code").single();
    if (error || !booking) throw new Error("Could not create the booking. Please try again.");
    return { code: booking.code };
  });