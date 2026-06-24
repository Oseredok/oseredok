import { describe, expect, it, vi, beforeEach } from "vitest";
import { fileToDataUrl } from "./orgForm";
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


function makeImage({ width = 100, height = 100, fail = false } = {}) {
  const img = {
    width,
    height,
    onload: null,
    onerror: null,
    set src(_) {
      if (fail) setTimeout(() => this.onerror(), 0);
      else {
        this.width = width;
        this.height = height;
        setTimeout(() => this.onload(), 0);
      }
    },
  };
  return img;
}

function makeCanvas({ toDataUrl = () => "data:image/jpeg;base64,abc", noCtx = false } = {}) {
  const ctx = noCtx
    ? null
    : { drawImage: vi.fn() };

  return {
    width: 0,
    height: 0,
    getContext: () => ctx,
    toDataURL: vi.fn(toDataUrl),
  };
}

function makeFile(content = "data:image/png;base64,abc") {
  return {
    _content: content,
  };
}

function mockFileReader(result, fail = false) {
  return class {
    readAsDataURL() {
      if (fail) setTimeout(() => this.onerror(new Error("read error")), 0);
      else {
        this.result = result;
        setTimeout(() => this.onload(), 0);
      }
    }
  };
}

// --- Тести ---

describe("fileToDataUrl", () => {
  beforeEach(() => {
    // Мок Image
    vi.stubGlobal("Image", vi.fn(() => makeImage()));

    // Мок canvas
    vi.stubGlobal(
      "document",
      {
        createElement: vi.fn(() => makeCanvas()),
      }
    );
  });

  it("відхиляє якщо FileReader повертає не рядок", async () => {
    vi.stubGlobal("FileReader", mockFileReader(null));

    await expect(fileToDataUrl(makeFile())).rejects.toThrow("Невірний формат зображення");
  });

  it("відхиляє якщо dataUrl не починається з data:image/", async () => {
    vi.stubGlobal("FileReader", mockFileReader("data:application/pdf;base64,abc"));

    await expect(fileToDataUrl(makeFile())).rejects.toThrow("Невірний формат зображення");
  });

  it("відхиляє якщо FileReader кидає помилку", async () => {
    vi.stubGlobal("FileReader", mockFileReader(null, true));

    await expect(fileToDataUrl(makeFile())).rejects.toThrow("read error");
  });

  it("відхиляє якщо Image не завантажується", async () => {
    vi.stubGlobal("FileReader", mockFileReader("data:image/png;base64,abc"));
    vi.stubGlobal("Image", vi.fn(() => makeImage({ fail: true })));

    await expect(fileToDataUrl(makeFile())).rejects.toThrow("Не вдалося обробити зображення");
  });

  it("повертає dataUrl якщо canvas не має ctx", async () => {
    const dataUrl = "data:image/png;base64,abc";
    vi.stubGlobal("FileReader", mockFileReader(dataUrl));
    vi.stubGlobal("Image", vi.fn(() => makeImage()));
    vi.stubGlobal("document", {
      createElement: vi.fn(() => makeCanvas({ noCtx: true })),
    });

    const result = await fileToDataUrl(makeFile());
    expect(result).toBe(dataUrl);
  });

  it("масштабує зображення якщо воно більше maxSize", async () => {
    const dataUrl = "data:image/png;base64,abc";
    vi.stubGlobal("FileReader", mockFileReader(dataUrl));
    vi.stubGlobal("Image", vi.fn(() => makeImage({ width: 1000, height: 500 })));

    const canvas = makeCanvas({ toDataUrl: () => "data:image/jpeg;base64,small" });
    vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });

    const result = await fileToDataUrl(makeFile(), { maxSize: 256 });
    expect(canvas.width).toBeLessThanOrEqual(256);
    expect(result).toBe("data:image/jpeg;base64,small");
  });

  it("зменшує якість якщо результат занадто великий", async () => {
    const dataUrl = "data:image/png;base64,abc";
    vi.stubGlobal("FileReader", mockFileReader(dataUrl));
    vi.stubGlobal("Image", vi.fn(() => makeImage()));

    // перші кілька викликів повертають великий розмір, потім малий
    let calls = 0;
    const canvas = makeCanvas({
      toDataUrl: () => {
        calls++;
        return calls <= 3
          ? "data:image/jpeg;base64," + "x".repeat(300000)
          : "data:image/jpeg;base64,small";
      },
    });
    vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });

    const result = await fileToDataUrl(makeFile(), { maxBytes: 200000 });
    expect(canvas.toDataURL.mock.calls.length).toBeGreaterThan(1);
    expect(result).toContain("data:image/jpeg");
  });
});