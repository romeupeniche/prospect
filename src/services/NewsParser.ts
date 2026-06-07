export class NewsParser {
  private static formatPlayerList(players: string[] | undefined): string {
    if (!players || players.length === 0) return "";
    if (players.length === 1) return players[0];
    if (players.length === 2) return `${players[0]} e ${players[1]}`;

    return `${players.slice(0, -1).join(", ")} e ${players[players.length - 1]}`;
  }

  public static compile(templateText: string, ctx: NewsContext): string {
    let output = templateText;

    if (ctx.playerList && ctx.playerList.length > 0) {
      const formattedList = this.formatPlayerList(ctx.playerList);
      output = output.replace(/\{playerList\}/g, formattedList);
    }

    const simpleVarRegex = /\{(\w+)\}/g;
    output = output.replace(simpleVarRegex, (match, key) => {
      const value = ctx[key as keyof NewsContext];
      return value !== undefined ? String(value) : match;
    });

    const conditionalRegex = /\{(\w+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g;
    output = output.replace(
      conditionalRegex,
      (_match, key, trueText, falseText) => {
        const conditionValue = !!ctx[key as keyof NewsContext];
        return conditionValue ? trueText.trim() : falseText.trim();
      },
    );

    return output;
  }
}
