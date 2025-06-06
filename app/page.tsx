"use client";

import { Task } from "@/types";
import { useEffect, useState } from "react";

export default function Home() {
const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetch("http://localhost:8080/tasks")
      .then((res) => res.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>My Todo List</h1>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} {t.done ? "(done)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
