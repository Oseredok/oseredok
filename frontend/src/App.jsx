import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function App() {
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState("home"); // home | register | login
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    const e = localStorage.getItem("email");
    return t ? { token: t, email: e } : null;
  });

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then((r) => r.json())
      .then(setOrganizations);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.includes("@"))
      e.email = "Некоректний email";
    if (page === "register" && !form.email.endsWith("@ukma.edu.ua"))
      e.email = "Потрібен email @ukma.edu.ua";
    if (form.password.length < 8)
      e.password = "Мінімум 8 символів";
    if (page === "register" && form.password !== form.confirm)
      e.confirm = "Паролі не збігаються";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValid =
    form.email.length > 0 &&
    form.password.length >= 8 &&
    (page === "login" || form.confirm === form.password);

  const handleSubmit = async () => {
    if (!validate()) return;
    setServerMsg("");
    const endpoint = page === "register" ? "/auth/register" : "/auth/login";
    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      if (page === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        setUser({ token: data.token, email: data.email });
      }
      setPage("home");
      setForm({ email: "", password: "", confirm: "" });
    } else if (res.status === 409) {
      setServerMsg("Цей email вже зареєстровано");
    } else if (res.status === 401) {
      setServerMsg("Невірний email або пароль");
    } else {
      setServerMsg("Помилка сервера, спробуйте пізніше");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const F = ({ field, label, type = "text" }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        placeholder={label}
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
      />
      {errors[field] && (
        <span style={{ color: "red", fontSize: 13 }}>{errors[field]}</span>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
          Осередок
        </h1>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>{user.email}</span>
              <button onClick={logout}>Вийти</button>
            </>
          ) : (
            <>
              <button onClick={() => { setPage("login"); setServerMsg(""); }}>Увійти</button>
              <button onClick={() => { setPage("register"); setServerMsg(""); }} style={{ marginLeft: 8 }}>
                Реєстрація
              </button>
            </>
          )}
        </div>
      </div>

      {(page === "register" || page === "login") && (
        <div style={{ border: "1px solid #ddd", padding: 24, borderRadius: 8, marginTop: 16 }}>
          <h2>{page === "register" ? "Реєстрація" : "Вхід"}</h2>
          <F field="email" label="Email" type="email" />
          <F field="password" label="Пароль" type="password" />
          {page === "register" && (
            <F field="confirm" label="Підтвердження паролю" type="password" />
          )}
          {serverMsg && <p style={{ color: "red" }}>{serverMsg}</p>}
          <button onClick={handleSubmit} disabled={!isValid}>
            {page === "register" ? "Зареєструватись" : "Увійти"}
          </button>
        </div>
      )}

      {page === "home" && (
        <>
          <h2>Організації</h2>
          {organizations.map((org) => (
            <div key={org.organization_id} style={{ marginBottom: 16 }}>
              <h3>{org.name}</h3>
              <p>{org.description}</p>
              <p><strong>Категорія:</strong> {org.category}</p>
              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;