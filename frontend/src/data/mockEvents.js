export const mockEvents = [
  {
    event_id: "evt-1",
    organization_id: "org-1",
    title: "Відкритий дебатний турнір",
    description:
      "Щорічний турнір студентських дебатних клубів НаУКМА. Формат BP, 16 команд, призи для переможців.",
    location: "Аудиторія 301, корпус 1",
    start_datetime: "2026-03-15T14:00:00",
    end_datetime: "2026-03-15T18:00:00",
    max_participants: 64,
    category: "Debates",
    org_name: "Debate Club",
  },
  {
    event_id: "evt-2",
    organization_id: "org-2",
    title: "Hackathon NaUKMA 2026",
    description:
      "24-годинний хакатон для IT-студентів. Команди по 3–4 людини, ментори з індустрії, призовий фонд.",
    location: "IT Hub, корпус 7",
    start_datetime: "2026-04-20T10:00:00",
    end_datetime: "2026-04-21T10:00:00",
    max_participants: 120,
    category: "IT",
    org_name: "IT Society",
  },
  {
    event_id: "evt-3",
    organization_id: "org-3",
    title: "Виставка студентського мистецтва",
    description:
      "Експозиція робіт студентів художнього факультету: живопис, графіка, інсталяції.",
    location: "Галерея НаУКМА",
    start_datetime: "2026-05-05T11:00:00",
    end_datetime: "2026-05-05T19:00:00",
    max_participants: null,
    category: "Art",
    org_name: "Art Collective",
  },
  {
    event_id: "evt-4",
    organization_id: "org-4",
    title: "Science Fair 2026",
    description:
      "Презентація наукових проєктів студентів. Постери, демо-стенди, зворотний зв'язок від викладачів.",
    location: "Актова зала",
    start_datetime: "2026-05-22T09:00:00",
    end_datetime: "2026-05-22T17:00:00",
    max_participants: 200,
    category: "Science",
    org_name: "Science Club",
  },
  {
    event_id: "evt-5",
    organization_id: "org-5",
    title: "Турнір з волейболу",
    description:
      "Міжфакультетський турнір з волейболу. Збірні команди, груповий етап і плей-оф.",
    location: "Спортзал університету",
    start_datetime: "2026-06-01T16:00:00",
    end_datetime: "2026-06-01T21:00:00",
    max_participants: 48,
    category: "Sport",
    org_name: "Sport NaUKMA",
  },
  {
    event_id: "evt-6",
    organization_id: "org-2",
    title: "Workshop: React для початківців",
    description:
      "Практичний воркшоп з основ React: компоненти, стан, хуки. Ноутбук обов'язковий.",
    location: "Комп'ютерна лабораторія 204",
    start_datetime: "2026-03-28T15:00:00",
    end_datetime: "2026-03-28T18:00:00",
    max_participants: 30,
    category: "IT",
    org_name: "IT Society",
  },
];

export function filterEvents(events, { search = "", category = "Всі" } = {}) {
  return events.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.org_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Всі" || e.category === category;
    return matchSearch && matchCategory;
  });
}

export function getEventCategories(events) {
  return [...new Set(events.map((e) => e.category).filter(Boolean))];
}
