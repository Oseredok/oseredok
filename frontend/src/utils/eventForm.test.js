import { describe, expect, it } from "vitest";
import { parseApiError, validateEventDatetimes } from "./eventForm";

describe("validateEventDatetimes", () => {
  it("rejects start datetime in the past", () => {
    const past = new Date(Date.now() - 60_000).toISOString().slice(0, 16);
    const future = new Date(Date.now() + 3_600_000).toISOString().slice(0, 16);
    expect(validateEventDatetimes(past, future)).toBe("Дата початку не може бути в минулому");
  });

  it("rejects end datetime before start", () => {
    const start = new Date(Date.now() + 7_200_000).toISOString().slice(0, 16);
    const end = new Date(Date.now() + 3_600_000).toISOString().slice(0, 16);
    expect(validateEventDatetimes(start, end)).toBe("Дата закінчення має бути після дати початку");
  });

  it("accepts valid future datetimes", () => {
    const start = new Date(Date.now() + 3_600_000).toISOString().slice(0, 16);
    const end = new Date(Date.now() + 7_200_000).toISOString().slice(0, 16);
    expect(validateEventDatetimes(start, end)).toBeNull();
  });
});

describe("parseApiError", () => {
  it("returns string detail", () => {
    expect(parseApiError({ detail: "Помилка" })).toBe("Помилка");
  });

  it("joins validation error messages", () => {
    expect(parseApiError({ detail: [{ msg: "One" }, { msg: "Two" }] })).toBe("One. Two");
  });
});
