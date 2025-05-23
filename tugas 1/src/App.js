import React, { useState } from "react";
import "./styles.css";

function App() {
  const [inputText, setInputText] = useState("");
  const [displayText, setDisplayText] = useState("");

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleClick = () => {
    setDisplayText(inputText);
  };

  return (
    <div className="container">
      <h1>Hello {displayText}</h1>
      <div>
        <input
          type="text"
          placeholder="What's your name?"
          value={inputText}
          onChange={handleChange}
        />
        <br />
        <button onClick={handleClick}>Submit</button>
      </div>
    </div>
  );
}

export default App;
