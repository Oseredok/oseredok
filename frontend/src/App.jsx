import { useEffect, useState } from "react";

function App() {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/organizations")
      .then((response) => response.json())
      .then((data) => {
        setOrganizations(data);
      });
  }, []);

  return (
    <div>
      <h1>Student Organizations</h1>

      {organizations.map((org) => (
        <div key={org.organization_id}>
          <h2>{org.name}</h2>
          <p>{org.description}</p>
          <p>
            <strong>Category:</strong> {org.category}
          </p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;