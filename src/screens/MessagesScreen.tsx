import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Chat, ContactPresence, useMessageStore } from "../store/useMessageStore";

const filters = [
  { id: "all", label: "All" },
  { id: "squad", label: "Squad" },
  { id: "market", label: "Market" },
  { id: "external", label: "External" },
] as const;

const presenceLabel: Record<ContactPresence, string> = {
  online: "Online",
  away: "Away",
  processing: "Processando",
  typing: "Typing...",
  "responds-soon": "Responds soon",
};
const UNKNOWN_ACTOR_IMAGE = "src/assets/players/unknown.png";

const formatTime = (value: string): string =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getLastMessage = (chat: Chat): string => chat.messages[chat.messages.length - 1]?.content ?? "";

const ActorAvatar = ({
  image,
  name,
  size = "md",
}: {
  image?: string;
  name: string;
  size?: "md" | "lg";
}) => (
  <div
    className={`relative shrink-0 overflow-hidden border border-(--team-color-400)/35 bg-[#0b0b0b] ${
      size === "lg" ? "h-14 w-14 rounded-3xl" : "h-11 w-11 rounded-2xl"
    }`}
  >
    <img
      src={image || UNKNOWN_ACTOR_IMAGE}
      alt={name}
      className="h-full w-full object-cover"
      onError={(event) => {
        event.currentTarget.src = UNKNOWN_ACTOR_IMAGE;
      }}
    />
  </div>
);

const ContactCard = ({
  chat,
  isActive,
  onClick,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}) => {
  const lastMessage = chat.messages[chat.messages.length - 1];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl border transition-all group ${isActive
          ? "bg-(--team-color-500)/10 border-(--team-color-500)/45 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
        }`}
    >
      <div className="flex items-start gap-3">
        <ActorAvatar image={chat.actor.image} name={chat.actor.name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{chat.actor.name}</p>
              <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-(--team-color-300)">
                {chat.actor.role}
              </p>
            </div>
            {lastMessage && (
              <span className="shrink-0 text-[10px] font-bold text-gray-500">
                {formatTime(lastMessage.timestamp)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-[11px] leading-5 text-gray-400">{getLastMessage(chat)}</p>
            {chat.unreadCount > 0 && (
              <span className="min-w-5 rounded-full bg-(--team-color-600) px-2 py-0.5 text-center text-[10px] font-black text-white">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const MessagesScreen = () => {
  const {
    chats,
    activeChatId,
    activeFilter,
    searchTerm,
    setActiveChat,
    setFilter,
    setSearchTerm,
    syncLiveContext,
    applySmartChip,
    applySmartPrompt,
    sendMessage,
  } = useMessageStore();
  const [draft, setDraft] = useState("");
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

  useEffect(() => {
    syncLiveContext();
  }, [syncLiveContext]);

  const filteredChats = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return chats.filter((chat) => {
      const matchesFilter = activeFilter === "all" || chat.actor.category === activeFilter;
      const searchable = `${chat.actor.name} ${chat.actor.role} ${getLastMessage(chat)}`.toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || searchable.includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, chats, searchTerm]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeChat || activeChat.pendingResponse) {
      return;
    }

    const outgoing = draft;
    setDraft("");
    void sendMessage(activeChat.id, outgoing);
  };

  const handlePrompt = (prompt: string) => {
    if (!activeChat || activeChat.pendingResponse) {
      return;
    }

    setDraft("");
    void applySmartPrompt(activeChat.id, prompt);
  };

  const handleChip = (chipId: string) => {
    if (!activeChat || activeChat.pendingResponse) {
      return;
    }

    setDraft("");
    void applySmartChip(activeChat.id, chipId);
  };

  if (!activeChat) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="h-full w-full overflow-hidden"
    >
      <main className="grid h-full w-full grid-cols-12 gap-4 overflow-hidden">
        <aside className="col-span-4 flex h-full min-w-0 flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#0d0d0d]">
          <div className="border-b border-white/5 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-(--team-color-400)">Inbox</p>
                <h2 className="mt-1 text-2xl font-light text-white">Central de Mensagens</h2>
              </div>
            </div>

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar conversas..."
              className="mt-5 w-full rounded-2xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-(--team-color-500)/50"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition ${activeFilter === filter.id
                      ? "border-(--team-color-500)/60 bg-(--team-color-600) text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 pr-3">
            {filteredChats.map((chat) => (
              <ContactCard
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChat.id}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
          </div>
        </aside>

        <section className="col-span-8 flex h-full min-w-0 flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#101010]">
          <header className="flex shrink-0 items-center justify-between gap-5 border-b border-white/5 px-7 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative">
                <ActorAvatar image={activeChat.actor.image} name={activeChat.actor.name} size="lg" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#101010] ${
                    activeChat.presence === "typing"
                      ? "bg-yellow-400"
                      : activeChat.presence === "processing"
                        ? "bg-(--team-color-300)"
                        : "bg-emerald-400"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-white">{activeChat.actor.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-(--team-color-500)/25 bg-(--team-color-500)/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    {activeChat.actor.role}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {presenceLabel[activeChat.presence]}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-300 transition hover:border-(--team-color-500)/40 hover:text-white"
            >
              Linked stats
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {activeChat.messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[72%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`rounded-3xl px-5 py-4 text-sm leading-6 shadow-lg ${isUser
                            ? "rounded-br-lg bg-(--team-color-600)/35 text-white border border-(--team-color-500)/25"
                            : "rounded-bl-lg bg-[#151515] text-gray-100 border border-white/10"
                          }`}
                      >
                        {message.content}
                      </div>
                      <span className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-600">
                        {formatDateTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {activeChat.dialoguePhase === "processing" && (
                <div className="flex justify-start">
                  <div className="rounded-3xl rounded-bl-lg border border-white/10 bg-[#151515] px-5 py-4 text-sm text-gray-500">
                    Lendo contexto...
                  </div>
                </div>
              )}

              {activeChat.dialoguePhase === "streaming" && (
                <div className="flex justify-start">
                  <div className="rounded-3xl rounded-bl-lg border border-white/10 bg-[#151515] px-5 py-4 text-sm text-gray-400">
                    {activeChat.actor.name} está digitando...
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-white/5 bg-[#0c0c0c] p-5">
            {activeChat.lastError && (
              <div className="mb-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-[11px] font-bold text-yellow-100">
                Dialogue engine: {activeChat.lastError}
              </div>
            )}

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {(activeChat.smartPromptChips.length
                ? activeChat.smartPromptChips
                : activeChat.smartPrompts.map((prompt) => ({ id: prompt, label: prompt }))
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={activeChat.pendingResponse}
                  onClick={() =>
                    activeChat.smartPromptChips.length
                      ? handleChip(chip.id)
                      : handlePrompt(chip.label)
                  }
                  className="shrink-0 rounded-full border border-(--team-color-500)/25 bg-(--team-color-500)/10 px-4 py-2 text-[11px] font-bold text-white transition hover:border-(--team-color-400)/60 hover:bg-(--team-color-500)/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={activeChat.pendingResponse}
                placeholder="Escreva como presidente..."
                className="h-14 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#070707] px-5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-(--team-color-500)/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={activeChat.pendingResponse || draft.trim().length === 0}
                className="h-14 rounded-2xl bg-(--team-color-600) px-7 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-(--team-color-500) active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
              >
                Enviar
              </button>
            </form>
          </footer>
        </section>
      </main>
    </motion.div>
  );
};

export default MessagesScreen;
