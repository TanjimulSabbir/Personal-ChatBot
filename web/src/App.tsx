import { useChat } from "./hooks/useChat";
import { useModels } from "./hooks/useModel";
import Header from "./components/Header";
import ModelSelector from "./components/ModalSelector";
import EmptyState from "./components/EmptyState";
import MessageList from "./components/MesageList";
import ChatInput from "./components/ChatInput";

export default function App() {
  const { models, selected, select, error } = useModels();
  const { messages, loading, send, clear } = useChat(selected);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <Header onClear={clear} hasMessages={messages.length > 0}>
        <ModelSelector
          models={models}
          selected={selected}
          onSelect={select}
          error={error}
        />
      </Header>

      {messages.length === 0 ? (
        <EmptyState onPick={send} />
      ) : (
        <MessageList messages={messages} loading={loading} />
      )}

      <ChatInput onSend={send} disabled={loading} />
    </div>
  );
}