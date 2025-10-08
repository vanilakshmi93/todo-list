import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import axios from "axios";

type Todo = {
  title: string;
  description: string;
  dueDate?: string;
  status?: string;
  _id: string;
  createdAt?: string;
};

type Props = {
  todo: Todo;
  fetchTodos: () => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
};

const TodoItem: React.FC<Props> = ({ todo, fetchTodos, isSelected, onToggleSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || "");
  const [editedDueDate, setEditedDueDate] = useState(todo.dueDate || "");
  const [editedStatus, setEditedStatus] = useState(todo.status || "pending");

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://todo-list-backend-25zw.onrender.com' 
    : 'http://localhost:5000';
    
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/todos/${todo._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true
      });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(
        `${API_URL}/todos/${todo._id}`,
        {
          title: editedTitle,
          description: editedDescription,
          dueDate: editedDueDate,
          status: editedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true
        },
      );
      setIsEditing(false);
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/todos/${todo._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true
        },
      );
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  return (
    <div className="border p-4 mb-2 rounded shadow-sm">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Description"
          />
          <input
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded">
              Cancel
            </button>
            <button onClick={handleEdit} className="px-3 py-1 bg-blue-500 text-white rounded">
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(todo._id)}
                className="h-4 w-4"
              />
              <h4 className={`font-bold ${todo.status === "completed" ? "line-through text-gray-500" : ""}`}>
                {todo.title}
              </h4>
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="ml-2 text-sm text-blue-600 underline"
              >
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 transition"
                aria-label="Edit Task"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Delete Task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="mt-2 text-gray-700">
              {todo.description && <p className="mb-1">Description: {todo.description}</p>}
              {todo.dueDate && (
                <p className="text-sm text-gray-500">Due: {new Date(todo.dueDate).toLocaleDateString()}</p>
              )}
              {todo.createdAt && (
                <p className="text-sm text-gray-500 mt-1">Created At: {new Date(todo.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  todo.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {todo.status || "pending"}
              </span>
            </div>
            {todo.status !== "completed" ? (
              <button
                onClick={() => handleStatusChange("completed")}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
                Mark as Completed
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("pending")}
                className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
              >
                Mark as Pending
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TodoItem;
