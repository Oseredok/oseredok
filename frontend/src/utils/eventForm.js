export function validateEventDatetimes(startDatetime, endDatetime) {
  if (!startDatetime || !endDatetime) {
    return "Вкажіть дату та час початку і закінчення";
  }

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Невірний формат дати";
  }
  if (start < now) {
    return "Дата початку не може бути в минулому";
  }
  if (end <= start) {
    return "Дата закінчення має бути після дати початку";
  }
  return null;
}

export function parseApiError(data, fallback = "Помилка при збереженні") {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(". ") || fallback;
  }
  return fallback;
}

export function minDatetimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
