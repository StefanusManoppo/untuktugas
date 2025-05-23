import React, { useState } from "react";
import "./styles.css";

function App() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);

  const handleChange = (event) => {
    setTask(event.target.value);
  };

  const addTodo = () => {
    if (task.trim()) {
      setTodos([...todos, task]);
      setTask("");
    }
  };

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <h1>ToDo List</h1>
      <div>
        <input
          type="text"
          placeholder="Add a task"
          value={task}
          onChange={handleChange}
        />
        <br />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li
            key={index}
            onClick={() => removeTodo(index)}
            style={{ cursor: "pointer" }}
          >
            {todo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
