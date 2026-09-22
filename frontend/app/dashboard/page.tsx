// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Bell,
  Paperclip,
  Send,
  ClipboardCheck,
  Plus,
  Users,
  GraduationCap,
  FlaskConical,
  Landmark,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

const API_BASE = "http://localhost:8080";

type Classroom = {
  id: number;
  name: string;
  batch: number;
  course_code?: string;
  teacher_id?: string;
};

type Reaction = {
  emoji: string;
  count: number;
};

type Message = {
  id: number;
  sender_id: string;
  sender_role: string;
  sender_name: string;
  sender_avatar_url?: string;
  content: string;
  created_at: string;
  reactions?: Reaction[];
};

type Notice = {
  id: number;
  title: string;
  body: string;
  tag: string;
  created_at: string;
  attachment_name?: string;
};

type ClassroomFile = {
  id: number;
  classroom_id: number;
  file_name: string;
  size_bytes: number;
  uploaded_by: string;
  uploader_role: string;
  uploader_name: string;
  created_at: string;
  url: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ----------------------------------------
// Small presentational helpers
// ----------------------------------------

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const AVATAR_PALETTE = [
  "bg-blue-700",
  "bg-emerald-700",
  "bg-amber-700",
  "bg-violet-700",
  "bg-rose-700",
  "bg-teal-700",
];

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash < 0 ? hash + AVATAR_PALETTE.length : hash];
}

function Avatar({
  name,
  imageUrl,
  size = 32,
}: {
  name: string;
  imageUrl?: string;
  size?: number;
}) {
  const dimension = { width: size, height: size };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={dimension}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div
      style={dimension}
      className={`rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(
        name
      )}`}
    >
      {getInitials(name) || "?"}
    </div>
  );
}

const SIDEBAR_ICON_RULES: { match: RegExp; icon: typeof Users }[] = [
  { match: /faculty/i, icon: GraduationCap },
  { match: /research/i, icon: FlaskConical },
  { match: /admin/i, icon: Landmark },
];

function getClassroomIcon(name: string) {
  const rule = SIDEBAR_ICON_RULES.find((r) => r.match.test(name));
  return rule ? rule.icon : Users;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const NOTICE_TAG_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  general: "bg-neutral-100 text-neutral-600",
  assignment: "bg-neutral-900 text-white",
};

