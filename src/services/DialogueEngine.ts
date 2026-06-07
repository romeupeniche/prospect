import {
  DialogueAudience,
  DialogueChip,
  DialogueDB,
  DialogueIntent,
  DialogueLanguage,
} from "./DialogueDB";

export type GameLocale = "pt-BR" | "en-US" | "es-ES";

export interface GameGlobalContext {
  locale: GameLocale;
  currentDate: string;
  currentYear: number;
  club: {
    id: string;
    name: string;
    nickname: string;
    boardExpectations: string;
    finances: { balance: number; transferBudget: number; wageBudget: number };
  };
  competitions: Array<{
    name: string;
    currentPosition: number;
    totalTeams: number;
    recentForm: string[];
    statusText: string;
  }>;
  recentMatch: {
    opponent: string;
    score: string;
    result: "win" | "loss" | "draw";
    summary: string;
    playerPerformances: Array<{
      playerName: string;
      rating: number;
      notes: string;
    }>;
  } | null;
  recentResults: Array<{
    opponent: string;
    score: string;
    result: "win" | "loss" | "draw";
    competition: string;
    date: string;
  }>;
  playerContexts: Record<
    string,
    {
      name: string;
      age: number;
      position: string;
      overall: number;
      potential: number;
      roleStatus: string;
      careerStage: "prospect" | "developing" | "prime" | "veteran";
      minutesTrend: "none_recorded" | "low" | "regular" | "heavy";
      formText: string;
      seasonSummary: string;
      fitnessSummary: string;
      contractSummary: string;
      transferPressure: "none" | "loan_consideration" | "sale_consideration" | "stay_and_fight";
    }
  >;
  squadAnalysis: {
    contextSummary: string;
    strongestPositions: string[];
    weakestPositions: string[];
    positionNeeds: Array<{
      position: string;
      severity: "low" | "medium" | "high";
      reason: string;
      fit: "depth" | "quality" | "injury" | "development";
    }>;
    depthWarnings: string[];
    availablePlayersByPosition: Record<string, number>;
    averageOverallByPosition: Record<string, number>;
  };
  squadHighlights: {
    stars: string[];
    unhappyPlayers: Array<{ name: string; reason: string }>;
    injuredPlayers: Array<{
      name: string;
      injury: string;
      durationDays: number;
    }>;
    transferListed: string[];
  };
  marketStatus: {
    activeIncomingProposals: Array<{
      playerId: string;
      playerName: string;
      offeringClub: string;
      amount: number;
    }>;
    leakedRumors: string[];
  };
  mediaAndSocials: {
    breakingNews: string;
    fanSentiment: "furious" | "concerned" | "neutral" | "hyped";
    topTrendingTweet: string;
  };
}

export type ActorKind =
  | "coach"
  | "player"
  | "agent"
  | "regulator"
  | "supporter";
export type ChatRole = "user" | "assistant" | "system";

export interface ActorProfile {
  id: string;
  name: string;
  role: string;
  kind: ActorKind;
  category: "squad" | "market" | "external";
  linkedPlayerName?: string;
  personality: string;
  triggerRules: string[];
  image: string;
}

export interface DialogueChatMessage {
  role: Exclude<ChatRole, "system">;
  content: string;
}

export interface DialogueRequest {
  actor: ActorProfile;
  history: DialogueChatMessage[];
  globalContext: GameGlobalContext;
  input: string;
  chatId: string;
  chipId?: string;
}

export interface DialogueResponse {
  content: string;
  messages: string[];
  intentId: string;
  confidence: number;
  chips: DialogueChip[];
  fallbackActive: boolean;
  typingDelayMs: number;
  processingTimeMs: number;
}

interface DialogueState {
  clarificationCount: number;
  lastIntentId?: string;
  lastInputSignature?: string;
  lastResponseByIntent: Record<string, string>;
  fallbackActive: boolean;
  chips: DialogueChip[];
}

interface ScoredIntent {
  intent: DialogueIntent;
  score: number;
}

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });

const now = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string): string[] =>
  normalize(value)
    .split(" ")
    .filter((token) => token.length > 2);

export const languageFromLocale = (locale: GameLocale): DialogueLanguage => {
  if (locale === "en-US") return "en";
  if (locale === "es-ES") return "es";
  return "pt";
};

export const calculateTypingDelayMs = (content: string): number => {
  const baseDelay = 900;
  const perCharacter = 34;
  const jitter = 0.9 + Math.random() * 0.28;
  return Math.min(7200, Math.round((baseDelay + content.length * perCharacter) * jitter));
};

