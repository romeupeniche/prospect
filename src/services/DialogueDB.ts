export type DialogueLanguage = "en" | "pt" | "es";

export type DialogueAudience = "player" | "staff" | "board" | "agent" | "external";

export interface DialogueChip {
  id: string;
  label: string;
  audience?: DialogueAudience[];
}

export interface DialogueIntent {
  id: string;
  patterns: RegExp[];
  tokens?: string[];
  audience?: DialogueAudience[];
  responses?: string[];
  requiresAgreement?: boolean;
  suffixes?: {
    positive: string[];
    negative: string[];
    neutral?: string[];
  };
  chips?: DialogueChip[];
}

export type DialogueScopeCorrections = Record<
  DialogueAudience,
  {
    default: string[];
    byIntent?: Record<string, string[]>;
  }
>;

export interface DialogueLanguageDB {
  greetings: DialogueIntent;
  intents: Record<string, DialogueIntent>;
  prefixes: {
    agreement: string[];
    disagreement: string[];
    neutral: string[];
  };
  agreementTags: RegExp[];
  repeatNotices: string[];
  scopeCorrections: DialogueScopeCorrections;
  fallback: {
    prompts: string[];
    secondPrompts: string[];
    terminalResponses: string[];
    chips: DialogueChip[];
  };
  chipResponses: Record<
    string,
    {
      intentId: string;
      responses: string[];
      audience?: DialogueAudience[];
    }
  >;
}

const sharedChips = {
  en: [
    { id: "playtime_unhappy", label: "Are you unhappy with your minutes?", audience: ["player", "agent"] },
    { id: "transfer_discussion", label: "Is this move better for your career?", audience: ["player", "agent"] },
    { id: "contract_discussion", label: "Let's talk about your contract.", audience: ["player", "agent"] },
    { id: "squad_status", label: "Any issues with the current squad?", audience: ["staff", "board"] },
    { id: "training_intensity", label: "How is the training workload?", audience: ["player", "staff"] },
    { id: "match_reaction", label: "What did you see in the last match?", audience: ["staff", "external"] },
    { id: "board_pressure", label: "What does the club need from the board?", audience: ["board", "staff"] },
    { id: "competition_rules", label: "Explain the competition situation.", audience: ["board", "external"] },
    { id: "fan_accountability", label: "What does the crowd expect from us?", audience: ["external"] },
  ] satisfies DialogueChip[],
  pt: [
    { id: "playtime_unhappy", label: "Você está insatisfeito com seus minutos?", audience: ["player", "agent"] },
    { id: "transfer_discussion", label: "Essa saída é melhor para sua carreira?", audience: ["player", "agent"] },
    { id: "contract_discussion", label: "Vamos falar do seu contrato.", audience: ["player", "agent"] },
    { id: "squad_status", label: "Há problemas no elenco atual?", audience: ["staff", "board"] },
    { id: "training_intensity", label: "Como está a carga de treino?", audience: ["player", "staff"] },
    { id: "match_reaction", label: "O que você viu no último jogo?", audience: ["staff", "external"] },
    { id: "board_pressure", label: "O que o clube precisa da diretoria?", audience: ["board", "staff"] },
    { id: "competition_rules", label: "Explique a situação da competição.", audience: ["board", "external"] },
    { id: "fan_accountability", label: "O que a torcida espera de nós?", audience: ["external"] },
  ] satisfies DialogueChip[],
  es: [
    { id: "playtime_unhappy", label: "¿Estás molesto con tus minutos?", audience: ["player", "agent"] },
    { id: "transfer_discussion", label: "¿Esta salida es mejor para tu carrera?", audience: ["player", "agent"] },
    { id: "contract_discussion", label: "Hablemos de tu contrato.", audience: ["player", "agent"] },
    { id: "squad_status", label: "¿Hay problemas en la plantilla actual?", audience: ["staff", "board"] },
    { id: "training_intensity", label: "¿Cómo está la carga de entrenamiento?", audience: ["player", "staff"] },
    { id: "match_reaction", label: "¿Qué viste en el último partido?", audience: ["staff", "external"] },
    { id: "board_pressure", label: "¿Qué necesita el club de la directiva?", audience: ["board", "staff"] },
    { id: "competition_rules", label: "Explique la situación de la competición.", audience: ["board", "external"] },
    { id: "fan_accountability", label: "¿Qué espera la afición de nosotros?", audience: ["external"] },
  ] satisfies DialogueChip[],
};

