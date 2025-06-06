"use client"
import { useEffect, useState } from "react";
import "./style.css";

type Task = {
  id: number;
  title: string;
  done: boolean;
};

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetch(`${apiUrl}/tasks`)
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const res = await fetch(`${apiUrl}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, done: false }),
    });
    if (res.ok) {
      const addedTask = await res.json();
      setTasks([...tasks, addedTask]);
      setNewTask("");
    }
  };

  const toggleDone = async (id: number, done: boolean) => {
    const res = await fetch(`${apiUrl}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t));
    }
  };

  const deleteTask = async (id: number) => {
    const res = await fetch(`${apiUrl}/tasks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const startEditing = (id: number, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const finishEditing = async (id: number) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    const res = await fetch(`${apiUrl}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === id ? { ...t, title: editingTitle } : t));
    }
    setEditingId(null);
  };

  return (
    <main className="todo-main">
      <div className="todo-container">
        <h1 className="todo-title">📝 My Todo List</h1>
        <div className="todo-input-row">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button onClick={addTask} className="todo-add-btn">
            Add
          </button>
        </div>
        <ul className="todo-list">
          {[...tasks]
            .sort((a, b) => Number(a.done) - Number(b.done))
            .map((task, index) => (
              <li
                key={task.id}
                className={`todo-list-item${task.done ? " done" : ""}`}
              >
                <label className="todo-checkbox-label">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task.id, task.done)}
                    className="todo-checkbox"
                  />
                  {editingId === task.id ? (
                    <input
                      className="todo-edit-input"
                      value={editingTitle}
                      autoFocus
                      onChange={e => setEditingTitle(e.target.value)}
                      onBlur={() => finishEditing(task.id)}
                      onKeyDown={e => {
                        if (e.key === "Enter") finishEditing(task.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="todo-task-title">
                      {task.title}
                    </span>
                  )}
                </label>
                <div className="todo-actions">
                  <button
                    className="todo-edit-btn"
                    onClick={() => startEditing(task.id, task.title)}
                    title="Edit"
                    disabled={editingId === task.id}
                    style={{ marginRight: 8 }}
                  >
         
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ verticalAlign: "middle" }}
                    >
                      <path
                        d="M14.85 2.85a1.2 1.2 0 0 1 1.7 1.7l-9.1 9.1-2.1.4.4-2.1 9.1-9.1ZM3 17h14v-2H3v2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <button
                    className="todo-delete-btn"
                    onClick={() => deleteTask(task.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}