// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  Search,
  MoreVertical,
  Bell,
  Paperclip,
  Send,
  ClipboardCheck,
  Plus,
} from "lucide-react";

const API_BASE = "http://localhost:8080";

type Classroom = {
  id: number;
  name: string;
  batch: number;
  teacher_id?: string;
};

type Message = {
  id: number;
  sender_id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string;
};

type Notice = {
  id: number;
  title: string;
  body: string;
  tag: string;
  created_at: string;
};

export default function DashboardPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rightTab, setRightTab] = useState<"notice" | "files">("notice");
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------
  // Load current user
  // ----------------------------------------
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to load current user:", response.status);
          return;
        }

        const me = await response.json();
        setCurrentUserId(me.id);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    }

    loadCurrentUser();
  }, []);

  // ----------------------------------------
  // Load classrooms
  // ----------------------------------------
  useEffect(() => {
    async function loadClassrooms() {
      try {
        const response = await fetch(`${API_BASE}/api/classrooms`, {
          credentials: "include",
        });

        if (!response.ok) {
          console.error(
            "Failed to load classrooms:",
            response.status,
            response.statusText
          );
          return;
        }

        const data: Classroom[] = await response.json();

        console.log("Classrooms received:", data);

        setClassrooms(data);

        if (data.length > 0) {
          setActiveId(data[0].id);
        }
      } catch (error) {
        console.error("Error loading classrooms:", error);
      }
    }

    loadClassrooms();
  }, []);

  // ----------------------------------------
  // Load messages + notices
  // whenever active classroom changes
  // ----------------------------------------
  useEffect(() => {
    if (activeId == null) return;

    refetchMessages();

    async function loadNotices() {
      try {
        const response = await fetch(
          `${API_BASE}/api/classrooms/${activeId}/notices`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to load notices:",
            response.status,
            response.statusText
          );
          setNotices([]);
          return;
        }

        const data: Notice[] = await response.json();
        setNotices(data);
      } catch (error) {
        console.error("Error loading notices:", error);
        setNotices([]);
      }
    }

    loadNotices();
  }, [activeId]);

  // ----------------------------------------
  // Scroll to bottom when messages change
  // ----------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ----------------------------------------
  // Load messages
  // ----------------------------------------
  async function refetchMessages() {
    if (activeId == null) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/classrooms/${activeId}/messages`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to load messages:",
          response.status,
          response.statusText
        );
        setMessages([]);
        return;
      }

      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  }

  // ----------------------------------------
  // Send message
  // ----------------------------------------
  async function sendMessage() {
    if (!draft.trim() || activeId == null) return;

    const body = new URLSearchParams();
    body.set("content", draft);

    const messageToSend = draft;
    setDraft("");

    try {
      const response = await fetch(
        `${API_BASE}/api/classrooms/${activeId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to send message:",
          response.status,
          response.statusText
        );

        // Put the message back if sending failed
        setDraft(messageToSend);
        return;
      }

      await refetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setDraft(messageToSend);
    }
  }

  const active = classrooms.find((c) => c.id === activeId);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-red-800 font-semibold text-lg">
          <span>🎓</span>
          Netrokona University
        </div>

        <nav className="flex items-center gap-8 text-sm text-neutral-600">
          <a className="hover:text-neutral-900">Routine</a>

          <a className="hover:text-neutral-900">Schedule</a>

          <a className="text-red-800 font-medium border-b-2 border-red-800 pb-3 -mb-3">
            Academic
          </a>

          <a className="hover:text-neutral-900">Announcements</a>
        </nav>

        <div className="flex items-center gap-4">
          <Bell size={18} className="text-neutral-500" />
          <div className="h-8 w-8 rounded-full bg-neutral-300" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-200 flex flex-col justify-between">
          <div>
            {/* Portal header */}
            <div className="p-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-red-800 text-white flex items-center justify-center font-bold">
                N
              </div>

              <div>
                <p className="text-sm font-semibold">NU Portal</p>
                <p className="text-xs text-neutral-400">
                  Academic Management
                </p>
              </div>
            </div>

            {/* Classroom list */}
            <nav className="mt-2">
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
                    c.id === activeId
                      ? "bg-teal-50 text-teal-900 font-medium"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Join course */}
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white text-sm rounded-md py-2">
              <Plus size={14} />
              Join New Course
            </button>
          </div>
        </aside>

        {/* Main chat */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200">
            <div>
              <h1 className="font-semibold text-neutral-900">
                {active?.name ?? "Select a course"}
              </h1>

              <p className="text-xs text-neutral-400">
                {active ? `Batch ${active.batch}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-3 text-neutral-400">
              <Search size={16} />
              <MoreVertical size={16} />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;

              return (
                <div
                  key={m.id}
                  className={mine ? "flex justify-end" : ""}
                >
                  {!mine && (
                    <p className="text-sm font-medium text-neutral-800 mb-1">
                      {m.sender_name}{" "}
                      <span className="text-xs text-neutral-400 font-normal">
                        {new Date(m.created_at).toLocaleTimeString()}
                      </span>
                    </p>
                  )}

                  <div
                    className={`max-w-md rounded-lg px-4 py-2.5 text-sm ${
                      mine
                        ? "bg-red-800 text-white"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <div className="flex items-center gap-3 px-6 py-3 border-t border-neutral-200">
            <Paperclip
              size={18}
              className="text-neutral-400"
            />

            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder={`Message ${active?.name ?? ""}...`}
              className="flex-1 bg-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none"
            />

            <button className="flex items-center gap-1 text-sm text-teal-700">
              <ClipboardCheck size={16} />
              Attendance
            </button>

            <button
              onClick={sendMessage}
              className="h-9 w-9 flex items-center justify-center rounded-md bg-red-800 hover:bg-red-900 text-white"
            >
              <Send size={16} />
            </button>
          </div>
        </main>

        {/* Right panel */}
        <aside className="w-80 border-l border-neutral-200 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setRightTab("notice")}
              className={`flex-1 py-3 text-sm font-medium ${
                rightTab === "notice"
                  ? "text-red-800 border-b-2 border-red-800"
                  : "text-neutral-400"
              }`}
            >
              Notice
            </button>

            <button
              onClick={() => setRightTab("files")}
              className={`flex-1 py-3 text-sm font-medium ${
                rightTab === "files"
                  ? "text-red-800 border-b-2 border-red-800"
                  : "text-neutral-400"
              }`}
            >
              Files
            </button>
          </div>

          {/* Notices */}
          {rightTab === "notice" && (
            <div className="p-4 space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="border border-neutral-200 rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        n.tag === "urgent"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {n.tag}
                    </span>

                    <span className="text-xs text-neutral-400">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-900">
                    {n.title}
                  </p>

                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {n.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {rightTab === "files" && (
            <div className="p-4 text-sm text-neutral-400">
              File list coming soon.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}