export const waitForTypingDelay = async (
  content: string,
  processStartedAt: number,
): Promise<{ typingDelayMs: number; processingTimeMs: number }> => {
  const typingDelayMs = calculateTypingDelayMs(content);
  const processingTimeMs = Math.max(0, now() - processStartedAt);
  const remainingDelay = Math.max(0, Math.max(typingDelayMs, processingTimeMs) - processingTimeMs);
  await Promise.all([wait(remainingDelay)]);

  return {
    typingDelayMs,
    processingTimeMs: Math.round(processingTimeMs),
  };
};

const actorAudience = (actor: ActorProfile): DialogueAudience => {
  if (actor.kind === "player") return "player";
  if (actor.kind === "coach") return "staff";
  if (actor.kind === "agent") return "agent";
  if (actor.kind === "regulator") return "board";
  return "external";
};

const canUseIntent = (intent: DialogueIntent, actor: ActorProfile): boolean =>
  !intent.audience || intent.audience.includes(actorAudience(actor));

const tokenOverlap = (left: string, right?: string): number => {
  if (!right) return 0;
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (!leftTokens.size || !rightTokens.size) return 0;

  let shared = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  });

  return shared / Math.max(leftTokens.size, rightTokens.size);
};

const hasAgreementTag = (input: string, language: DialogueLanguage): boolean =>
  DialogueDB[language].agreementTags.some((pattern) => pattern.test(input));

const scoreIntent = (
  intent: DialogueIntent,
  rawInput: string,
  normalizedInput: string,
  inputTokens: string[],
): number => {
  let score = 0;

  for (const pattern of intent.patterns) {
    const match = rawInput.match(pattern) ?? normalizedInput.match(pattern);
    if (match) {
      score += 0.68 + Math.min(0.22, match[0].length / Math.max(rawInput.length, 1));
    }
  }

  if (intent.tokens?.length) {
    const matchedTokens = intent.tokens.filter((token) =>
      inputTokens.includes(normalize(token)),
    );
    score += (matchedTokens.length / intent.tokens.length) * 0.42;
  }

  return Math.min(1, score);
};

const findPlayerProposal = (actor: ActorProfile, context: GameGlobalContext) =>
  context.marketStatus.activeIncomingProposals.find(
    (proposal) => proposal.playerName === actor.linkedPlayerName,
  ) ?? null;

const findUnhappyPlayer = (actor: ActorProfile, context: GameGlobalContext) =>
  context.squadHighlights.unhappyPlayers.find(
    (player) => player.name === actor.linkedPlayerName,
  ) ?? null;

const shouldAgreeWithTransfer = (
  actor: ActorProfile,
  context: GameGlobalContext,
): boolean => {
  if (actor.kind === "agent") return true;
  if (actor.kind === "coach") return false;
  if (actor.kind !== "player") return false;

  const hasProposal = Boolean(findPlayerProposal(actor, context));
  const unhappy = Boolean(findUnhappyPlayer(actor, context));
  const listed = context.squadHighlights.transferListed.includes(actor.linkedPlayerName ?? "");

  return hasProposal || unhappy || listed;
};

const composeAgreementResponse = (
  intent: DialogueIntent,
  actor: ActorProfile,
  context: GameGlobalContext,
  language: DialogueLanguage,
): string => {
  const db = DialogueDB[language];
  const agrees =
    intent.id === "transfer_discussion"
      ? shouldAgreeWithTransfer(actor, context)
      : Math.random() > 0.35;
  const prefix = randomItem(agrees ? db.prefixes.agreement : db.prefixes.disagreement);
  const suffixes = agrees ? intent.suffixes?.positive : intent.suffixes?.negative;
  return `${prefix}${randomItem(suffixes ?? db.prefixes.neutral)}`;
};

const formatNeeds = (context: GameGlobalContext): string => {
  const topNeeds = context.squadAnalysis.positionNeeds.slice(0, 3);

  if (!topNeeds.length) {
    return context.squadAnalysis.contextSummary;
  }

  return topNeeds
    .map((need) => `${need.position}: ${need.reason}`)
    .join(" ");
};

const formatRecentResults = (context: GameGlobalContext): string => {
  if (!context.recentResults.length) {
    return "Ainda não há jogos anteriores registrados nesta carreira, então a análise agora vem do elenco, condição física e atributos.";
  }

  return context.recentResults
    .slice(0, 3)
    .map((result) => `${result.score} contra ${result.opponent} (${result.result})`)
    .join("; ");
};

