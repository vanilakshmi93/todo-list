
import { useState, useEffect, type ReactNode } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./components/Auth/Signup.tsx";
import Login from "./components/Auth/Login.tsx";
import TodoList from "./components/Todos/TodoList.tsx";
import ThemeToggle from "./components/ThemeToggle.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import axios, { AxiosError } from "axios";
import type { Todo } from "./components/Todos/TodoList";

axios.defaults.withCredentials = true;

const API_URL = "https://todo-list-backend-25zw.onrender.com";

//const API_URL = 'http://localhost:5000'; // Adjust as needed
// Set default axios auth header on app initialization
const token = localStorage.getItem("accessToken");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (axios.isAxiosError(error) && error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [, setIsAuthenticated] = useState(false);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.get(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setTodos(response.data);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      console.error("Error fetching todos:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setIsAuthenticated(false);
      }
    }
  };

  // Check authentication and refresh token on initial load
  useEffect(() => {
    const checkAuthAndRefreshToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setIsAuthenticated(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
          await fetchTodos();
        } catch (error) {
          console.error("Silent token refresh failed:", error);
          fetchTodos();
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthAndRefreshToken();
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem("accessToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
    fetchTodos();
  };

  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoList todos={todos} fetchTodos={fetchTodos} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
