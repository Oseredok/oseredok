function compressDataUrl(dataUrl, { maxSize = 256, maxBytes = 200000 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;
      let result = canvas.toDataURL("image/jpeg", quality);
      while (result.length > maxBytes && quality > 0.4) {
        quality -= 0.1;
        result = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(result);
    };
    img.onerror = () => reject(new Error("Не вдалося обробити зображення"));
    img.src = dataUrl;
  });
}

export function fileToDataUrl(file, options) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        reject(new Error("Невірний формат зображення"));
        return;
      }
      compressDataUrl(dataUrl, options).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function emptyForm(org = {}) {
  return {
    name: org.name || "",
    handle: org.handle || "",
    description: org.description || "",
    category: org.category || "",
    faculty: org.faculty || "",
    contact_email: org.contact_email || "",
    phone: org.phone || "",
    instagram: org.instagram || "",
    telegram: org.telegram || "",
    website: org.website || "",
    status: org.status || "active",
  };
}
