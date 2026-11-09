import { describe, expect, it } from "bun:test";
import { guestBookingSchema, staffBookingSchema } from "./container-booking";
const cargo = { container_size: "40ft", quantity: 1, origin_city: "Guangzhou", commodity: "Tiles", cargo_ready_date: "", delivery_city: "Accra", notes: "" };
describe("container booking access", () => {
  it("accepts a guest booking without an account", () => {
    const result = guestBookingSchema.parse({ ...cargo, full_name: "Guest Importer", phone: "0500000000", email: "", consent: true, website: "", customer_id: "forged" });
    expect(result.container_size).toBe("40ft");
    expect("customer_id" in result).toBe(false);
  });
  it("requires a customer for staff bookings", () => {
    expect(staffBookingSchema.safeParse(cargo).success).toBe(false);
    expect(staffBookingSchema.safeParse({ ...cargo, customer_id: "11111111-1111-4111-8111-111111111111" }).success).toBe(true);
  });
});