import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useModels } from "./hooks/useModel";
import { sendChat } from "./api/chat";
import type { Message } from "./types/types";
import { loadSessions, saveSessions, type StoredSession } from "./storage/sessionStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Session = StoredSession;
const USER_KEY = "noesis-ai-guest-id";
const makeId = () => crypto.randomUUID();
const starterPrompts = [
  { icon: "✦", title: "Explore an idea", prompt: "Explain a complex idea in a simple, intuitive way." },
  { icon: "⌘", title: "Write some code", prompt: "Help me build a clean, production-ready React component." },
  { icon: "◎", title: "Think it through", prompt: "Help me break down a problem and explore possible solutions." },
  { icon: "↗", title: "Make a plan", prompt: "Create a practical step-by-step learning roadmap for me." },
];

function titleFrom(text: string) { return text.trim().replace(/\s+/g, " ").slice(0, 42) || "New conversation"; }
function sessionTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(timestamp);
}

export default function App() {
  const { models, selected, select, error: modelError } = useModels();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const active = sessions?.find((s) => s.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => {
    let cancelled = false;
    void loadSessions().then((storedSessions) => {
      if (cancelled) return;
      setSessions(storedSessions);
      setStorageReady(true);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (storageReady) void saveSessions(sessions);
  }, [sessions, storageReady]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (!localStorage.getItem(USER_KEY)) localStorage.setItem(USER_KEY, makeId());
  }, []);
  useEffect(() => {
    const closePopovers = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (menuId && !menuRef.current?.contains(event.target)) setMenuId(null);
      if (modelOpen && !modelRef.current?.contains(event.target)) setModelOpen(false);
    };
    const closeWithEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuId(null);
        setModelOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener("pointerdown", closePopovers);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closePopovers);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuId, modelOpen]);
  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        newChat();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions
      .filter((session) => !query || session.title.toLowerCase().includes(query) || session.messages.some((message) => message.content.toLowerCase().includes(query)))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, search]);
  function toggleSidebar() {
    if (window.matchMedia("(max-width: 760px)").matches) {
      setSidebarOpen(true);
    } else {
      setSidebarHidden((hidden) => !hidden);
    }
  }
  function closeSidebar() {
    if (window.matchMedia("(max-width: 760px)").matches) {
      setSidebarOpen(false);
    } else {
      setSidebarHidden(true);
    }
  }
  function newChat() { setActiveId(null); setDraft(""); setSidebarOpen(false); setMenuId(null); setModelOpen(false); window.setTimeout(() => textareaRef.current?.focus(), 50); }
  function openSession(id: string) { setActiveId(id); setSidebarOpen(false); setMenuId(null); }
  function deleteSession(id: string) { setSessions((prev) => prev.filter((s) => s.id !== id)); if (activeId === id) setActiveId(null); setMenuId(null); }
  function renameSession(id: string) {
    const current = sessions.find((s) => s.id === id); if (!current) return;
    const next = window.prompt("Rename conversation", current.title);
    if (next?.trim()) setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title: next.trim(), updatedAt: Date.now() } : s));
    setMenuId(null);
  }

  async function send(text = draft) {
    const content = text.trim(); if (!content || loading) return;
    const sessionId = activeId ?? makeId();
    const userMessage: Message = { id: makeId(), role: "user", content };
    const existing = sessions.find((s) => s.id === sessionId);
    const base: Session = existing ?? { id: sessionId, title: titleFrom(content), messages: [], updatedAt: Date.now() };
    const history = [...base.messages, userMessage];
    setSessions((prev) => existing ? prev.map((s) => s.id === sessionId ? { ...s, messages: history, updatedAt: Date.now() } : s) : [{ ...base, messages: history }, ...prev]);
    setActiveId(sessionId); setDraft(""); setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const payload = history.filter((m) => !m.isError).map(({ role, content: body }) => ({ role, content: body }));
      const result = await sendChat(payload, selected || undefined);
      const assistant: Message = { id: makeId(), role: "assistant", content: result.reply, model: result.model };
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: [...s.messages, assistant], updatedAt: Date.now() } : s));
    } catch (e) {
      const failure: Message = { id: makeId(), role: "assistant", content: (e as Error).message || "Something went wrong. Please try again.", isError: true };
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: [...s.messages, failure], updatedAt: Date.now() } : s));
    } finally { setLoading(false); }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); }
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""} ${sidebarHidden ? "sidebar-hidden" : ""}`}>
        <div className="sidebar-top">
          <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); newChat(); }}>
            <span className="brand-mark"><span>✳</span></span><span className="brand-name">Aether<span>AI</span></span>
          </a>
          <button className="icon-button sidebar-collapse" title="Close sidebar" aria-label="Close sidebar" onClick={closeSidebar}>‹</button>
        </div>
        <button className="new-chat-button" onClick={newChat}><span className="plus-icon">＋</span> New chat <kbd>⌘ K</kbd></button>
        <div className="sidebar-section-label">WORKSPACE</div>
        <div className="nav-item nav-active"><span className="nav-icon">◈</span> Chats <span className="nav-count">{sessions.length}</span></div>
        <div className="history-heading"><span className="sidebar-section-label">RECENTS</span><span className="history-hint">{sessions.length}</span></div>
        <div className="history-search"><span aria-hidden="true">⌕</span><input aria-label="Search chat history" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats and messages" />{search && <button className="history-search-clear" aria-label="Clear search" onClick={() => setSearch("")}>×</button>}</div>
        <div className="session-list">
          {filteredSessions.length ? filteredSessions.map((session) => (
            <div key={session.id} ref={menuId === session.id ? menuRef : undefined} className={`session-wrap ${activeId === session.id ? "session-selected" : ""}`}>
              <button className="session-item" onClick={() => openSession(session.id)}>
                <span className="session-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="M3.25 4.75A2.5 2.5 0 0 1 5.75 2.25h8.5a2.5 2.5 0 0 1 2.5 2.5v5.5a2.5 2.5 0 0 1-2.5 2.5h-4l-4.25 3v-3h-.25a2.5 2.5 0 0 1-2.5-2.5v-5.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 7.5h7M6.5 10h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></span>
                <span className="session-copy"><span className="session-title">{session.title}</span><small>{session.messages.length ? `${session.messages.length} messages` : "Empty chat"} · {sessionTime(session.updatedAt)}</small></span>
              </button>
              <button className="session-more" aria-label={`Options for ${session.title}`} aria-expanded={menuId === session.id} onClick={() => setMenuId(menuId === session.id ? null : session.id)}>···</button>
              {menuId === session.id && <div className="session-menu" role="menu"><button role="menuitem" onClick={() => renameSession(session.id)}>Rename</button><button role="menuitem" className="danger-action" onClick={() => deleteSession(session.id)}>Delete</button></div>}
            </div>
          )) : <div className="history-empty">{search ? "No matching conversations" : "Your conversations will appear here."}</div>}
        </div>
        <div className="sidebar-bottom">
          <div className="plan-card"><div className="plan-icon">✦</div><div><strong>Your AI workspace</strong><p>A little space for big ideas.</p></div></div>
          <div className="profile-row"><div className="avatar">S</div><div className="profile-copy"><strong>Personal workspace</strong><span>Local guest session</span></div><span className="profile-more">···</span></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">{sidebarOpen ? "‹" : "☰"}</button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{active?.title ?? "New chat"}</strong></div></div>
          <div className="topbar-actions">
            <div ref={modelRef} className="model-wrap">
              <button className="model-button" onClick={() => setModelOpen(!modelOpen)}><span className="status-dot"/><span>{models.find((m) => m.id === selected)?.name ?? (modelError ? "Model unavailable" : "Loading models…")}</span><span className="chevron">⌄</span></button>
              {modelOpen && <div className="model-dropdown"><div className="dropdown-label">SELECT MODEL</div>{models.map((m) => <button key={m.id} className={selected === m.id ? "model-option selected" : "model-option"} onClick={() => { select(m.id); setModelOpen(false); }}><span><strong>{m.name}</strong><small>{m.id}</small></span>{selected === m.id && <span>✓</span>}</button>)}{modelError && <p className="model-error">{modelError}</p>}</div>}
            </div>
            <button className="top-new-chat" onClick={newChat}><span>＋</span><span className="top-new-label">New chat</span></button>
          </div>
        </header>

        {messages.length === 0 ? (
          <section className="welcome-screen">
            <div className="welcome-orb"><span>✳</span><i/><b/></div>
            <div className="eyebrow"><span/> YOUR THINKING SPACE</div>
            <h1>Good to see you.<br/><em>What’s on your mind?</em></h1>
            <p className="welcome-subtitle">A thoughtful AI companion for ideas, questions, and everything in between.</p>
            <div className="suggestion-grid">{starterPrompts.map((item) => <button key={item.title} className="suggestion-card" onClick={() => void send(item.prompt)}><span className="suggestion-icon">{item.icon}</span><span><strong>{item.title}</strong><small>{item.prompt}</small></span><span className="suggestion-arrow">↗</span></button>)}</div>
          </section>
        ) : (
          <section className="conversation-scroll"><div className="conversation-content">
            <div className="conversation-date">{new Date(active?.updatedAt ?? Date.now()).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
            {messages.map((message) => <MessageView key={message.id} message={message} />)}
            {loading && <div className="assistant-row"><div className="assistant-avatar">✳</div><div className="typing-card"><span/><span/><span/></div></div>}
            <div ref={bottomRef}/>
          </div></section>
        )}

        <footer className="composer-area"><div className="composer-wrap"><div className="composer"><textarea ref={textareaRef} value={draft} onChange={(e) => { setDraft(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`; }} onKeyDown={handleKeyDown} rows={1} placeholder="Message Aether…" disabled={loading}/><div className="composer-tools"><div className="composer-hint"><span>↵</span> to send <span className="hint-divider">·</span> <span>⇧ ↵</span> for new line</div><button className="send-button" disabled={!draft.trim() || loading} onClick={() => void send()} aria-label="Send message">{loading ? <span className="send-spinner"/> : "↑"}</button></div></div><div className="composer-disclaimer">Aether AI can make mistakes. Check important information.</div></div></footer>
      </main>
    </div>
  );
}

function MessageView({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(message.content); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ } }
  if (message.role === "user") return <div className="user-row"><div className="user-message">{message.content}</div></div>;
  return <div className={`assistant-row ${message.isError ? "message-error" : ""}`}><div className="assistant-avatar">{message.isError ? "!" : "✳"}</div><div className="assistant-body"><div className="assistant-label">Aether <span>·</span> <small>{message.isError ? "Notice" : (message.model?.split("/").pop() || "Assistant")}</small></div><div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div><div className="message-actions"><button onClick={() => void copy()}>{copied ? "✓ Copied" : "▢ Copy"}</button></div></div></div>;
}