const playerContextForActor = (actor: ActorProfile, context: GameGlobalContext) =>
  actor.linkedPlayerName ? context.playerContexts[actor.linkedPlayerName] : undefined;

const minutesTrendLabel = (
  trend: GameGlobalContext["playerContexts"][string]["minutesTrend"],
  language: DialogueLanguage,
): string => {
  const labels = {
    en: {
      none_recorded: "not recorded yet",
      low: "low",
      regular: "regular",
      heavy: "heavy",
    },
    pt: {
      none_recorded: "sem registro ainda",
      low: "baixos",
      regular: "regulares",
      heavy: "muito altos",
    },
    es: {
      none_recorded: "sin registro todavía",
      low: "bajos",
      regular: "regulares",
      heavy: "muy altos",
    },
  };

  return labels[language][trend];
};

const buildContextualResponse = (
  intent: DialogueIntent,
  actor: ActorProfile,
  context: GameGlobalContext,
  language: DialogueLanguage,
): string | null => {
  const audience = actorAudience(actor);
  const playerContext = playerContextForActor(actor, context);

  if (intent.id === "squad_status" && (audience === "staff" || audience === "board")) {
    if (language === "en") {
      return `Yes, the team context points to possible reinforcements. ${context.squadAnalysis.contextSummary} The clearest reads are: ${formatNeeds(context)}`;
    }

    if (language === "es") {
      return `Sí, el contexto de la plantilla apunta a posibles refuerzos. ${context.squadAnalysis.contextSummary} Las lecturas más claras son: ${formatNeeds(context)}`;
    }

    return `Sim, o contexto do elenco aponta onde podemos precisar de peças. ${context.squadAnalysis.contextSummary} As leituras mais claras são: ${formatNeeds(context)}`;
  }

  if (intent.id === "playtime_unhappy" && playerContext) {
    const transferLineByLanguage = {
      en: {
        loan_consideration: "Because I am young with potential, a loan can make sense if I keep getting no minutes.",
        sale_consideration: "Because of my level and career phase, if there is no real space, an exit has to be considered.",
        stay_and_fight: "I still think I should stay and fight, as long as there is a clear plan.",
        none: "For now, I want to understand my space before talking about leaving.",
      },
      pt: {
        loan_consideration: "Pelo meu perfil jovem e potencial, um empréstimo pode fazer sentido se eu continuar sem minutos.",
        sale_consideration: "Pelo meu nível e fase da carreira, se eu não tiver espaço real, uma saída precisa ser considerada.",
        stay_and_fight: "Eu ainda acho que devo ficar e brigar, desde que exista um plano claro.",
        none: "Por enquanto, eu quero entender meu espaço antes de falar em sair.",
      },
      es: {
        loan_consideration: "Por mi perfil joven y potencial, una cesión puede tener sentido si sigo sin minutos.",
        sale_consideration: "Por mi nivel y fase de carrera, si no hay espacio real, una salida debe considerarse.",
        stay_and_fight: "Aún creo que debo quedarme y pelear, siempre que haya un plan claro.",
        none: "Por ahora, quiero entender mi espacio antes de hablar de salir.",
      },
    };
    const transferLine = transferLineByLanguage[language][playerContext.transferPressure];

    if (language === "en") {
      return `I understand my situation: ${playerContext.age} years old, ${playerContext.position}, ${playerContext.roleStatus}. My minutes are ${minutesTrendLabel(playerContext.minutesTrend, language)}, my phase is ${playerContext.formText}, and ${playerContext.seasonSummary} ${transferLine}`;
    }

    if (language === "es") {
      return `Entiendo mi situación: ${playerContext.age} años, ${playerContext.position}, ${playerContext.roleStatus}. Mis minutos están ${minutesTrendLabel(playerContext.minutesTrend, language)}, mi fase es ${playerContext.formText}, y ${playerContext.seasonSummary} ${transferLine}`;
    }

    return `Eu entendo minha situação: tenho ${playerContext.age} anos, jogo como ${playerContext.position}, e hoje sou visto como ${playerContext.roleStatus}. Meus minutos estão ${minutesTrendLabel(playerContext.minutesTrend, language)}, minha fase é ${playerContext.formText}, e ${playerContext.seasonSummary} ${transferLine}`;
  }

  if ((intent.id === "transfer_discussion" || intent.id === "contract_discussion") && playerContext) {
    if (language === "en") {
      return `My view depends on the plan. I am ${playerContext.roleStatus}, with ${playerContext.overall} overall and ${playerContext.potential} potential. ${playerContext.contractSummary} ${playerContext.seasonSummary}`;
    }

    if (language === "es") {
      return `Mi lectura depende del plan. Soy ${playerContext.roleStatus}, con ${playerContext.overall} de media y ${playerContext.potential} de potencial. ${playerContext.contractSummary} ${playerContext.seasonSummary}`;
    }

    return `Minha leitura depende do plano. Sou ${playerContext.roleStatus}, com overall ${playerContext.overall} e potencial ${playerContext.potential}. ${playerContext.contractSummary} ${playerContext.seasonSummary}`;
  }

  if (intent.id === "training_intensity") {
    if (playerContext && audience === "player") {
      return `Do meu lado, ${playerContext.fitnessSummary} Se for para buscar mais espaço, preciso treinar forte, mas sem estourar minha condição.`;
    }

    if (audience === "staff") {
      const injuries = context.squadHighlights.injuredPlayers.length;
      return `Pelo contexto do elenco, precisamos ajustar carga por função. Temos ${injuries} jogador(es) lesionado(s), e os alertas principais são: ${context.squadAnalysis.depthWarnings.join(" ") || "sem alerta crítico de profundidade agora."}`;
    }
  }

  if (intent.id === "match_reaction" && audience !== "player") {
    return `Sobre os jogos recentes: ${formatRecentResults(context)} Isso muda a conversa porque a leitura precisa separar resultado, fase física e carências por posição.`;
  }

  return null;
};