export default function DashboardPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [files, setFiles] = useState<ClassroomFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [rightTab, setRightTab] = useState<"notice" | "files">("notice");
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("You");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [newClassroomBatch, setNewClassroomBatch] = useState("");
  const [newClassroomCourseCode, setNewClassroomCourseCode] = useState("");
  const [creatingClassroom, setCreatingClassroom] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
        if (me.name) setCurrentUserName(me.name);
        if (me.avatar_url) setCurrentUserAvatar(me.avatar_url);
        if (me.role) setCurrentUserRole(me.role);
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
    refetchClassrooms();
  }, []);

  async function refetchClassrooms() {
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

      setClassrooms(data);

      if (data.length > 0) {
        setActiveId((current) => current ?? data[0].id);
      }
    } catch (error) {
      console.error("Error loading classrooms:", error);
    }
  }

  // ----------------------------------------
  // Create a classroom (teachers only)
  // ----------------------------------------
  async function handleCreateClassroom() {
    if (
      !newClassroomName.trim() ||
      !newClassroomBatch.trim() ||
      !newClassroomCourseCode.trim()
    )
      return;

    const body = new URLSearchParams();
    body.set("name", newClassroomName.trim());
    body.set("batch", newClassroomBatch.trim());
    body.set("course_code", newClassroomCourseCode.trim());

    setCreatingClassroom(true);
    try {
      const response = await fetch(`${API_BASE}/api/classrooms`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        console.error(
          "Failed to create classroom:",
          response.status,
          response.statusText
        );
        return;
      }

      const created: Classroom = await response.json();
      setShowCreateModal(false);
      setNewClassroomName("");
      setNewClassroomBatch("");
      setNewClassroomCourseCode("");
      await refetchClassrooms();
      setActiveId(created.id);
    } catch (error) {
      console.error("Error creating classroom:", error);
    } finally {
      setCreatingClassroom(false);
    }
  }

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
    refetchFiles();
  }, [activeId]);

  // ----------------------------------------
  // Load files
  // ----------------------------------------
  async function refetchFiles() {
    if (activeId == null) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/classrooms/${activeId}/files`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to load files:",
          response.status,
          response.statusText
        );
        setFiles([]);
        return;
      }

      const data: ClassroomFile[] = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error loading files:", error);
      setFiles([]);
    }
  }

  // ----------------------------------------
  // Upload a file
  // ----------------------------------------
  async function handleFileUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || activeId == null) return;

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setUploading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/classrooms/${activeId}/files`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to upload file:",
          response.status,
          response.statusText
        );
        return;
      }

      await refetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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

  // ----------------------------------------
  // Logout
  // ----------------------------------------
  async function handleLogout() {
    setLoggingOut(true);
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          "Logout failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoggingOut(false);
      setShowSettingsMenu(false);
      router.push("/login");
    }
  }

  // ----------------------------------------
  // Close settings dropdown when clicking outside it
  // ----------------------------------------
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const active = classrooms.find((c) => c.id === activeId);

  // Group messages so a day divider renders before the first message of each day
  let lastDayKey = "";

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-red-800 font-semibold text-lg">
          <img
            src="/logo.png"
            alt="Netrokona University"
            className="w-8 h-8 object-contain"
          />
          Department of CSE, Netrokona University
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
          <Avatar
            name={currentUserName}
            imageUrl={currentUserAvatar}
            size={32}
          />
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
                <p className="text-sm font-semibold">CSE Portal</p>
                <p className="text-xs text-neutral-400">
                  Academic Management
                </p>
              </div>
            </div>

            {/* Classroom list */}
            <nav className="mt-2">
              {classrooms.map((c) => {
                const Icon = getClassroomIcon(c.name);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
                      c.id === activeId
                        ? "bg-teal-50 text-teal-900 font-medium"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {c.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Create classroom (teachers only) + settings */}
          <div className="p-4 space-y-3">
            {currentUserRole === "teacher" && (
              <>
                {!showCreateModal ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white text-sm rounded-md py-2"
                  >
                    <Plus size={14} />
                    Create New Classroom
                  </button>
                ) : (
                  <div className="space-y-2 border border-neutral-200 rounded-md p-3">
                    <input
                      value={newClassroomName}
                      onChange={(e) => setNewClassroomName(e.target.value)}
                      placeholder="Classroom name"
                      className="w-full bg-neutral-100 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <input
                      value={newClassroomBatch}
                      onChange={(e) => setNewClassroomBatch(e.target.value)}
                      placeholder="Batch"
                      inputMode="numeric"
                      className="w-full bg-neutral-100 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <input
                      value={newClassroomCourseCode}
                      onChange={(e) =>
                        setNewClassroomCourseCode(e.target.value)
                      }
                      placeholder="Course code (e.g. CSE-401)"
                      className="w-full bg-neutral-100 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateClassroom}
                        disabled={creatingClassroom}
                        className="flex-1 bg-red-800 hover:bg-red-900 text-white text-sm rounded-md py-1.5 disabled:opacity-50"
                      >
                        {creatingClassroom ? "Creating…" : "Create"}
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          setNewClassroomName("");
                          setNewClassroomBatch("");
                          setNewClassroomCourseCode("");
                        }}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm rounded-md py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="border-t border-neutral-200 pt-3 relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettingsMenu((v) => !v)}
                className="w-full flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 px-1 py-1"
              >
                <SettingsIcon size={15} />
                Settings
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-neutral-200 rounded-md shadow-md overflow-hidden z-10">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 text-left text-sm text-red-700 hover:bg-red-50 px-3 py-2 disabled:opacity-50"
                  >
                    <LogOut size={14} />
                    {loggingOut ? "Logging out…" : "Logout"}
                  </button>
                </div>
              )}
            </div>
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
                {active
                  ? [active.course_code, `Batch ${active.batch}`]
                      .filter(Boolean)
                      .join(" · ")
                  : ""}
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
              const dayKey = new Date(m.created_at).toDateString();
              const showDivider = dayKey !== lastDayKey;
              lastDayKey = dayKey;

              return (
                <div key={m.id}>
                  {showDivider && (
                    <div className="flex justify-center mb-4">
                      <span className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-3 py-1">
                        {formatDayLabel(m.created_at)}, {formatTime(m.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={mine ? "flex justify-end" : "flex gap-2.5"}>
                    {!mine && (
                      <Avatar
                        name={m.sender_name}
                        imageUrl={m.sender_avatar_url}
                        size={32}
                      />
                    )}

                    <div className={mine ? "max-w-md" : "max-w-md"}>
                      {!mine && (
                        <p className="text-sm font-medium text-neutral-800 mb-1">
                          {m.sender_name}{" "}
                          <span className="text-xs text-neutral-400 font-normal">
                            {formatTime(m.created_at)}
                          </span>
                        </p>
                      )}

                      {mine && (
                        <p className="text-sm text-right mb-1">
                          <span className="font-medium text-neutral-800">
                            You
                          </span>{" "}
                          <span className="text-xs text-neutral-400 font-normal">
                            {formatTime(m.created_at)}
                          </span>
                        </p>
                      )}

                      <div
                        className={`rounded-lg px-4 py-2.5 text-sm ${
                          mine
                            ? "bg-red-800 text-white"
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        {m.content}
                      </div>

                      {m.reactions && m.reactions.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5">
                          {m.reactions.map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-neutral-600">
                                {r.count}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        NOTICE_TAG_STYLES[n.tag] ??
                        "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {n.tag}
                    </span>

                    <span className="text-xs text-neutral-400">
                      {new Date(n.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-900">
                    {n.title}
                  </p>

                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {n.body}
                  </p>

                  {n.attachment_name && (
                    <div className="flex items-center gap-1 text-xs text-teal-700 mt-2">
                      <Paperclip size={12} />
                      {n.attachment_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {rightTab === "files" && (
            <div className="p-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || activeId == null}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-300 hover:border-neutral-400 text-sm text-neutral-500 rounded-md py-2.5 disabled:opacity-50"
              >
                <Paperclip size={14} />
                {uploading ? "Uploading…" : "Upload a file"}
              </button>

              {files.length === 0 && !uploading && (
                <p className="text-sm text-neutral-400 text-center py-4">
                  No files shared in this classroom yet.
                </p>
              )}

              {files.map((f) => (
                <a
                  key={f.id}
                  href={`${API_BASE}${f.url}`}
                  className="block border border-neutral-200 rounded-md p-3 hover:bg-neutral-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-900 truncate pr-2">
                      {f.file_name}
                    </span>
                    <span className="text-xs text-neutral-400 flex-shrink-0">
                      {formatFileSize(f.size_bytes)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {f.uploader_name} ·{" "}
                    {new Date(f.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </a>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}