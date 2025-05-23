import React, { useState } from "react";
import "./styles.css";

function App() {
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Contact:", contact);
  };

  return (
    <div className="container">
      <h1>
        Hello {contact.firstName} {contact.lastName}
      </h1>
      <div>
        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          value={contact.firstName}
          onChange={handleChange}
        />
        <br />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={contact.lastName}
          onChange={handleChange}
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={contact.email}
          onChange={handleChange}
        />
        <br />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default App;
