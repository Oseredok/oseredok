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
});
