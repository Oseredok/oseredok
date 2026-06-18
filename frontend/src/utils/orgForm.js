export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
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
