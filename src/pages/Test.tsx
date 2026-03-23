import { useState } from "react";
import { Trash2 } from "lucide-react";

interface TaskBubbleProps {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "done" | "archived";
  type: "normal" | "critical";
  createdAt: string;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onTypeChange: (taskId: string, newType: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const statusColors = {
  pending: "bg-yellow-600 hover:bg-yellow-700",
  in_progress: "bg-blue-600 hover:bg-blue-700",
  done: "bg-green-600 hover:bg-green-700",
  archived: "bg-gray-600 hover:bg-gray-700",
};

const typeColors = {
  normal: "bg-slate-700 hover:bg-slate-600",
  critical: "bg-red-600 hover:bg-red-700",
};

const statusOptions = ["pending", "in_progress", "done", "archived"];
const typeOptions = ["normal", "critical"];

export function TaskBubble({
  id,
  name,
  status,
  type,
  createdAt,
  onStatusChange,
  onTypeChange,
  onDelete,
}: TaskBubbleProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    await onStatusChange(id, newStatus);
  };

  const handleTypeChange = async (newType: string) => {
    await onTypeChange(id, newType);
  };

  const handleDelete = async () => {
    if (confirm("Delete this task?")) {
      setIsDeleting(true);
      await onDelete(id);
    }
  };
  console.log("Rendering TaskBubble:", {
    id,
    name,
    status,
    type,
    createdAt,
    onStatusChange,
    onTypeChange,
    onDelete,
  });

  const formattedDate = format(new Date(createdAt), "EEE, MMM d"); // Wed, Jan 21

  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-md">

        {/* 🔼 STATUS OPTIONS (TOP) */}
        <div className="flex gap-2 justify-end mb-2 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleStatusChange(opt)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                ${
                  opt === status
                    ? `${statusColors[opt]} text-white`
                    : "border border-gray-500 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {opt.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* 💬 CHAT BUBBLE */}
        <div className="bg-emerald-700 rounded-2xl px-4 py-3 flex items-center gap-3">

          {/* MESSAGE + DATE */}
          <div className="flex-1">
            <p className="text-white text-sm break-words">{name}</p>
            <p className="text-emerald-200 text-xs mt-1">
              {formattedDate}
            </p>
          </div>

          {/* DELETE */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* 🔽 TYPE OPTIONS (BOTTOM) */}
        <div className="flex gap-2 justify-end mt-2">
          {typeOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleTypeChange(opt)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  opt === type
                    ? `${typeColors[opt]} text-white`
                    : "border border-gray-500 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export interface ParsedCommand {
  command: string;
  name?: string;
  type?: "normal" | "critical";
  status?: "pending" | "in_progress" | "done" | "archived";
  error?: string;
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();

  // Parse: add [name] -t normal|critical -s pending|in_progress|done|archived
  const addMatch = trimmed.match(
    /^add\s+(.+?)(?:\s+-t\s+(normal|critical))?(?:\s+-s\s+(pending|in_progress|done|archived))?$/i,
  );

  if (addMatch) {
    const name = addMatch[1].trim();
    const type = (addMatch[2] || "normal").toLowerCase() as
      | "normal"
      | "critical";
    const status = (addMatch[3] || "pending").toLowerCase() as
      | "pending"
      | "in_progress"
      | "done"
      | "archived";

    if (!name) {
      return {
        command: "add",
        error:
          "Task name is required. Usage: add [name] -t normal|critical -s pending|in_progress|done|archived",
      };
    }

    return {
      command: "add",
      name,
      type,
      status,
    };
  }

  return {
    command: "unknown",
    error: `Unknown command. Supported command: add [name] -t normal|critical -s pending|in_progress|done|archived`,
  };
}

import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "done" | "archived";
  type: "normal" | "critical";
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  timestamp: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter] = useState<{ status?: string; type?: string }>({});
  const [search] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [filter, search]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tasks]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.type) params.append("type", filter.type);
      if (search) params.append("search", search);

      //   const response = await fetch(`/api/tasks?${params}`);
      //   const data = await response.json();
      const data: Task[] = [
        {
          id: "5946c6b3-288f-456b-ab7c-ab096999862c",
          name: "task",
          type: "normal",
          status: "pending",
          categoryId: "b833b17e-7464-4282-a23b-69929dec1d21",
          createdAt: "2026-01-21T02:52:23.458Z",
          updatedAt: "2026-01-21T02:52:23.458Z",
        },
        {
          id: "d87362f2-7264-4c5a-9427-3aca0f65cb18",
          name: "taskd",
          type: "normal",
          status: "in_progress",
          categoryId: "b833b17e-7464-4282-a23b-69929dec1d21",
          createdAt: "2026-01-21T02:52:51.515Z",
          updatedAt: "2026-01-21T03:03:08.886Z",
        },
      ];
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      addSystemMessage("Failed to fetch tasks");
    }
  };

  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "system",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Check if it's an add command
      if (input.toLowerCase().startsWith("add ")) {
        const parsed = parseCommand(input);
        if (parsed.error) {
          addSystemMessage(parsed.error);
          return;
        }

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        });

        if (!response.ok) throw new Error("Failed to create task");
        await fetchTasks();
        addSystemMessage(`✓ Task "${parsed.name}" created successfully!`);
      } else {
        addSystemMessage(
          "Command not recognized. Use: add [name] -t normal|critical -s pending|in_progress|done|archived",
        );
      }
    } catch (error) {
      addSystemMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update task");
      await fetchTasks();
    } catch (error) {
      addSystemMessage(
        `Error updating task: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      await fetchTasks();
      addSystemMessage("✓ Task deleted");
    } catch (error) {
      addSystemMessage(
        `Error deleting task: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  //   const filteredTasks = tasks.filter((task) => {
  //     if (search && !task.name.toLowerCase().includes(search.toLowerCase()))
  //       return false;
  //     if (filter.status && task.status !== filter.status) return false;
  //     if (filter.type && task.type !== filter.type) return false;
  //     return true;
  //   });
  const filteredTasks = tasks;

  console.log("Filtered Tasks:", filteredTasks);
  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <h1 className="text-white font-semibold">Task Chat Manager</h1>
        <p className="text-slate-400 text-xs">
          Add and manage tasks via chat commands
        </p>
      </div>

      {/* Filter Bar */}
      {/* <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-32 bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm placeholder-slate-500 border border-slate-700 focus:border-blue-500 outline-none"
        />
        <select
          value={filter.status || ""}
          onChange={(e) =>
            setFilter({ ...filter, status: e.target.value || undefined })
          }
          className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 focus:border-blue-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filter.type || ""}
          onChange={(e) =>
            setFilter({ ...filter, type: e.target.value || undefined })
          }
          className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 focus:border-blue-500 outline-none"
        >
          <option value="">All Types</option>
          <option value="normal">Normal</option>
          <option value="critical">Critical</option>
        </select>
      </div> */}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTasks.length === 0 && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <p className="text-lg font-semibold mb-2">No tasks yet</p>
              <p className="text-sm">
                Create your first task by typing a command
              </p>
              <p className="text-xs mt-3 text-slate-500">
                Example: add Setup database -t normal -s pending
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <span className="text-slate-500 text-xs">Today</span>
            </div>

            {/* Messages and Tasks */}
            {/* {tasks.map((msg) => (
              <div key={msg.id} className="flex justify-start">
                <div
                  className={`${msg.type === "system" ? "bg-slate-800 text-slate-300" : "bg-slate-700 text-white"} rounded-2xl px-4 py-2 text-sm max-w-md`}
                >
                  {msg.content}
                  <span className="text-xs ml-2 opacity-70">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))} */}

            {/* {filteredTasks.map((task) => (
              <div key={task.id} className="flex justify-end mb-4">
                <div className="max-w-md">
                  <div className="bg-emerald-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-white text-sm wrap-break-word">
                        {task.name}
                      </p>
                    </div>
                    <span className="text-emerald-100 text-xs whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-emerald-100 text-lg">✓</span>
                  </div>
                </div>
              </div>
            ))} */}

            {/* Task Bubbles */}
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex justify-end mb-4">
                <div className="max-w-md">
                  <TaskBubble
                    key={task.id}
                    id={task.id}
                    name={task.name}
                    status={task.status}
                    type={task.type}
                    createdAt={task.createdAt}
                    onStatusChange={(_taskId, newStatus) =>
                      handleUpdateTask(task.id, {
                        status: newStatus as Task["status"],
                      })
                    }
                    onTypeChange={(_taskId, newType) =>
                      handleUpdateTask(task.id, {
                        type: newType as Task["type"],
                      })
                    }
                    onDelete={handleDeleteTask}
                  />
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            disabled={loading}
            className="flex-1 bg-slate-800 text-white rounded-full px-4 py-2 text-sm placeholder-slate-500 border border-slate-700 focus:border-blue-500 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          Command format: add [name] -t normal|critical -s
          pending|in_progress|done|archived
        </p>
      </div>
    </div>
  );
}