const stateSeed = (chips: DialogueChip[]): DialogueState => ({
  clarificationCount: 0,
  fallbackActive: false,
  chips,
  lastResponseByIntent: {},
});

const wrapResolved = (
  content: string,
  extras: Omit<DialogueResponse, "content" | "messages" | "typingDelayMs" | "processingTimeMs">,
  messages?: string[],
): Omit<DialogueResponse, "typingDelayMs" | "processingTimeMs"> => ({
  content,
  messages: messages ?? [content],
  ...extras,
});

export class DialogueEngine {
  private states = new Map<string, DialogueState>();

  getChips(actor: ActorProfile, context: GameGlobalContext, intentId?: string): DialogueChip[] {
    const language = languageFromLocale(context.locale);
    const db = DialogueDB[language];
    const audience = actorAudience(actor);
    const intent = intentId ? db.intents[intentId] : null;
    const chips = intent?.chips?.length ? intent.chips : db.fallback.chips;

    return chips.filter((chip) => !chip.audience || chip.audience.includes(audience));
  }

  reset(chatId: string): void {
    this.states.delete(chatId);
  }

  async reply(request: DialogueRequest): Promise<DialogueResponse> {
    const processStartedAt = now();
    const language = languageFromLocale(request.globalContext.locale);
    const resolved = this.resolve(request, language);
    const timing = await waitForTypingDelay(resolved.messages.join(" "), processStartedAt);

    return {
      ...resolved,
      ...timing,
    };
  }

