import { describe, expect, it } from "vitest";
import { canCreateEvent, isAdmin, isOrganizer, roleLabel } from "./roles";

describe("roles", () => {
  it("detects admin role", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("student")).toBe(false);
  });

  it("allows event creation for admin and organizers", () => {
    expect(canCreateEvent("admin")).toBe(true);
    expect(canCreateEvent("org_owner")).toBe(true);
    expect(canCreateEvent("organizer")).toBe(true);
    expect(canCreateEvent("student")).toBe(false);
  });

  it("detects organizer roles", () => {
    expect(isOrganizer("org_owner")).toBe(true);
    expect(isOrganizer("organizer")).toBe(true);
    expect(isOrganizer("admin")).toBe(false);
  });

  it("returns Ukrainian role labels", () => {
    expect(roleLabel("admin")).toBe("Адмін");
    expect(roleLabel("student")).toBe("Студент");
    expect(roleLabel("org_owner")).toBe("Організатор");
    expect(roleLabel("organizer")).toBe("Організатор");
    expect(roleLabel(undefined)).toBe("—");
  });
});
