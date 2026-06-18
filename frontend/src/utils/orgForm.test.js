import { describe, expect, it } from "vitest";
import { emptyForm } from "./orgForm";

describe("orgForm", () => {
  it("returns empty defaults when no org is provided", () => {
    expect(emptyForm()).toEqual({
      name: "",
      handle: "",
      description: "",
      category: "",
      faculty: "",
      contact_email: "",
      phone: "",
      instagram: "",
      telegram: "",
      website: "",
      status: "active",
    });
  });

  it("maps organization fields into the form", () => {
    expect(
      emptyForm({
        name: "КНУ",
        handle: "knu",
        category: "academic",
        status: "pending",
      })
    ).toMatchObject({
      name: "КНУ",
      handle: "knu",
      category: "academic",
      status: "pending",
    });
  });

  it("keeps empty strings for missing optional fields", () => {
    expect(emptyForm({ name: "Only name" }).phone).toBe("");
    expect(emptyForm({ name: "Only name" }).website).toBe("");
  });
});
