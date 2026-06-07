export const NEWS_DATABASE: Record<string, NewsTemplate> = {
  referee_assignment: {
    category: "match",
    date: "",
    title: [
      "CBF define arbitragem para o {isRival ? clássico : jogo} entre {teamA} x {teamB}",
      "Definido! CBF confirma o árbitro de {teamA} x {teamB}",
      "Apito definido: Saiba quem comanda {teamA} x {teamB} pelo campeonato",
    ],
    subtitle: [
      "Nome escolhido para apitar o confronto já está confirmado pela entidade.",
      "Entidade máxima do futebol brasileiro confirmou a escala oficial para o duelo.",
      "Escala oficial foi divulgada e promete mexer com a preparação das equipes.",
    ],
    description: [
      "A comissão de arbitragem da CBF confirmou a escala de arbitragem para o aguardado confronto entre {teamA} e {teamB}. O comandante do apito será {refereeName}, assistido por uma equipe que promete total rigor na aplicação das regras.\n\n{refereeName} é amplamente conhecido por seu estilo de jogo. Com uma rigidez de faltas avaliada em {refereeFoulStrictness}, a tendência é que o profissional {isHighFoulStrictness ? 'picote muito a partida e não tolere entradas duras' : 'deixe o jogo correr mais solto, priorizando a intensidade física'}.\n\nA escolha já começou a repercutir nas redes sociais de ambas as torcidas. Os atletas precisarão ficar atentos à disciplina, já que o histórico do árbitro indica um índice de {refereeCardStrictness} cartões, aplicando advertências de forma {isHighCardStrictness ? 'bastante precoce para controlar os ânimos' : 'mais contida, preferindo o diálogo verbal'}.",

      "O trio de arbitragem para o duelo de {competition} envolvendo {teamA} e {teamB} já está carimbado. A CBF escalou {refereeName} para liderar a partida. A decisão coloca em campo um dos árbitros mais comentados da temporada, cujos critérios costumam ditar a velocidade das transições.\n\nAnálises estatísticas apontam que as partidas geridas por {refereeName} têm dinâmicas específicas. Sua tolerância ao antijogo é medida pelo índice de {refereeStoppageGenerosity}, o que significa que o torcedor pode esperar {isHighStoppageGenerosity ? 'longos minutos de acréscimo em ambos os tempos para combater a cera' : 'uma postura mais tradicional na compensação do cronômetro'}.\n\nOs treinadores receberam os relatórios da arbitragem nesta manhã e devem adaptar os treinamentos de combate defensivo até o dia do confronto.",

      "Já sabemos quem dita as regras em campo no próximo final de semana. A CBF oficializou {refereeName} como o árbitro principal do confronto entre {teamA} e {teamB}. O profissional terá a dura missão de conduzir um embate que vale pontos cruciais na tabela.\n\nNos critérios de campo, o histórico do árbitro apresenta uma média de {refereeFoulStrictness} faltas por dividida, exigindo um cuidado extra dos defensores na hora dos desarmes táticos. Em relação à autoridade, seu nível de punição por cartões é de {refereeCardStrictness}, um fator que pode sobrecarregar atletas pendurados.\n\nA partida promete casa cheia e pressão máxima das arquibancadas, testando não apenas o físico dos jogadores, mas também o lado psicológico da equipe de arbitragem escalada.",
    ],
  },

  director_confirms_departure: {
    category: "transfers",
    date: "",
    title: [
      "Diretoria do {teamA} confirma oficialmente a saída do {position} {player}",
      "Fim da linha: Diretor do {teamA} quebra o silêncio e sela futuro de {player}",
      "Em entrevista, dirigente do {teamA} detalha os motivos da saída de {player}",
    ],
    subtitle: [
      "Pronunciamento oficial da cúpula do clube põe fim às especulações de bastidores.",
      "Jogador deixará o elenco nos próximos dias após acordo de rescisão ou transferência.",
      "Gestão do clube confirmou que o ciclo do atleta se encerrou de forma definitiva.",
    ],
    description: [
      "Em pronunciamento forte realizado nesta manhã, o diretor de futebol do {teamA}, {directorName}, confirmou que o {position} {player} não faz mais parte dos planos do clube para o restante da temporada. A decisão foi tomada em comum acordo após reuniões com o estafe do atleta.\n\nSegundo o dirigente, a saída faz parte de um processo necessário de reformulação financeira e tática do plantel. {player}, que acumulou momentos de altos e baixos na equipe, já foi liberado dos treinamentos diários para resolver os últimos detalhes burocráticos de seu próximo destino.\n\nA diretoria agradeceu publicamente os serviços prestados pelo jogador e afirmou que o mercado já está sendo monitorado para a contratação de uma peça de reposição que preencha a lacuna deixada na {position}.",

      "O diretor executivo do {teamA} veio a público para colocar um ponto final na novela envolvendo o futuro de {player}. Em entrevista coletiva exclusiva, {directorName} revelou que o atleta solicitou formalmente sua saída do clube para buscar novos ares no mercado.\n\n'Entendemos o lado do profissional e chegamos a um número que protege os interesses financeiros do {teamA}', destacou o diretor. {player} vinha perdendo espaço entre os titulares nas últimas semanas e sua manutenção no banco de reservas com um salário elevado estava gerando debates internos na comissão técnica.\n\nCom a saída selada, o departamento de análise de desempenho do clube corre contra o tempo para entregar opções viáveis ao treinador, que busca manter a competitividade do elenco na disputa da {competition}.",

      "A especulação que movimentava as redes sociais nos últimos dias se transformou em fato. {directorName}, homem forte do futebol do {teamA}, confirmou textualmente que as negociações para a saída do {position} {player} foram finalizadas com sucesso.\n\nO dirigente evitou dar detalhes minuciosos sobre os valores envolvidos na quebra do vínculo, mas garantiu que o desfecho foi extremamente saudável para o fluxo de caixa do {teamA}. O jogador encerra sua passagem pelo clube com {matchCount} partidas disputadas.\n\nA torcida agora aguarda os desdobramentos de mercado, já que a saída de uma liderança do vestiário exige uma resposta rápida da gestão para blindar o ambiente e focar nos objetivos técnicos da temporada.",
    ],
  },

  player_injury: {
    category: "team",
    date: "",
    title: [
      "Péssima notícia: {player} sofre {injuryName} e desfalca o {teamA}",
      "Departamento médico do {teamA} confirma lesão grave de {player}",
      "Desfalque de peso: {player} ficará fora dos gramados por {duration}",
    ],
    subtitle: [
      "O comandante do time terá problemas para reorganizar a {position} da equipe após o diagnóstico.",
      "O {position} se machucou durante as atividades e preocupa profundamente a comissão técnica.",
      "DM detalha situação clínica do {position}, que perderá partidas cruciais da temporada.",
    ],
    description: [
      "O departamento médico do {teamA} confirmou o que a comissão técnica mais temia. O {position} {player} sofreu uma {injuryName} durante o último treinamento tático e iniciará o processo de fisioterapia preventiva. A previsão inicial de afastamento é de {duration}.\n\nA ausência de {player} abre uma lacuna crítica no esquema tático do time. O atleta vinha sendo peça constante entre os titulares, acumulando {matchCount} partidas consecutivas e liderando os índices de consistência física do elenco.\n\nA partir de agora, o treinador terá que quebrar a cabeça para encontrar um substituto imediato dentro do plantel. As opções disponíveis no banco de reservas devem ser testadas ao longo da semana para tentar manter o padrão de jogo coletivo.",

      "O {teamA} emitiu uma nota oficial detalhando a situação clínica de {player}. Após deixar o gramado se queixando de fortes dores, o jogador passou por exames de imagem que constataram uma {injuryName}. O tempo estimado para a recuperação completa é de aproximadamente {duration}.\n\nEsta é uma baixa considerável para as pretensões do {teamA} na disputa da {competition}. {player} vinha se destacando pela liderança em campo, sendo o pilar de sustentação tática nos momentos de maior pressão do torneio.\n\nCom o desfalque confirmado, o clube avalia se precisará recorrer ao mercado de transferências de emergência ou se dará espaço para alguma promessa da categoria de base assumir a responsabilidade nas próximas rodadas.",

      "O DM do {teamA} terá trabalho dobrado nas próximas semanas. Foi diagnosticada uma {injuryName} no {position} {player}, lesão que o obrigará a passar por um período de tratamento intensivo estimado em {duration}, desfalcando a equipe por confrontos decisivos.\n\nO momento do incidente não poderia ser pior. O {teamA} entra em uma sequência frenética de jogos pela {competition} e dependia do vigor físico e do entrosamento de {player} para buscar os objetivos traçados pela diretoria.\n\nOs preparadores físicos adotarão cautela total no tratamento, evitando acelerar os prazos estipulados para não causar problemas crônicos ou lesões recidivas no atleta.",
    ],
  },

  transfer_available_players: {
    category: "rumors",
    date: "",
    title: [
      "Alvo fácil? {playerList} ainda não completaram 13 jogos e podem mudar de clube",
      "Janela interna: {playerList} surgem como opções viáveis de mercado no Brasil",
      "Brecha no regulamento coloca {playerList} no radar de transferências nacionais",
    ],
    subtitle: [
      "Atletas do {teamA} não atingiram o limite de partidas e estão liberados para defender outro clube na competição.",
      "Regra dos 13 jogos agita os bastidores e coloca destaques do {teamA} na mira de rivais.",
      "Com pouca minutagem, estes jogadores podem trocar de camisa ainda nesta temporada.",
    ],
    description: [
      "O regulamento do campeonato nacional pode provocar uma debandada inesperada no elenco do {teamA}. Nomes como {playerList} figuram na lista de atletas que disputaram menos de 13 jogos oficiais na atual edição da {competition}, o que permite que eles se transfiram para qualquer outro clube da mesma divisão.\n\nEssa condição coloca os atletas imediatamente no balcão de negócios, despertando o interesse de equipes que buscam reforços pontuais de emergência sem estourar os limites burocráticos da federação. A comissão técnica do {teamA} acompanha o assédio com preocupação.\n\nPara a diretoria, manter esses atletas sob contrato sem utilizá-los com frequência pode se tornar um problema financeiro, fazendo com que propostas de empréstimo ou compra definitiva sejam analisadas com muito carinho nas próximas horas.",

      "Os bastidores do mercado da bola esquentaram com o levantamento dos atletas que ainda estão elegíveis para transferências internas na temporada. No {teamA}, o foco se voltou para {playerList}, que por terem menos de 13 atuações na {competition}, estão livres para assinar com concorrentes diretos.\n\nA estratégia de preservação ou pouca utilização desses atletas por parte do treinador acabou criando uma vitrine perigosa. Clubes rivais mapearam a situação e planejam investidas agressivas para garantir o reforço de peças como {playerList}.\n\nFontes internas revelam que alguns desses jogadores andam insatisfeitos com a falta de oportunidades e enxergam uma mudança de ares como a oportunidade perfeita para retomar a carreira e somar minutos em campo.",

      "Atenção para a lista de oportunidades de mercado no futebol brasileiro. Com o fechamento da janela internacional se aproximando, a lista de atletas com menos de 13 jogos na {competition} virou o principal alvo de scouting. No {teamA}, o grupo composto por {playerList} se encaixa perfeitamente nesse perfil.\n\nEssa regra permite uma sobrevida para clubes que erraram no planejamento inicial e agora precisam de reforços cascudos e prontos para jogar. {playerList} possuem qualidades técnicas inegáveis e poderiam assumir papéis de protagonismo em outros elencos do país.\n\nA cúpula do {teamA} precisará agir rápido: ou dá minutos em campo para esses jogadores estourarem o teto regulamentar de partidas, ou aceita o fato de que propostas oficiais vão pintar na mesa do presidente a qualquer momento.",
    ],
  },

  match_highlights: {
    category: "match",
    date: "",
    title: [
      "Placar final: {teamA} {teamAScore} x {teamBScore} {teamB} — Veja os gols e melhores momentos",
      "Fim de jogo! {teamA} e {teamB} fecham duelo em {teamAScore} x {teamBScore} pela {competition}",
      "Goleada ou equilíbrio? Confira o resumo técnico de {teamA} {teamAScore} x {teamBScore} {teamB}",
    ],
    subtitle: [
      "Destaque absoluto para as atuações inspiradas de {playerA} e {playerB} no confronto de hoje.",
      "Partida movimentada mexeu com a tabela de classificação; assista aos lances marcantes.",
      "Com noite mágica de {playerA} e respostas de {playerB}, placar final agitou os torcedores.",
    ],
    description: [
      "O apito final sacramentou o resultado de {teamAScore} x {teamBScore} no eletrizante duelo entre {teamA} e {teamB} válido pela rodada da {competition}. O público presente no estádio assistiu a um confronto tático de altíssimo nível, repleto de chances claras e lances plásticos.\n\nO grande nome da partida foi o imparável {playerA}, que desequilibrou as ações ofensivas do {teamA} anotando gols cruciais e comandando o ritmo do meio de campo. Do outro lado, o {teamB} tentou responder na mesma moeda com a velocidade de {playerB}, que incomodou constantemente a linha de defesa adversária.\n\nOs analistas esportivos destacaram que o volume de jogo apresentado justifica plenamente a movimentação do placar. O vídeo completo com os gols, as defesas milagrosas e as polêmicas da arbitragem já está disponível nos canais oficiais de streaming para o torcedor rever cada detalhe.",

      "Que partida vivemos hoje! {teamA} e {teamB} mediram forças em um jogo que entregou tudo o que prometia, fechando o marcador em {teamAScore} x {teamBScore}. A intensidade física e a marcação alta ditaram o tom do primeiro ao último minuto do embate.\n\nPelo lado dos mandantes, {playerA} deu um show de liderança e técnica, organizando as jogadas e carimbando a trave em oportunidades claras. O contra-ataque visitante também funcionou muito bem sob a batuta de {playerB}, responsável direto pelas transições verticais mais perigosas da noite.\n\nCom este resultado, a briga pelas primeiras posições da {competition} ganha novos contornos emocionais. Acompanhe na nossa cobertura em vídeo os melhores momentos e as entrevistas exclusivas dos atletas na saída do gramado.",

      "O confronto entre {teamA} e {teamB} entrou para a lista dos melhores jogos do mês, terminando com o placar de {teamAScore} x {teamBScore}. Ambas as comissões técnicas apostaram em esquemas ousados, resultando em um espetáculo aberto e muito ofensivo para quem assistiu.\n\nOs holofotes da imprensa se dividiram entre o talento individual de {playerA}, pilar criativo do {teamA}, e a solidez tática demonstrada por {playerB}, que salvou sua equipe de um revés pior com desarmes cirúrgicos e ótimo posicionamento.\n\nSe você perdeu o confronto ao vivo, confira o compacto com todos os gols e lances capitais da partida que movimentou as estruturas e inflamou os debates esportivos em todos os programas esportivos nesta noite.",
    ],
  },

  match_injury_substitution: {
    category: "match",
    date: "",
    title: [
      "Preocupação no {teamA}: {playerA} deixa o jogo machucado contra o {teamB}",
      "Cena forte: {playerA} sente lesão muscular e é substituído no primeiro tempo",
      "Problemas para o técnico: {playerA} sai lesionado e força alteração no {teamA}",
    ],
    subtitle: [
      "O {position} sentiu dores agudas aos {minute} minutos e deu lugar para a entrada de {playerB}.",
      "Estrela do {teamA} abandona o gramado mancando; {playerB} assume a vaga na partida.",
      "Aos {minute} minutos de jogo, o {position} principal cai no gramado e aciona o banco de reservas.",
    ],
    description: [
      "Um momento de extrema tensão preocupou os torcedores do {teamA} durante a partida contra o {teamB}. Exatamente aos {minute} minutos da etapa inicial, o {position} {playerA} desabou no gramado segurando a coxa esquerda após tentar dar um pique curto no campo de ataque.\n\nA comissão médica entrou em campo imediatamente com a maca e sinalizou para o banco de reservas que as condições do atleta eram inviáveis para o retorno. O treinador foi obrigado a queimar uma substituição precoce, colocando o jovem {playerB} para assumir a bronca tática na {position}.\n\nO jogador lesionado iniciou o tratamento com gelo ainda no banco de reservas e passará por exames clínicos detalhados no hospital amanhã para avaliar a extensão do dano e estipular o tempo oficial de recuperação.",

      "A bruxa soltou no vestiário do {teamA}. No confronto decisivo válido pela {competition}, o pilar técnico da equipe, {playerA}, precisou ser substituído de forma precoce aos {minute} minutos do cronômetro após sofrer uma forte pancada na região do tornozelo.\n\nO choro do atleta no banco de reservas reflete a gravidade do momento. Para o seu lugar, a comissão técnica apostou na entrada de {playerB}, que entrou com a missão de manter a pegada física e preencher os espaços deixados pelo titular absoluto na {position}.\n\nA ausência de {playerA} nas próximas rodadas pode comprometer drasticamente o rendimento coletivo da equipe, que já sofre com um elenco curto e com o calendário apertado da temporada.",

      "O roteiro do jogo entre {teamA} e {teamB} mudou completamente aos {minute} minutos do primeiro tempo. O experiente {playerA} sentiu uma contratura muscular visível e pediu substituição imediata, gerando apreensão em toda a comissão técnica do {teamA}.\n\nSem ritmo de jogo ideal, {playerB} teve que tirar o agasalho às pressas e assumir as funções táticas da {position}. A mudança forçada quebrou a estratégia inicial montada para o confronto e obrigou o time a se retrair nos minutos subsequentes.\n\nO departamento médico informou que emitirá um boletim completo nas próximas 24 horas, mas nos bastidores a presença de {playerA} no próximo final de semana já é tratada como praticamente impossível.",
    ],
  },

  player_sale: {
    category: "transfers",
    date: "",
    title: [
      "Veja quanto o {teamA} vai receber pela venda milionária de {player}",
      "Negócio fechado: {teamA} finaliza a transferência de {player} para o {teamB}",
      "Valores revelados: Saiba os detalhes da venda do {position} {player}",
    ],
    subtitle: [
      "O {teamB} fechou a contratação do {position} que foi {isHomegrown ? 'revelado com orgulho na base do clube' : 'contratado após acumular {matchCount} jogos pelo time'}.",
      "Diretoria aceita proposta robusta e negocia os direitos econômicos do atleta de {age} anos.",
      "Atleta se despede dos companheiros e carimba passaporte após transação de {marketValue}.",
    ],
    description: [
      "A diretoria do {teamA} bateu o martelo e finalizou a venda dos direitos econômicos do {position} {player} para o {teamB}. O montante total da transferência atingiu a expressiva marca de {marketValue}, valores que dão um respiro gigante para o fluxo de caixa do clube.\n\n{player}, que tem {age} anos, construiu uma trajetória marcante no clube. É importante lembrar que o atleta foi {isHomegrown ? 'lapidado integralmente nas categorias de base, gerando lucro puro para o clube' : 'adquirido no passado e cumpriu um ciclo importante com {matchCount} exibições oficiais'}.\n\nO dinheiro recebido na transação será carimbado e reinvestido de forma imediata na modernização das estruturas internas e na busca de novas peças de reposição para o plantel continuar brigando por títulos na {competition}.",

      "Está confirmado nos portais de transferência: {player} é o novo reforço do {teamB}. O acordo foi selado após semanas de rodadas de negociação intensa envolvendo os presidentes de ambos os clubes. A operação financeira foi fechada em {marketValue}.\n\nO {position} de {age} anos era monitorado por scouts internacionais há meses devido à sua consistência tática. A sua história no {teamA} se encerra de maneira positiva, consolidando-se como uma peça que foi {isHomegrown ? 'uma das maiores joias da base recente da instituição' : 'um operário tático exemplar ao longo de suas {matchCount} partidas vestindo a camisa principal'}.\n\nO jogador viaja amanhã para a realização dos exames médicos de rotina e assinatura do contrato definitivo, deixando uma mensagem de agradecimento à torcida nas redes sociais.",

      "O {teamA} concluiu os trâmites burocráticos para a saída de {player}. O destino do atleta será o {teamB}, que concordou em desembolsar a quantia de {marketValue} à vista para contar com o futebol do talentoso {position} para a sequência do calendário internacional.\n\nAos {age} anos, o jogador vive o auge de sua valorização de mercado. Sua formação diz muito sobre a filosofia da diretoria, visto que o profissional acabou sendo {isHomegrown ? 'formado no próprio clube, mantendo a tradição de revelar grandes craques' : 'uma aposta certeira de mercado que rendeu frutos após {matchCount} exibições oficiais de gala'}.\n\nA comissão técnica já se reuniu com o departamento de análise para definir quem assumirá o posto de titular absoluto a partir do próximo compromisso oficial do time.",
    ],
  },

  squad_announcement: {
    category: "team",
    date: "",
    title: [
      "{teamA} divulga a lista de relacionados para enfrentar o {teamB}",
      "Convocados! Confira quem viaja pelo {teamA} para o duelo da rodada",
      "Lista oficial: Técnico do {teamA} define os atletas relacionados para o jogo",
    ],
    subtitle: [
      "Relação oficial conta com os retornos importantes de nomes como {playerList}.",
      "Comissão técnica faz mistério mas confirma os relacionados para o embate na {competition}.",
      "Veja quais jogadores estão concentrados para defender as cores do {teamA} no final de semana.",
    ],
    description: [
      "A assessoria de imprensa do {teamA} publicou a lista oficial com os jogadores relacionados para o decisivo confronto contra o {teamB}. A delegação finaliza a preparação física hoje e inicia o regime de concentração total para o duelo válido pela {competition}.\n\nA principal novidade que chamou a atenção dos jornalistas foi a inclusão de {playerList} no grupo que vai para o jogo. Os atletas vinham cumprindo cronogramas específicos de transição e recondicionamento, e agora reaparecem como opções fundamentais tanto para iniciar o jogo quanto para mudar a dinâmica no banco de reservas.\n\nO treinador optou por levar força máxima disponível, deixando claro para os atletas que a partida é tratada como uma verdadeira final de campeonato para as pretensões institucionais da temporada.",

      "O mistério acabou nos bastidores do {teamA}. A comissão técnica soltou o documento oficial contendo os atletas selecionados para a viagem focada no duelo contra o {teamB}. O clima no CT é de foco absoluto e cobrança por um rendimento tático perfeito.\n\nDentro do grupo de atletas escolhidos, o destaque fica por conta de {playerList}, que ganham uma nova oportunidade de mostrar serviço e consolidar espaço no time principal. A comissão técnica preferiu não antecipar o esquema tático inicial, usando a lista recheada para confundir os analistas do adversário.\n\nOs atletas relacionados jantam juntos no hotel da concentração nesta noite e passarão por uma última sessão de vídeos informativos antes de entrarem no ônibus rumo ao estádio.",

      "O torcedor do {teamA} já pode conferir quem está à disposição para o grande embate contra o {teamB}. A lista de relacionados foi liberada logo após o encerramento das atividades de bola parada realizadas com os portões fechados no centro de treinamento.\n\nCom a presença confirmada de {playerList}, o elenco ganha um reforço técnico e anímico muito grande para suportar a pressão do adversário. Alguns garotos das categorias de base também foram relacionados para ganhar experiência internacional e compor o banco.\n\nA bola rola em poucas horas e a expectativa é que a escalação oficial seja entregue aos delegados da federação cerca de sessenta minutos antes do início previsto para o espetáculo.",
    ],
  },

  player_purchase: {
    category: "transfers",
    date: "",
    title: [
      "{teamA} acerta a compra de {player}, do {teamB}",
      "Reforço fechado: {teamA} finaliza contratação do {position} {player}",
      "Novo contratado: {player} deixa o {teamB} e assina com o {teamA}",
    ],
    subtitle: [
      "Confira os valores e os bastidores do investimento feito pelo {position} de {age} anos.",
      "Diretoria se antecipa no mercado e fecha transação de {marketValue} pelo novo reforço.",
      "Atleta de {age} anos assina contrato de longa duração após aprovação nos exames médicos.",
    ],
    description: [
      "O {teamA} movimentou o mercado de transferências nacional ao acertar a compra em definitivo do {position} {player}, que pertencia ao {teamB}. O negócio foi fechado por cifras que giram em torno de {marketValue}, mostrando a agressividade da diretoria na busca por reforços.\n\nAos {age} anos, o jogador é visto como um investimento de retorno técnico imediato para a disputa da {competition}. Sua capacidade de quebrar linhas e sua consistência física foram os principais fatores que convenceram a comissão técnica a dar o aval para a compra.\n\nO novo contrato terá validade por longas temporadas e o atleta deve se apresentar ao centro de treinamentos já na próxima segunda-feira para iniciar os testes físicos e a integração com o restante dos companheiros de equipe.",

      "Reforço de peso para a torcida comemorar. O {position} {player} é oficialmente jogador do {teamA}. A transação com o {teamB} foi finalizada após uma longa rodada de negociações burocráticas, sacramentada pelo valor final de {marketValue}.\n\n{player} vinha sendo um dos destaques de sua antiga equipe e chega com o status de titular em potencial para resolver os problemas crônicos que o técnico enfrentava na {position}. O atleta se destacou nas estatísticas de desarmes e assistências no último semestre.\n\nA apresentação oficial com a camisa do clube será realizada na sala de imprensa com a presença de sócios-torcedores. O jogador usará um número clássico e prometeu entrega máxima para conquistar o carinho das arquibancadas.",

      "Fumaça branca nos bastidores do futebol. O {teamA} fechou a contratação do talentoso {player}, de {age} anos, adquirindo seus direitos federativos junto ao {teamB}. A operação custou cerca de {marketValue} aos cofres da agremiação mandante.\n\nA contratação preenche um dos requisitos mais cobrados pela torcida e pela imprensa esportiva nas últimas semanas. O {position} possui características modernas de intensidade e polivalência tática, encaixando-se perfeitamente no modelo de jogo implementado pelo treinador.\n\nOs documentos já foram enviados para o sistema de registros da federação e a expectativa é que o nome do novo reforço apareça no boletim diário a tempo de permitir sua estreia já na próxima rodada do campeonato.",
    ],
  },

  team_of_the_week: {
    category: "team_of_the_month",
    date: "",
    title: [
      "{playerList} entra para o Time da Semana da {competition}!",
      "Destaque internacional: {playerList} figura na seleção da rodada",
      "Os melhores da rodada: {playerList} representa o {teamA} no Time da Semana",
    ],
    subtitle: [
      "A grande atuação rendeu elogios da crítica especializada e vaga cativa no time ideal.",
      "Atletas do {teamA} foram coroados após exibições de gala nos gramados neste final de semana.",
      "Desempenho individual brilhante garantiu a nomeação oficial dos craques na seleção da rodada.",
    ],
    description: [
      "A organização oficial da {competition} divulgou a constelação de atletas que formam o Time da Semana da última rodada. O grande destaque e motivo de orgulho para os torcedores foi a merecida inclusão de {playerList} na escalação dos melhores.\n\nOs atletas foram os grandes motores de suas equipes em campo, apresentando notas estatísticas impressionantes e dominando os duelos individuais em suas respectivas posições. A escolha coroa um período de treinos intensos e regularidade tática sob o comando do treinador.\n\nA premiação individual serve como uma injeção de moral coletiva para o restante do elenco, que se prepara para enfrentar desafios ainda mais complexos na sequência do calendário competitivo da temporada.",

      "Desempenho de gala merece reconhecimento. A comissão de jornalistas e analistas de desempenho do campeonato elegeu o Time da Semana e cravou o nome de {playerList} entre os 11 titulares da seleção oficial da rodada da {competition}.\n\nA nomeação não surpreendeu ninguém que assistiu ao último jogo. {playerList} carregou o piano tático, demonstrando um refino técnico apurado e participando diretamente das jogadas de gol que garantiram os pontos na tabela para o seu clube.\n\nCom os holofotes virados para si, o jogador assume uma responsabilidade ainda maior, transformando-se no atleta a ser batido e rigidamente marcado pelos técnicos adversários nos próximos compromissos.",

      "A seleção dos melhores da rodada da {competition} foi publicada nesta tarde e movimentou as discussões esportivas. O {teamA} marcou presença na lista ideal através do talento inegável de {playerList}, escolhido por unanimidade pelos especialistas de futebol.\n\nSua exibição na rodada foi avaliada como impecável, unindo inteligência tática na ocupação de espaços e liderança técnica nos momentos de maior pressão coletiva em campo.\n\nO troféu simbólico de pertencer ao Time da Semana entra para o currículo do atleta na temporada, validando o trabalho desenvolvido pelos preparadores e pela comissão técnica no dia a dia do centro de treinamentos.",
    ],
  },

  match_preview: {
    category: "match",
    date: "",
    title: [
      "{teamA} x {teamB}: onde assistir ao vivo, horário e prováveis escalações",
      "Guia do jogo: Tudo o que você precisa saber sobre {teamA} x {teamB}",
      "Esquenta {teamA} x {teamB}: Detalhes da transmissão, desfalques e arbitragem",
    ],
    subtitle: [
      "Confira os desfalques, a arbitragem e mais informações sobre o jogo decisivo da {competition}.",
      "As equipes entram em campo de olho na liderança; saiba onde acompanhar cada lance ao vivo.",
      "Tudo pronto para o confronto que promete parar o país; veja os times que vão a campo.",
    ],
    description: [
      "O clima de ansiedade toma conta do país para o confronto estratégico entre {teamA} e {teamB}, válido por mais uma rodada eletrizante da {competition}. A partida está agendada para este final de semana e coloca frente a frente duas propostas táticas completamente opostas.\n\nPara quem não quer perder nenhum detalhe, a transmissão ao vivo na televisão e no streaming ficará por conta dos canais {tvChannels}. As equipes de reportagem entram em campo direto do estádio horas antes do apito inicial para trazer os bastidores de ambas as delegações.\n\nNos gramados, as prováveis escalações indicam equipes ofensivas. A arbitragem confirmada para o duelo será liderada por {refereeName}, profissional experiente que terá o desafio de controlar os ânimos de um jogo que promete ser jogado na casca da ferida do início ao fim.",

      "Dia de jogão! {teamA} e {teamB} se enfrentam em um duelo que vale muito mais do que simples três pontos na tabela de classificação. O histórico recente do confronto aponta muito equilíbrio e uma rivalidade acirrada que inflama as redes sociais de ambas as torcidas.\n\nO torcedor poderá acompanhar o espetáculo em tempo real através dos canais oficiais do {tvChannels}, com cobertura completa de pré-jogo e análise tática nos intervalos. Os técnicos fizeram mistério nos últimos treinos táticos e esconderam as escalações definitivas até o limite regulamentar.\n\nO departamento médico de ambos os lados correu para recuperar atletas lesionados, mas desfalques de última hora foram confirmados, o que deve forçar alterações táticas de emergência nos setores de criação e defesa das equipes.",

      "A bola vai rolar pela {competition} e o foco do final de semana esportivo está totalmente concentrado no embate envolvendo {teamA} e {teamB}. Ambas as agremiações chegam embaladas por resultados positivos e prometem um espetáculo de alta intensidade tática.\n\nA partida terá cobertura completa e transmissão exclusiva conduzida pela equipe dos canais {tvChannels}. Além do show de imagens, os assinantes terão acesso a câmeras exclusivas focadas nos bancos de reservas e nos treinadores.\n\nAs prováveis escalações já geram debates entre os comentaristas, que tentam adivinhar se as equipes adotarão posturas de marcação alta ou se apostarão nos contra-ataques velozes para furar os bloqueios defensivos montados.",
    ],
  },

  tickets_sold_out: {
    category: "match",
    date: "",
    title: [
      "Torcida do {teamA} esgota ingressos para a {stage} da {competition} contra o {teamB}",
      "Caldeirão lotado! Ingressos esgotados para o duelo entre {teamA} x {teamB}",
      "Casa cheia: Torcedores do {teamA} esgotam cargas de bilhetes para enfrentar o {teamB}",
    ],
    subtitle: [
      "Expectativa de festa monumental e pressão máxima das arquibancadas para o confronto decisivo.",
      "Carga total de bilhetes foi comercializada em tempo recorde pelos sócios-torcedores do clube.",
      "Promessa de mosaico e apoio incondicional na partida que vale vaga histórica na temporada.",
    ],
    description: [
      "O apoio das arquibancadas está totalmente garantido para o próximo compromisso do {teamA}. A diretoria do clube confirmou oficialmente que todos os ingressos colocados à disposição para a {stage} da {competition} contra o {teamB} foram completamente esgotados em poucas horas de venda pública.\n\nA corrida dos torcedores virtuais derrubou o sistema de bilheteria online nas primeiras horas da madrugada, refletindo a importância do jogo para a comunidade. Os setores de arquibancada e cadeiras estarão completamente tomados por um mar de camisas do clube.\n\nA comissão técnica celebrou o feito e destacou em entrevista que a energia vinda do torcedor será o décimo segundo jogador em campo, empurrando a equipe para superar os bloqueios táticos do {teamB} e buscar a vitória desde o primeiro minuto de jogo.",

      "Não resta mais nenhum bilhete nas bilheterias físicas ou virtuais. A torcida do {teamA} deu uma demonstração massiva de paixão e esgotou toda a carga de entradas para o aguardado confronto frente ao {teamB}. O jogo, tratado como a grande decisão da {stage}, promete registrar o maior público do ano.\n\nOrganizadas do clube já preparam uma festa monumental com direito a mosaico 3D, bandeirões e fumaça colorida na entrada dos atletas no gramado verde. O esquema de segurança no entorno do estádio será reforçado pela polícia militar para garantir a tranquilidade das famílias.\n\nOs jogadores do {teamA} manifestaram gratidão pelo apoio nas redes sociais e prometeram deixar até a última gota de suor no campo para honrar o investimento e a dedicação demonstrados pela torcida apaixonada.",

      "O caldeirão vai ferver! A diretoria de comunicação do {teamA} emitiu um comunicado celebrando a marca de ingressos esgotados para o embate contra o {teamB}, válido pela {stage} da {competition}. A bilheteria registrou filas virtuais históricas de sócios-torcedores adimplentes.\n\nA mobilização da torcida reflete o bom momento vivido pelo elenco e a relevância do torneio no calendário anual. Especialistas em economia esportiva apontam que a arrecadação com a bilheteria quebrará os recordes históricos do clube, gerando uma receita líquida crucial.\n\nCom a atmosfera de festa montada fora das quatro linhas, resta agora aos comandados do treinador transformarem o apoio das arquibancadas em gols e solidez defensiva para carimbar o resultado positivo dentro de campo.",
    ],
  },

  daily_training_report: {
    category: "team",
    date: "",
    title: [
      "{teamA} ajusta detalhes no CT antes da sequência da temporada",
      "Treino do {teamA} tem foco em organização e intensidade",
      "Comissão técnica do {teamA} trabalha movimentações para o próximo desafio",
    ],
    subtitle: [
      "Atividade do dia teve atenção especial para {player} e para o setor de {position}.",
      "Elenco passou por trabalhos táticos e físicos pensando na evolução coletiva.",
      "Preparação segue com ajustes pontuais enquanto o calendário ganha ritmo.",
    ],
    description: [
      "O {teamA} realizou mais uma sessão de trabalho no centro de treinamento, com foco em compactação, saída de bola e tomada de decisão no último terço. A comissão técnica vem usando esses dias para observar alternativas e dar mais repertório ao elenco.\n\nEntre os nomes acompanhados de perto está {player}, que atua como {position} e tem recebido orientações específicas para melhorar sua participação nas fases ofensiva e defensiva.\n\nMesmo sem grandes anúncios oficiais, o ambiente interno é de preparação constante. A ideia é chegar ao próximo compromisso contra o {teamB} com uma equipe mais ajustada, menos previsível e pronta para responder a diferentes cenários de jogo.",
      "A rotina do {teamA} segue movimentada. O treino desta manhã misturou exercícios de posse, transição defensiva e finalizações curtas, buscando aproximar os setores e reduzir espaços entre as linhas.\n\n{player} foi um dos atletas observados durante a atividade, principalmente pela importância da {position} no equilíbrio coletivo da equipe. A comissão técnica entende que pequenos ajustes individuais podem mudar bastante o comportamento do time em campo.\n\nNos bastidores, a preparação para encarar o {teamB} já começou. O clube trata o período sem bola rolando como uma oportunidade para corrigir erros e fortalecer mecanismos antes da próxima rodada da {competition}.",
      "O dia no CT do {teamA} foi dedicado a detalhes. A comissão técnica separou parte do treino para bolas paradas, pressão pós-perda e circulação rápida pelos lados do campo.\n\nA presença de {player} chamou atenção nos trabalhos de movimentação, já que o jogador vem sendo preparado para assumir responsabilidades maiores na {position}. O objetivo é criar mais opções reais para o treinador durante a sequência da temporada.\n\nA avaliação interna é que o elenco ainda tem margem para crescer. Até o duelo com o {teamB}, a tendência é que a comissão continue alternando cargas físicas e atividades táticas para manter o grupo competitivo.",
    ],
  },

  player_focus: {
    category: "team",
    date: "",
    title: [
      "{player} ganha atenção especial nos bastidores do {teamA}",
      "Olho nele: {player} pode ser peça importante para o {teamA}",
      "{teamA} acompanha evolução de {player} durante a semana",
    ],
    subtitle: [
      "Jogador de {age} anos é visto como alternativa relevante para a {position}.",
      "Comissão técnica monitora forma física, confiança e encaixe tático do atleta.",
      "Desempenho nos treinos pode pesar nas escolhas para os próximos jogos.",
    ],
    description: [
      "{player} vive uma semana importante dentro do {teamA}. Aos {age} anos, o atleta vem sendo observado de perto pela comissão técnica, que analisa sua resposta física e sua adaptação às ideias de jogo.\n\nA disputa por espaço na {position} segue aberta, e cada treino tem peso na formação do grupo que será usado durante a sequência da {competition}. Nos corredores do clube, a percepção é que o jogador pode ganhar minutos se mantiver regularidade.\n\nA preparação para enfrentar o {teamB} ainda reserva decisões importantes, mas {player} aparece entre os nomes que podem mudar a dinâmica da equipe caso receba oportunidade.",
      "O departamento de análise do {teamA} separou recortes recentes de {player} para entender melhor como o jogador pode ser usado nas próximas partidas. A ideia é identificar situações em que sua característica na {position} pode ajudar a equipe.\n\nCom {age} anos, o atleta ainda tem margem de evolução e vem tentando transformar os treinos em argumento para convencer a comissão técnica. A concorrência interna é forte, mas o momento é tratado como uma janela real de afirmação.\n\nO próximo jogo contra o {teamB} pode não definir tudo, mas já influencia o planejamento da comissão para as rodadas seguintes.",
      "Entre os assuntos internos do {teamA}, o nome de {player} voltou a circular com força. O jogador tem participado de trabalhos específicos e tenta mostrar que pode entregar mais consistência na {position}.\n\nA comissão técnica avalia fatores como intensidade, leitura de jogo e tomada de decisão antes de definir a relação para os próximos compromissos. Aos {age} anos, {player} sabe que a sequência de treinos pode pesar bastante.\n\nA expectativa é que a disputa por espaço continue saudável, criando opções para o treinador antes do encontro com o {teamB} pela {competition}.",
    ],
  },
};