export const DialogueDB: Record<DialogueLanguage, DialogueLanguageDB> = {
  en: {
    greetings: {
      id: "greetings",
      patterns: [/what'?s (happening|up)\??$/i, /^how are you\??$/i, /^hey\b/i, /^hello\b/i],
      tokens: ["hello", "hi", "happening", "up", "boss"],
      responses: [
        "Hey boss, what's on your mind?",
        "I'm here, boss. What do you need?",
        "Nothing urgent from my side. Tell me what you want to discuss.",
        "Good to hear from you. What are we sorting out?",
        "I'm listening. Give me the context and I'll answer properly.",
      ],
    },
    intents: {
      transfer_discussion: {
        id: "transfer_discussion",
        audience: ["player", "agent", "staff"],
        patterns: [/transfer.*better/i, /move.*good.*career/i, /offer.*career/i, /leave.*club/i],
        tokens: ["transfer", "move", "offer", "career", "leave", "sale"],
        requiresAgreement: true,
        suffixes: {
          positive: [
            "I think I need this step in my career.",
            "It is a serious opportunity and I cannot ignore it.",
            "If the club respects the process, I would be open to listening.",
            "This could be the right moment for a bigger challenge.",
            "I feel the move might help me grow faster.",
          ],
          negative: [
            "I want to stay and fight for my spot.",
            "I still believe I can show my football here.",
            "I do not want this to become bigger than the team.",
            "I would rather prove myself before thinking about leaving.",
            "My focus is still this club unless the situation changes clearly.",
          ],
        },
      },
      squad_status: {
        id: "squad_status",
        audience: ["staff", "board"],
        patterns: [/current squad/i, /squad.*issue/i, /dressing room/i, /team need/i, /squad need/i, /need.*new player/i, /reinforcement/i],
        tokens: ["squad", "issues", "role", "dressing", "depth", "needs", "player", "reinforcement"],
        responses: [
          "The group needs clarity. If everyone understands the plan, the mood will settle.",
          "We are short in a couple of roles, but panic spending would hurt the sporting plan.",
          "The dressing room is manageable as long as selection decisions are explained early.",
          "The main need is balance: one reliable option and less uncertainty around fringe players.",
          "I would solve the internal roles first, then move in the market only where the squad is exposed.",
        ],
      },
      training_intensity: {
        id: "training_intensity",
        audience: ["player", "staff"],
        patterns: [/training/i, /intensity/i, /workload/i, /fitness/i],
        tokens: ["training", "intensity", "workload", "fitness", "recovery"],
        responses: [
          "The intensity is fine if recovery is managed properly.",
          "We can push harder, but not if it costs us sharpness on matchday.",
          "The players need rhythm, not just more work for the sake of it.",
          "I would keep the load controlled and add targeted technical sessions.",
          "Fitness is improving, but fatigue has to be watched closely this week.",
        ],
      },
      playtime_unhappy: {
        id: "playtime_unhappy",
        audience: ["player", "agent"],
        patterns: [/unhappy.*(playtime|minutes)/i, /minutes/i, /starting spot/i, /game time/i],
        tokens: ["minutes", "playtime", "starter", "bench", "unhappy", "role"],
        responses: [
          "I need to feel there is a real path to minutes, boss.",
          "If I am part of the plan, I need to see that on the pitch too.",
          "I can accept competition, but I need honest feedback about my role.",
          "The issue is not one match. I just need to know where I stand.",
          "Give me a clear route back into the team and I will keep working.",
        ],
      },
      contract_discussion: {
        id: "contract_discussion",
        audience: ["player", "agent"],
        patterns: [/contract/i, /renew/i, /salary/i, /wage/i],
        tokens: ["contract", "renewal", "salary", "wage", "bonus"],
        responses: [
          "I am open to talking, but the offer has to match my role and the club's faith in me.",
          "A renewal can work if it gives security and a clear sporting plan.",
          "Let's not make it public. Put the terms on the table and we can move properly.",
          "The numbers matter, but so does feeling valued in the project.",
          "I would rather settle this calmly than let the market create noise.",
        ],
      },
      match_reaction: {
        id: "match_reaction",
        audience: ["staff", "external"],
        patterns: [/last match/i, /match reaction/i, /performance/i, /what did you see/i],
        tokens: ["match", "performance", "reaction", "result", "played"],
        responses: [
          "The performance had moments, but the team must turn possession into clearer chances.",
          "We were too loose after losing the ball. That made the match feel more chaotic than it should.",
          "The result matters, but the bigger issue is control between midfield and attack.",
          "I saw effort, but not enough composure in the final third.",
          "The team needs better spacing before judging individual mistakes too harshly.",
        ],
      },
      board_pressure: {
        id: "board_pressure",
        audience: ["board", "staff", "external"],
        patterns: [/board/i, /expectation/i, /pressure/i, /budget/i, /target/i],
        tokens: ["board", "pressure", "expectation", "budget", "target", "objective"],
        responses: [
          "The board wants progress, but the decision must still protect the sporting plan.",
          "We need a firm line: ambition without panic spending.",
          "Targets should be demanding, but the club cannot change direction every bad week.",
          "The responsible move is to support the staff and keep the finances disciplined.",
          "I can back stronger demands if the resources and timeline are realistic.",
        ],
      },
      competition_rules: {
        id: "competition_rules",
        audience: ["board", "external"],
        patterns: [/competition/i, /fixture/i, /registration/i, /rules/i, /fine/i],
        tokens: ["competition", "fixture", "registration", "rules", "fine", "table"],
        responses: [
          "From a competition standpoint, the club must follow the formal notice and deadlines.",
          "Any appeal needs documentation, dates, and a clear regulatory basis.",
          "If the fixture is changed, the sporting department should receive the official timeline first.",
          "The safe route is to confirm receipt and reserve the right to contest the decision.",
          "We should separate administrative compliance from sporting disagreement.",
        ],
      },
      fan_accountability: {
        id: "fan_accountability",
        audience: ["external"],
        patterns: [/fans/i, /crowd/i, /supporters/i, /accountability/i, /explain/i],
        tokens: ["fans", "crowd", "supporters", "accountability", "stand"],
        responses: [
          "The crowd wants a direction, not speeches. Show decisions and they will understand more.",
          "People can accept a hard phase if they see commitment and honesty.",
          "The club needs to communicate without exposing the dressing room.",
          "The supporters want the team to fight, but they also want the board to stop improvising.",
          "If there is a plan, say it clearly. Silence makes every rumor louder.",
        ],
      },
    },
    prefixes: {
      agreement: ["Yes boss, I totally agree. ", "For sure. ", "I think you are right. ", "That makes sense to me. ", "I can agree with that. "],
      disagreement: ["I respectfully disagree, Romeu. ", "I don't see it that way. ", "I understand, but I disagree. ", "Not fully, boss. ", "I would be careful with that. "],
      neutral: ["I understand the point. ", "I see what you mean. ", "There is some truth in that. ", "Let me be honest. ", "From my side, I would say this. "],
    },
    agreementTags: [/don'?t you (agree|think)\??$/i, /wouldn'?t you say\??$/i, /right\??$/i],
    repeatNotices: [
      "I told you earlier, boss.",
      "We already touched on that.",
      "Same answer as before from my side.",
      "I do not want to repeat myself too much, but yes.",
      "As I said before.",
    ],
    scopeCorrections: {
      player: {
        default: [
          "I can only speak for my own role, form, contract, and mood. Squad planning is for the staff and board.",
          "That is not really something I would know from inside my position as a player.",
          "I do not want to pretend I know the club's full plan. Ask the staff about that part.",
          "From my side, I can talk about my football, minutes, and future. The rest is above me.",
          "I would rather not answer for the whole club when I only know my own situation.",
        ],
      },
      staff: {
        default: [
          "I can discuss the squad plan and training, but personal feelings about minutes need to come from the player.",
          "That sounds like a player-specific conversation. I can help you with the football context around it.",
          "I do not want to speak as if I am inside the player's head. I can judge role, form, and selection.",
          "From the staff side, I can explain the plan, not promise how the player feels.",
          "Bring me the sporting question and I will answer. Personal contract pressure is better handled directly.",
        ],
      },
      board: {
        default: [
          "From the board side, we should discuss objectives, budget, risk, and governance.",
          "That topic belongs more to the dressing room than to this administrative channel.",
          "We can support the structure, but we should not pretend to manage personal player conversations here.",
          "My answer has to stay institutional: finances, targets, compliance, and long-term direction.",
          "If you want a sporting read, ask the staff. If you want risk and resources, I can answer.",
        ],
      },
      agent: {
        default: [
          "I can speak for my client, his value, and his market options. I will not judge the whole squad for you.",
          "That is outside my lane unless it affects my client's future.",
          "Give me the contract or transfer question and I will be direct.",
          "I am not here as technical staff. I am here to protect my client's interests.",
          "If the question is about minutes, wages, or a move, I can answer properly.",
        ],
      },
      external: {
        default: [
          "I am outside the dressing room, so I can only react to what is public and visible.",
          "I will not invent internal details. I can talk about perception, pressure, and the public situation.",
          "That sounds like something for the club staff, not someone outside the operation.",
          "From outside, the question is about trust, communication, and results.",
          "I can give you the public read, but not private squad information.",
        ],
      },
    },
    fallback: {
      prompts: [
        "I didn't quite catch that.",
        "Can you be more specific?",
        "I need a clearer topic before I answer.",
        "Say that another way for me, boss.",
        "I am not sure which part you want me to address.",
      ],
      secondPrompts: [
        "I still need a clearer direction.",
        "Tell me which topic you want to discuss.",
        "Give me the subject first: squad, contract, training, match, or board.",
        "I do not want to guess wrong.",
        "Pick the angle and I will answer directly.",
      ],
      terminalResponses: [
        "Let's reset this. Pick the topic and I will answer directly.",
        "I do not want to guess wrong, boss. Choose one of the options below.",
        "Use one of these topics and we can continue properly.",
        "I need a concrete football topic to keep this useful.",
        "Choose the route below and I will respond from there.",
      ],
      chips: sharedChips.en,
    },
    chipResponses: Object.fromEntries(
      Object.entries({
        playtime_unhappy: [
          "Yes, minutes matter to me. I can accept competition, but I need a real pathway.",
          "If I keep working and never get a chance, it becomes hard to stay patient.",
          "I do not need guarantees, but I do need honesty about my role.",
          "The only thing I ask is a fair route back into the team.",
          "I can wait if there is a plan, not if I am just being parked.",
        ],
        transfer_discussion: [
          "The move could make sense, but I need to know whether the club still counts on me.",
          "If the offer is serious, we should discuss it calmly and professionally.",
          "I am not pushing for drama. I just want clarity before the market moves on.",
          "It depends on the sporting plan here and the size of the opportunity there.",
          "I will listen, but I do not want this handled through rumors.",
        ],
        contract_discussion: [
          "For the contract, I need security and a role that matches the responsibility you expect from me.",
          "A renewal is possible if the numbers and the project are both clear.",
          "Let's keep it professional: terms, timeline, and sporting plan.",
          "I want to feel valued, not just retained.",
          "If the club wants me long term, the offer should show that.",
        ],
        squad_status: [
          "About the squad, the main thing is clarity. Players need to know where they stand.",
          "The structure is workable, but we need sharper decisions on roles.",
          "There are gaps, but the first fix is internal organization.",
          "I would not overload the market before solving selection clarity.",
          "The squad needs direction more than noise.",
        ],
        training_intensity: [
          "On training, I can push, but I do not want careless overload before matches.",
          "The load is acceptable if recovery is respected.",
          "We can raise intensity in specific drills, not across the whole week.",
          "The team needs sharper sessions, not just longer ones.",
          "I would balance fitness work with tactical repetition.",
        ],
        match_reaction: [
          "The match showed effort, but also a lack of control after turnovers.",
          "We need better support around the ball and more patience in the final third.",
          "The team created some pressure, but not enough clean chances.",
          "The biggest problem was spacing, not desire.",
          "It is fixable if we adjust the distances between lines.",
        ],
        board_pressure: [
          "The club needs ambition, but not reckless pressure.",
          "The board should support the plan and judge progress with context.",
          "If targets are high, resources and time must match them.",
          "The public message has to be firm, not emotional.",
          "We need discipline now more than a dramatic promise.",
        ],
        competition_rules: [
          "The competition issue should be handled through official documents and deadlines.",
          "Any challenge needs a clean regulatory basis.",
          "Confirm receipt first, then decide if the club appeals.",
          "The sporting department needs the official fixture impact immediately.",
          "We should avoid informal promises on a formal matter.",
        ],
        fan_accountability: [
          "The crowd wants visible decisions and a team that competes.",
          "Supporters can accept a hard week, but not silence.",
          "Say the plan clearly and show it with actions.",
          "The club has to respect the fans without letting anger run the strategy.",
          "A direct statement is better than hiding behind generic phrases.",
        ],
      }).map(([intentId, responses]) => [intentId, { intentId, responses }]),
    ),
  },
  pt: {
    greetings: {
      id: "greetings",
      patterns: [/o que (tá|ta|está|esta) acontecendo\??$/i, /^como você está\??$/i, /^fala\b/i, /^olá\b/i],
      tokens: ["olá", "oi", "fala", "acontecendo", "presidente"],
      responses: [
        "Fala, presidente. O que você tem em mente?",
        "Estou aqui, presidente. O que precisamos resolver?",
        "Nada urgente do meu lado. Pode falar.",
        "Bom te ouvir. Qual é o assunto?",
        "Estou ouvindo. Me dá o contexto e eu respondo direito.",
      ],
    },
    intents: {
      transfer_discussion: {
        id: "transfer_discussion",
        audience: ["player", "agent", "staff"],
        patterns: [/transferência.*melhor/i, /proposta.*carreira/i, /saída.*carreira/i, /sair.*clube/i],
        tokens: ["transferência", "proposta", "saída", "carreira", "mercado"],
        requiresAgreement: true,
        suffixes: {
          positive: [
            "Acho que eu preciso desse passo na minha carreira.",
            "É uma oportunidade séria e eu não posso ignorar.",
            "Se o clube conduzir tudo com respeito, eu aceitaria ouvir.",
            "Talvez seja o momento certo para um desafio maior.",
            "Sinto que essa mudança pode acelerar meu crescimento.",
          ],
          negative: [
            "Quero ficar e brigar pelo meu espaço.",
            "Ainda acredito que posso mostrar meu futebol aqui.",
            "Não quero que isso fique maior do que o time.",
            "Prefiro provar meu valor antes de pensar em sair.",
            "Meu foco ainda é este clube, a não ser que o cenário mude claramente.",
          ],
        },
      },
      squad_status: {
        id: "squad_status",
        audience: ["staff", "board"],
        patterns: [/elenco atual/i, /problema.*elenco/i, /vestiário/i, /necessidade.*elenco/i, /precisa.*jogador/i, /precisa.*reforço/i, /nova peça/i, /team need/i, /need.*new player/i, /reinforcement/i],
        tokens: ["elenco", "problema", "papel", "vestiário", "necessidade", "jogador", "reforço", "team", "need", "player"],
        responses: [
          "O grupo precisa de clareza. Quando todos entendem o plano, o ambiente acalma.",
          "Estamos curtos em algumas funções, mas gastar no desespero atrapalharia o plano esportivo.",
          "O vestiário é administrável se as decisões de escalação forem explicadas cedo.",
          "A maior necessidade é equilíbrio: uma opção confiável e menos indefinição nos jogadores de rotação.",
          "Eu resolveria primeiro os papéis internos e só depois atacaria o mercado onde o elenco está exposto.",
        ],
      },
      training_intensity: {
        id: "training_intensity",
        audience: ["player", "staff"],
        patterns: [/treino/i, /intensidade/i, /carga/i, /físico/i],
        tokens: ["treino", "intensidade", "carga", "físico", "recuperação"],
        responses: [
          "A intensidade está boa se a recuperação for controlada.",
          "Podemos apertar mais, mas não se isso tirar nossa explosão no jogo.",
          "Os jogadores precisam de ritmo, não só de mais carga por obrigação.",
          "Eu manteria a carga controlada e colocaria sessões técnicas mais direcionadas.",
          "O físico está evoluindo, mas a fadiga precisa ser vigiada nesta semana.",
        ],
      },
      playtime_unhappy: {
        id: "playtime_unhappy",
        audience: ["player", "agent"],
        patterns: [/insatisfeito.*minutos/i, /tempo de jogo/i, /titularidade/i, /minutos/i],
        tokens: ["minutos", "jogar", "titular", "banco", "insatisfeito", "papel"],
        responses: [
          "Eu preciso sentir que existe caminho real para jogar, presidente.",
          "Se faço parte do plano, preciso ver isso também dentro de campo.",
          "Aceito concorrência, mas preciso de sinceridade sobre meu papel.",
          "O problema não é um jogo. Eu só preciso saber onde estou.",
          "Me dê uma rota clara para voltar ao time e eu continuo trabalhando.",
        ],
      },
      contract_discussion: {
        id: "contract_discussion",
        audience: ["player", "agent"],
        patterns: [/contrato/i, /renova/i, /salário/i, /ordenado/i],
        tokens: ["contrato", "renovação", "salário", "ordenado", "bônus"],
        responses: [
          "Estou aberto a conversar, mas a proposta precisa combinar com meu papel e com a confiança do clube.",
          "Uma renovação pode funcionar se trouxer segurança e um plano esportivo claro.",
          "Vamos evitar vazamento. Coloquem os termos na mesa e seguimos corretamente.",
          "Os números importam, mas eu também preciso me sentir valorizado no projeto.",
          "Prefiro resolver isso com calma do que deixar o mercado criar ruído.",
        ],
      },
      match_reaction: {
        id: "match_reaction",
        audience: ["staff", "external"],
        patterns: [/último jogo/i, /reação.*jogo/i, /desempenho/i, /o que você viu/i],
        tokens: ["jogo", "desempenho", "reação", "resultado", "partida"],
        responses: [
          "O desempenho teve momentos bons, mas o time precisa transformar posse em chances mais claras.",
          "Ficamos soltos demais depois de perder a bola. Isso deixou o jogo mais caótico do que deveria.",
          "O resultado pesa, mas o problema maior é o controle entre meio e ataque.",
          "Eu vi entrega, mas pouca calma no último terço.",
          "O time precisa melhorar o espaçamento antes de colocar todos os erros em cima de indivíduos.",
        ],
      },
      board_pressure: {
        id: "board_pressure",
        audience: ["board", "staff", "external"],
        patterns: [/diretoria/i, /expectativa/i, /pressão/i, /orçamento/i, /meta/i],
        tokens: ["diretoria", "pressão", "expectativa", "orçamento", "meta"],
        responses: [
          "A diretoria quer evolução, mas a decisão precisa proteger o plano esportivo.",
          "Precisamos de linha firme: ambição sem desespero no mercado.",
          "As metas devem ser exigentes, mas o clube não pode mudar de direção a cada semana ruim.",
          "O movimento responsável é apoiar a comissão e manter disciplina financeira.",
          "Eu apoio cobranças maiores se os recursos e o prazo forem realistas.",
        ],
      },
      competition_rules: {
        id: "competition_rules",
        audience: ["board", "external"],
        patterns: [/competição/i, /tabela/i, /inscrição/i, /regulamento/i, /multa/i],
        tokens: ["competição", "tabela", "inscrição", "regulamento", "multa"],
        responses: [
          "Pelo lado da competição, o clube precisa seguir o ofício formal e os prazos.",
          "Qualquer recurso exige documentação, datas e uma base regulamentar clara.",
          "Se a tabela mudar, o departamento esportivo precisa receber primeiro o impacto oficial.",
          "O caminho seguro é confirmar ciência e preservar o direito de contestar a decisão.",
          "Precisamos separar cumprimento administrativo de discordância esportiva.",
        ],
      },
      fan_accountability: {
        id: "fan_accountability",
        audience: ["external"],
        patterns: [/torcida/i, /arquibancada/i, /cobrança/i, /explicar/i, /responsabilidade/i],
        tokens: ["torcida", "arquibancada", "cobrança", "responsabilidade", "explicar"],
        responses: [
          "A torcida quer direção, não discurso. Mostre decisões e ela entende melhor.",
          "A arquibancada aceita fase difícil se enxergar compromisso e honestidade.",
          "O clube precisa comunicar sem expor o vestiário.",
          "A torcida quer luta em campo, mas também quer a diretoria parando de improvisar.",
          "Se existe plano, fale com clareza. Silêncio deixa qualquer rumor maior.",
        ],
      },
    },
    prefixes: {
      agreement: ["Sim, presidente, concordo totalmente. ", "Com certeza. ", "Acho que você está certo. ", "Isso faz sentido para mim. ", "Posso concordar com isso. "],
      disagreement: ["Eu discordo com respeito, Romeu. ", "Não vejo dessa forma. ", "Entendo, mas discordo. ", "Não totalmente, presidente. ", "Eu teria cuidado com isso. "],
      neutral: ["Entendo o ponto. ", "Sei o que você quer dizer. ", "Há verdade nisso. ", "Vou ser sincero. ", "Do meu lado, eu diria o seguinte. "],
    },
    agreementTags: [/não acha\??$/i, /você concorda\??$/i, /certo\??$/i, /não concorda\??$/i],
    repeatNotices: [
      "Eu te falei isso antes, presidente.",
      "Nós já tocamos nesse ponto.",
      "Do meu lado, a resposta continua a mesma.",
      "Não quero ficar repetindo demais, mas sim.",
      "Como eu disse antes.",
    ],
    scopeCorrections: {
      player: {
        default: [
          "Eu só posso falar do meu papel, forma, contrato e moral. Planejamento de elenco é com comissão e diretoria.",
          "Isso não é algo que eu saiba responder da minha posição de jogador.",
          "Não quero fingir que conheço o plano completo do clube. Pergunte isso à comissão.",
          "Do meu lado, posso falar do meu futebol, dos meus minutos e do meu futuro. O resto está acima de mim.",
          "Prefiro não responder pelo clube inteiro quando eu conheço a minha própria situação.",
        ],
      },
      staff: {
        default: [
          "Eu posso discutir planejamento de elenco e treino, mas sentimento pessoal sobre minutos precisa vir do jogador.",
          "Isso parece uma conversa específica do atleta. Posso ajudar com o contexto futebolístico.",
          "Não quero falar como se estivesse dentro da cabeça do jogador. Posso avaliar função, forma e escalação.",
          "Pelo lado da comissão, explico o plano; não prometo como o jogador se sente.",
          "Traga a pergunta esportiva e eu respondo. Pressão contratual pessoal é melhor tratar diretamente.",
        ],
      },
      board: {
        default: [
          "Pelo lado da diretoria, devemos falar de objetivos, orçamento, risco e governança.",
          "Esse assunto pertence mais ao vestiário do que a este canal administrativo.",
          "Podemos apoiar a estrutura, mas não fingir que gerimos conversas pessoais aqui.",
          "Minha resposta precisa ficar institucional: finanças, metas, conformidade e direção de longo prazo.",
          "Se quer leitura esportiva, fale com a comissão. Se quer risco e recursos, eu respondo.",
        ],
      },
      agent: {
        default: [
          "Posso falar pelo meu cliente, pelo valor dele e pelas opções de mercado. Não vou avaliar o elenco inteiro.",
          "Isso está fora da minha área, a não ser que afete o futuro do meu cliente.",
          "Traga a pergunta de contrato ou transferência e eu serei direto.",
          "Não estou aqui como comissão técnica. Estou aqui para proteger os interesses do meu cliente.",
          "Se a pergunta é sobre minutos, salário ou saída, consigo responder direito.",
        ],
      },
      external: {
        default: [
          "Estou fora do vestiário, então só posso reagir ao que é público e visível.",
          "Não vou inventar detalhe interno. Posso falar de percepção, pressão e situação pública.",
          "Isso parece assunto da comissão do clube, não de alguém de fora da operação.",
          "Visto de fora, a pergunta é sobre confiança, comunicação e resultado.",
          "Posso dar a leitura pública, mas não informação privada do elenco.",
        ],
      },
    },
    fallback: {
      prompts: [
        "Não entendi muito bem.",
        "Pode ser mais específico?",
        "Preciso de um assunto mais claro antes de responder.",
        "Fale isso de outro jeito para mim, presidente.",
        "Não tenho certeza de qual parte você quer que eu responda.",
      ],
      secondPrompts: [
        "Ainda preciso de uma direção mais clara.",
        "Me diga qual assunto você quer tratar.",
        "Me dê o tema primeiro: elenco, contrato, treino, jogo ou diretoria.",
        "Não quero interpretar errado.",
        "Escolha o ângulo e eu respondo direto.",
      ],
      terminalResponses: [
        "Vamos reorganizar isso. Escolha o tema e eu respondo direto.",
        "Não quero interpretar errado, presidente. Escolha uma das opções abaixo.",
        "Use um destes assuntos e continuamos direito.",
        "Preciso de um tema concreto de futebol para manter isso útil.",
        "Escolha o caminho abaixo e eu respondo a partir dali.",
      ],
      chips: sharedChips.pt,
    },
    chipResponses: Object.fromEntries(
      Object.entries({
        playtime_unhappy: [
          "Sim, minutos importam. Aceito competição, mas preciso enxergar um caminho real.",
          "Se eu sigo trabalhando e nunca recebo chance, fica difícil manter a paciência.",
          "Não preciso de garantia, mas preciso de honestidade sobre meu papel.",
          "A única coisa que peço é uma rota justa para voltar ao time.",
          "Posso esperar se houver plano, não se eu estiver apenas encostado.",
        ],
        transfer_discussion: [
          "A saída pode fazer sentido, mas preciso saber se o clube ainda conta comigo.",
          "Se a proposta é séria, devemos conversar com calma e profissionalismo.",
          "Não estou procurando drama. Só quero clareza antes que o mercado siga em frente.",
          "Depende do plano esportivo aqui e do tamanho da oportunidade lá.",
          "Eu escuto, mas não quero isso conduzido por rumor.",
        ],
        contract_discussion: [
          "No contrato, preciso de segurança e de um papel compatível com a responsabilidade que esperam de mim.",
          "Uma renovação é possível se os números e o projeto estiverem claros.",
          "Vamos manter profissional: termos, prazo e plano esportivo.",
          "Quero me sentir valorizado, não apenas segurado.",
          "Se o clube me quer a longo prazo, a proposta precisa mostrar isso.",
        ],
        squad_status: [
          "Sobre o elenco, o principal é clareza. O grupo precisa saber onde cada um está.",
          "A estrutura funciona, mas precisamos de decisões mais claras sobre funções.",
          "Existem lacunas, mas a primeira correção é organização interna.",
          "Eu não sobrecarregaria o mercado antes de resolver a clareza de escalação.",
          "O elenco precisa de direção mais do que de ruído.",
        ],
        training_intensity: [
          "Sobre treino, eu posso apertar, mas não quero carga descuidada antes dos jogos.",
          "A carga é aceitável se a recuperação for respeitada.",
          "Podemos subir intensidade em exercícios específicos, não na semana toda.",
          "O time precisa de sessões mais afiadas, não apenas mais longas.",
          "Eu equilibraria trabalho físico com repetição tática.",
        ],
        match_reaction: [
          "O jogo mostrou entrega, mas também falta de controle depois das perdas.",
          "Precisamos de melhor apoio ao redor da bola e mais paciência no último terço.",
          "O time gerou pressão, mas não o bastante em chances limpas.",
          "O maior problema foi o espaçamento, não a vontade.",
          "É corrigível se ajustarmos as distâncias entre as linhas.",
        ],
        board_pressure: [
          "O clube precisa de ambição, mas não de pressão imprudente.",
          "A diretoria deve apoiar o plano e avaliar progresso com contexto.",
          "Se as metas são altas, recursos e tempo precisam acompanhar.",
          "A mensagem pública precisa ser firme, não emocional.",
          "Precisamos de disciplina agora, mais do que promessa dramática.",
        ],
        competition_rules: [
          "A questão da competição deve ser tratada por documentos oficiais e prazos.",
          "Qualquer contestação precisa de base regulamentar limpa.",
          "Confirme ciência primeiro, depois decida se o clube recorre.",
          "O departamento esportivo precisa receber imediatamente o impacto oficial da tabela.",
          "Devemos evitar promessas informais em assunto formal.",
        ],
        fan_accountability: [
          "A torcida quer decisões visíveis e um time que compita.",
          "A arquibancada aceita uma semana difícil, mas não aceita silêncio.",
          "Fale o plano com clareza e mostre com ações.",
          "O clube precisa respeitar a torcida sem deixar a raiva comandar a estratégia.",
          "Uma declaração direta é melhor do que se esconder em frases genéricas.",
        ],
      }).map(([intentId, responses]) => [intentId, { intentId, responses }]),
    ),
  },
  es: {
    greetings: {
      id: "greetings",
      patterns: [/qué está pasando\??$/i, /que está pasando\??$/i, /^cómo estás\??$/i, /^hola\b/i],
      tokens: ["hola", "pasa", "pasando", "presidente"],
      responses: [
        "Hola, presidente. ¿Qué tiene en mente?",
        "Estoy aquí, presidente. ¿Qué necesitamos resolver?",
        "Nada urgente de mi lado. Dígame.",
        "Me alegra saber de usted. ¿Cuál es el tema?",
        "Estoy escuchando. Déme el contexto y respondo bien.",
      ],
    },
    intents: {
      transfer_discussion: {
        id: "transfer_discussion",
        audience: ["player", "agent", "staff"],
        patterns: [/traspaso.*mejor/i, /oferta.*carrera/i, /salida.*carrera/i, /salir.*club/i],
        tokens: ["traspaso", "oferta", "salida", "carrera", "mercado"],
        requiresAgreement: true,
        suffixes: {
          positive: [
            "Creo que necesito este paso en mi carrera.",
            "Es una oportunidad seria y no puedo ignorarla.",
            "Si el club maneja todo con respeto, estaría abierto a escuchar.",
            "Tal vez sea el momento adecuado para un desafío mayor.",
            "Siento que este cambio puede acelerar mi crecimiento.",
          ],
          negative: [
            "Quiero quedarme y pelear por mi sitio.",
            "Aún creo que puedo demostrar mi fútbol aquí.",
            "No quiero que esto sea más grande que el equipo.",
            "Prefiero demostrar mi valor antes de pensar en salir.",
            "Mi foco sigue siendo este club, salvo que el escenario cambie claramente.",
          ],
        },
      },
      squad_status: {
        id: "squad_status",
        audience: ["staff", "board"],
        patterns: [/plantilla actual/i, /problema.*plantilla/i, /vestuario/i, /necesidad.*plantilla/i, /necesita.*jugador/i, /necesita.*refuerzo/i],
        tokens: ["plantilla", "problema", "vestuario", "necesidad", "equilibrio", "jugador", "refuerzo"],
        responses: [
          "El grupo necesita claridad. Cuando todos entienden el plan, el ambiente se calma.",
          "Estamos cortos en algunas funciones, pero gastar con desesperación dañaría el plan deportivo.",
          "El vestuario es manejable si las decisiones de selección se explican temprano.",
          "La mayor necesidad es equilibrio: una opción fiable y menos incertidumbre en la rotación.",
          "Primero resolvería los roles internos y luego iría al mercado donde la plantilla esté expuesta.",
        ],
      },
      training_intensity: {
        id: "training_intensity",
        audience: ["player", "staff"],
        patterns: [/entrenamiento/i, /intensidad/i, /carga/i, /físico/i],
        tokens: ["entrenamiento", "intensidad", "carga", "físico", "recuperación"],
        responses: [
          "La intensidad está bien si la recuperación se controla correctamente.",
          "Podemos apretar más, pero no si perdemos frescura el día del partido.",
          "Los jugadores necesitan ritmo, no solo más carga por obligación.",
          "Mantendría la carga controlada y añadiría sesiones técnicas más dirigidas.",
          "El físico mejora, pero la fatiga debe vigilarse esta semana.",
        ],
      },
      playtime_unhappy: {
        id: "playtime_unhappy",
        audience: ["player", "agent"],
        patterns: [/molesto.*minutos/i, /tiempo de juego/i, /titularidad/i, /minutos/i],
        tokens: ["minutos", "jugar", "titular", "banquillo", "molesto", "rol"],
        responses: [
          "Necesito sentir que hay un camino real para jugar, presidente.",
          "Si soy parte del plan, también necesito verlo en el campo.",
          "Acepto competir, pero necesito sinceridad sobre mi rol.",
          "El problema no es un partido. Solo necesito saber dónde estoy.",
          "Déme una ruta clara para volver al equipo y seguiré trabajando.",
        ],
      },
      contract_discussion: {
        id: "contract_discussion",
        audience: ["player", "agent"],
        patterns: [/contrato/i, /renova/i, /salario/i, /sueldo/i],
        tokens: ["contrato", "renovación", "salario", "sueldo", "bono"],
        responses: [
          "Estoy abierto a hablar, pero la oferta debe encajar con mi rol y la confianza del club.",
          "Una renovación puede funcionar si da seguridad y un plan deportivo claro.",
          "Evitemos filtraciones. Pongan los términos sobre la mesa y avanzamos bien.",
          "Los números importan, pero también necesito sentirme valorado en el proyecto.",
          "Prefiero resolver esto con calma antes de que el mercado cree ruido.",
        ],
      },
      match_reaction: {
        id: "match_reaction",
        audience: ["staff", "external"],
        patterns: [/último partido/i, /reacción.*partido/i, /rendimiento/i, /qué viste/i],
        tokens: ["partido", "rendimiento", "reacción", "resultado", "juego"],
        responses: [
          "El rendimiento tuvo momentos, pero el equipo debe convertir posesión en ocasiones más claras.",
          "Quedamos demasiado abiertos tras perder la pelota. Eso volvió el partido más caótico.",
          "El resultado pesa, pero el problema mayor es el control entre medio y ataque.",
          "Vi entrega, pero poca calma en el último tercio.",
          "El equipo necesita mejorar el espaciado antes de culpar demasiado a individuos.",
        ],
      },
      board_pressure: {
        id: "board_pressure",
        audience: ["board", "staff", "external"],
        patterns: [/directiva/i, /expectativa/i, /presión/i, /presupuesto/i, /meta/i],
        tokens: ["directiva", "presión", "expectativa", "presupuesto", "meta"],
        responses: [
          "La directiva quiere progreso, pero la decisión debe proteger el plan deportivo.",
          "Necesitamos una línea firme: ambición sin desesperación en el mercado.",
          "Las metas deben ser exigentes, pero el club no puede cambiar de dirección cada mala semana.",
          "El movimiento responsable es apoyar al cuerpo técnico y mantener disciplina financiera.",
          "Puedo respaldar exigencias mayores si los recursos y el plazo son realistas.",
        ],
      },
      competition_rules: {
        id: "competition_rules",
        audience: ["board", "external"],
        patterns: [/competición/i, /calendario/i, /inscripción/i, /reglamento/i, /multa/i],
        tokens: ["competición", "calendario", "inscripción", "reglamento", "multa"],
        responses: [
          "Desde la competición, el club debe seguir la comunicación formal y los plazos.",
          "Cualquier recurso necesita documentación, fechas y una base reglamentaria clara.",
          "Si cambia el calendario, el área deportiva debe recibir primero el impacto oficial.",
          "La ruta segura es confirmar recepción y reservar el derecho a contestar.",
          "Hay que separar cumplimiento administrativo de desacuerdo deportivo.",
        ],
      },
      fan_accountability: {
        id: "fan_accountability",
        audience: ["external"],
        patterns: [/afición/i, /hinchada/i, /grada/i, /responsabilidad/i, /explicar/i],
        tokens: ["afición", "hinchada", "grada", "responsabilidad", "explicar"],
        responses: [
          "La afición quiere dirección, no discursos. Muestre decisiones y entenderá más.",
          "La grada acepta una fase difícil si ve compromiso y honestidad.",
          "El club debe comunicar sin exponer el vestuario.",
          "La afición quiere pelea en el campo, pero también que la directiva deje de improvisar.",
          "Si hay un plan, dígalo con claridad. El silencio agranda cualquier rumor.",
        ],
      },
    },
    prefixes: {
      agreement: ["Sí, presidente, estoy totalmente de acuerdo. ", "Por supuesto. ", "Creo que usted tiene razón. ", "Eso tiene sentido para mí. ", "Puedo estar de acuerdo con eso. "],
      disagreement: ["Discrepo con respeto, Romeu. ", "No lo veo de esa manera. ", "Entiendo, pero discrepo. ", "No totalmente, presidente. ", "Tendría cuidado con eso. "],
      neutral: ["Entiendo el punto. ", "Veo lo que quiere decir. ", "Hay algo de verdad en eso. ", "Seré sincero. ", "Desde mi lado, diría esto. "],
    },
    agreementTags: [/no crees\??$/i, /estás de acuerdo\??$/i, /verdad\??$/i],
    repeatNotices: [
      "Ya se lo dije antes, presidente.",
      "Ya tocamos ese punto.",
      "Desde mi lado, la respuesta sigue siendo la misma.",
      "No quiero repetirme demasiado, pero sí.",
      "Como dije antes.",
    ],
    scopeCorrections: {
      player: {
        default: [
          "Solo puedo hablar de mi rol, mi forma, mi contrato y mi ánimo. La planificación de plantilla es del cuerpo técnico y la directiva.",
          "Eso no es algo que pueda saber desde mi posición de jugador.",
          "No quiero fingir que conozco todo el plan del club. Pregunte eso al cuerpo técnico.",
          "De mi lado, puedo hablar de mi fútbol, mis minutos y mi futuro. Lo demás está por encima de mí.",
          "Prefiero no responder por todo el club cuando solo conozco mi situación.",
        ],
      },
      staff: {
        default: [
          "Puedo hablar de planificación de plantilla y entrenamiento, pero los sentimientos personales sobre minutos deben venir del jugador.",
          "Eso parece una conversación específica del futbolista. Puedo ayudar con el contexto deportivo.",
          "No quiero hablar como si estuviera dentro de la cabeza del jugador. Puedo evaluar rol, forma y selección.",
          "Desde el cuerpo técnico explico el plan; no prometo cómo se siente el jugador.",
          "Traiga la pregunta deportiva y respondo. La presión contractual personal se trata mejor directamente.",
        ],
      },
      board: {
        default: [
          "Desde la directiva, debemos hablar de objetivos, presupuesto, riesgo y gobernanza.",
          "Ese asunto pertenece más al vestuario que a este canal administrativo.",
          "Podemos apoyar la estructura, pero no fingir que gestionamos conversaciones personales aquí.",
          "Mi respuesta debe ser institucional: finanzas, metas, cumplimiento y dirección a largo plazo.",
          "Si quiere lectura deportiva, hable con el cuerpo técnico. Si quiere riesgo y recursos, puedo responder.",
        ],
      },
      agent: {
        default: [
          "Puedo hablar por mi cliente, su valor y sus opciones de mercado. No voy a evaluar toda la plantilla.",
          "Eso está fuera de mi área salvo que afecte el futuro de mi cliente.",
          "Traiga la pregunta de contrato o traspaso y seré directo.",
          "No estoy aquí como cuerpo técnico. Estoy aquí para proteger los intereses de mi cliente.",
          "Si la pregunta es sobre minutos, salario o salida, puedo responder bien.",
        ],
      },
      external: {
        default: [
          "Estoy fuera del vestuario, así que solo puedo reaccionar a lo público y visible.",
          "No voy a inventar detalles internos. Puedo hablar de percepción, presión y situación pública.",
          "Eso parece asunto del cuerpo técnico del club, no de alguien fuera de la operación.",
          "Desde fuera, la pregunta es sobre confianza, comunicación y resultados.",
          "Puedo darle la lectura pública, pero no información privada de la plantilla.",
        ],
      },
    },
    fallback: {
      prompts: [
        "No entendí bien.",
        "¿Puede ser más específico?",
        "Necesito un tema más claro antes de responder.",
        "Dígalo de otra forma para mí, presidente.",
        "No estoy seguro de qué parte quiere que responda.",
      ],
      secondPrompts: [
        "Todavía necesito una dirección más clara.",
        "Dígame qué tema quiere tratar.",
        "Déme primero el tema: plantilla, contrato, entrenamiento, partido o directiva.",
        "No quiero interpretarlo mal.",
        "Elija el ángulo y respondo directo.",
      ],
      terminalResponses: [
        "Reorganicemos esto. Elija el tema y respondo directo.",
        "No quiero interpretarlo mal, presidente. Elija una de las opciones abajo.",
        "Use uno de estos temas y seguimos correctamente.",
        "Necesito un tema concreto de fútbol para que esto siga siendo útil.",
        "Elija el camino abajo y respondo desde ahí.",
      ],
      chips: sharedChips.es,
    },
    chipResponses: Object.fromEntries(
      Object.entries({
        playtime_unhappy: [
          "Sí, los minutos importan. Acepto competir, pero necesito ver un camino real.",
          "Si sigo trabajando y nunca recibo oportunidad, se hace difícil mantener la paciencia.",
          "No necesito garantías, pero sí honestidad sobre mi rol.",
          "Lo único que pido es una ruta justa para volver al equipo.",
          "Puedo esperar si hay un plan, no si solo estoy apartado.",
        ],
        transfer_discussion: [
          "La salida puede tener sentido, pero necesito saber si el club aún cuenta conmigo.",
          "Si la oferta es seria, debemos hablar con calma y profesionalismo.",
          "No busco drama. Solo quiero claridad antes de que el mercado siga adelante.",
          "Depende del plan deportivo aquí y del tamaño de la oportunidad allí.",
          "Escucharé, pero no quiero que esto se maneje por rumores.",
        ],
        contract_discussion: [
          "En el contrato, necesito seguridad y un rol acorde con la responsabilidad que esperan de mí.",
          "Una renovación es posible si los números y el proyecto están claros.",
          "Mantengámoslo profesional: términos, plazo y plan deportivo.",
          "Quiero sentirme valorado, no solo retenido.",
          "Si el club me quiere a largo plazo, la oferta debe mostrarlo.",
        ],
        squad_status: [
          "Sobre la plantilla, lo principal es claridad. El grupo necesita saber dónde está cada uno.",
          "La estructura puede funcionar, pero necesitamos decisiones más claras sobre roles.",
          "Hay huecos, pero la primera corrección es la organización interna.",
          "No sobrecargaría el mercado antes de resolver la claridad de selección.",
          "La plantilla necesita dirección más que ruido.",
        ],
        training_intensity: [
          "Sobre entrenamiento, puedo apretar, pero no quiero una carga descuidada antes de los partidos.",
          "La carga es aceptable si se respeta la recuperación.",
          "Podemos subir intensidad en ejercicios específicos, no en toda la semana.",
          "El equipo necesita sesiones más afiladas, no solo más largas.",
          "Equilibraría trabajo físico con repetición táctica.",
        ],
        match_reaction: [
          "El partido mostró entrega, pero también falta de control tras las pérdidas.",
          "Necesitamos mejor apoyo alrededor de la pelota y más paciencia en el último tercio.",
          "El equipo generó presión, pero no suficientes ocasiones limpias.",
          "El mayor problema fue el espaciado, no la voluntad.",
          "Es corregible si ajustamos las distancias entre líneas.",
        ],
        board_pressure: [
          "El club necesita ambición, pero no presión imprudente.",
          "La directiva debe apoyar el plan y evaluar progreso con contexto.",
          "Si las metas son altas, recursos y tiempo deben acompañarlas.",
          "El mensaje público debe ser firme, no emocional.",
          "Necesitamos disciplina ahora, más que una promesa dramática.",
        ],
        competition_rules: [
          "La cuestión de la competición debe tratarse con documentos oficiales y plazos.",
          "Cualquier impugnación necesita una base reglamentaria limpia.",
          "Confirme recepción primero y luego decida si el club recurre.",
          "El área deportiva necesita recibir de inmediato el impacto oficial del calendario.",
          "Debemos evitar promesas informales en un asunto formal.",
        ],
        fan_accountability: [
          "La afición quiere decisiones visibles y un equipo que compita.",
          "La grada acepta una semana difícil, pero no acepta silencio.",
          "Diga el plan con claridad y muéstrelo con acciones.",
          "El club debe respetar a la afición sin dejar que la rabia dirija la estrategia.",
          "Una declaración directa es mejor que esconderse en frases genéricas.",
        ],
      }).map(([intentId, responses]) => [intentId, { intentId, responses }]),
    ),
  },
};
