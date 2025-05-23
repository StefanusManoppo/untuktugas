import React, { useState } from "react";
import "./styles.css";

function App() {
  const [inputText, setInputText] = useState("");
  const [displayText, setDisplayText] = useState("");

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setDisplayText(inputText);
  };

  return (
    <div className="container">
      <h1>Hello {displayText}</h1>
      <form>
        <input
          type="text"
          placeholder="What's your name?"
          value={inputText}
          onChange={handleChange}
        />
        <br />
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