  private resolve(
    request: DialogueRequest,
    language: DialogueLanguage,
  ): Omit<DialogueResponse, "typingDelayMs" | "processingTimeMs"> {
    const db = DialogueDB[language];
    const state =
      this.states.get(request.chatId) ??
      stateSeed(this.getChips(request.actor, request.globalContext));

    if (request.chipId) {
      const chipResponse = db.chipResponses[request.chipId];
      const audience = actorAudience(request.actor);
      const chipIntent = chipResponse ? db.intents[chipResponse.intentId] : undefined;
      const chipAllowedByActor = chipIntent ? canUseIntent(chipIntent, request.actor) : true;

      if (
        chipResponse &&
        chipAllowedByActor &&
        (!chipResponse.audience || chipResponse.audience.includes(audience))
      ) {
        const content = randomItem(chipResponse.responses);
        const chips = this.getChips(request.actor, request.globalContext, chipResponse.intentId);
        const nextResponses = {
          ...state.lastResponseByIntent,
          [chipResponse.intentId]: content,
        };
        this.states.set(request.chatId, {
          clarificationCount: 0,
          fallbackActive: false,
          lastIntentId: chipResponse.intentId,
          lastInputSignature: request.chipId,
          lastResponseByIntent: nextResponses,
          chips,
        });

        return wrapResolved(content, {
          intentId: chipResponse.intentId,
          confidence: 1,
          chips,
          fallbackActive: false,
        });
      }

      if (chipResponse) {
        const content = randomItem(
          db.scopeCorrections[audience].byIntent?.[chipResponse.intentId] ??
            db.scopeCorrections[audience].default,
        );
        const chips = this.getChips(request.actor, request.globalContext);

        this.states.set(request.chatId, {
          ...state,
          fallbackActive: false,
          chips,
        });

        return wrapResolved(content, {
          intentId: `scope_${chipResponse.intentId}`,
          confidence: 0.92,
          chips,
          fallbackActive: false,
        });
      }
    }

    const input = request.input.trim();
    const normalizedInput = normalize(input);
    const tokens = tokenize(input);
    const allScored: ScoredIntent[] = [
      db.greetings,
      ...Object.values(db.intents),
    ]
      .map((intent) => ({
        intent,
        score: scoreIntent(intent, input, normalizedInput, tokens),
      }))
      .sort((a, b) => b.score - a.score);
    const scored = allScored.filter(({ intent }) => canUseIntent(intent, request.actor));

    const best = scored[0];
    const bestOverall = allScored[0];
    const agreementTag = hasAgreementTag(normalizedInput, language);
    const confident = best && best.score >= (agreementTag ? 0.28 : 0.38);
    const overallConfident = bestOverall && bestOverall.score >= (agreementTag ? 0.28 : 0.38);

    if (
      overallConfident &&
      bestOverall.intent.id !== best?.intent.id &&
      !canUseIntent(bestOverall.intent, request.actor)
    ) {
      const audience = actorAudience(request.actor);
      const content = randomItem(
        db.scopeCorrections[audience].byIntent?.[bestOverall.intent.id] ??
          db.scopeCorrections[audience].default,
      );
      const chips = this.getChips(request.actor, request.globalContext);

      this.states.set(request.chatId, {
        ...state,
        clarificationCount: 0,
        fallbackActive: false,
        lastIntentId: `scope_${bestOverall.intent.id}`,
        lastInputSignature: normalizedInput,
        chips,
      });

      return wrapResolved(content, {
        intentId: `scope_${bestOverall.intent.id}`,
        confidence: bestOverall.score,
        chips,
        fallbackActive: false,
      });
    }

    if (confident) {
      const intent = best.intent;
      const content =
        intent.requiresAgreement || agreementTag
          ? composeAgreementResponse(intent, request.actor, request.globalContext, language)
          : buildContextualResponse(intent, request.actor, request.globalContext, language) ??
            randomItem(intent.responses ?? db.prefixes.neutral);
      const chips = this.getChips(request.actor, request.globalContext, intent.id);
      const repeated =
        Boolean(state.lastResponseByIntent[intent.id]) &&
        (state.lastIntentId === intent.id ||
          tokenOverlap(normalizedInput, state.lastInputSignature) >= 0.68);
      const repeatNotice = randomItem(db.repeatNotices);
      const previousContent = state.lastResponseByIntent[intent.id];
      const messages = repeated ? [repeatNotice, previousContent] : [content];
      const storedContent = repeated ? previousContent : content;
      const nextResponses = {
        ...state.lastResponseByIntent,
        [intent.id]: storedContent,
      };

      this.states.set(request.chatId, {
        clarificationCount: 0,
        fallbackActive: false,
        lastIntentId: intent.id,
        lastInputSignature: normalizedInput,
        lastResponseByIntent: nextResponses,
        chips,
      });

      return wrapResolved(messages.join("\n"), {
        intentId: intent.id,
        confidence: best.score,
        chips,
        fallbackActive: false,
      }, messages);
    }

    const fallbackCount = state.fallbackActive ? state.clarificationCount + 1 : 1;
    const content =
      fallbackCount >= 2
        ? randomItem(db.fallback.terminalResponses)
        : randomItem(db.fallback.prompts);
    const chips = this.getChips(request.actor, request.globalContext);

    this.states.set(request.chatId, {
      clarificationCount: fallbackCount,
      fallbackActive: true,
      lastIntentId: state.lastIntentId,
      lastInputSignature: normalizedInput,
      lastResponseByIntent: state.lastResponseByIntent,
      chips,
    });

    return wrapResolved(content, {
      intentId: "fallback",
      confidence: 0,
      chips,
      fallbackActive: true,
    });
  }
}

export const dialogueEngine = new DialogueEngine();
