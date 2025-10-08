//import type { FC, useState, FormEvent } from "react";
import { useState, type FC, type FormEvent } from "react";


import axios from "axios";

interface TodoFormProps {
  onSuccess: () => void;
}

const TodoForm: FC<TodoFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", { title, description, dueDate });

    try {
      const res = await axios.post(
        "https://todo-list-backend-25zw.onrender.com/todos",
        { title, description, dueDate },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("Server replied:", res.data);
      setTitle("");
      setDescription("");
      setDueDate("");
      onSuccess();             
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border rounded p-2"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full border rounded p-2"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border rounded p-2"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Add Task
      </button>
    </form>
  );
};

export default TodoForm;
