import { format } from "date-fns";
import { ptBR, enUS, es, type Locale } from "date-fns/locale";

const locales: { [key: string]: Locale } = {
  br: ptBR,
  en: enUS,
  es: es,
};

export const formatDynamicDate = (
  dateISO: string,
  currentLanguage: string = "br",
  variant: 1 | 2 | 3 = 1,
) => {
  if (!dateISO) return "--";

  const dateParts = dateISO.slice(0, 10).split("-");
  const date = new Date(
    Number(dateParts[0]),
    Number(dateParts[1]) - 1,
    Number(dateParts[2]),
  );

  const locale = locales[currentLanguage] || enUS;
  const isBR = currentLanguage === "br";
  const isES = currentLanguage === "es";

  let formatStr = "";

  if (isBR || isES) {
    if (variant === 1) {
      formatStr = "EEEE, d 'de' MMMM 'de' yyyy";
    } else if (variant === 2) {
      formatStr = "EEEE, d 'de' MMMM";
    } else {
      formatStr = "EEEE, d";
    }
  } else {
    if (variant === 1) {
      formatStr = "EEEE, MMMM d, yyyy";
    } else if (variant === 2) {
      formatStr = "EEEE, MMMM d";
    } else {
      formatStr = "EEEE, d";
    }
  }

  let formatted = format(date, formatStr, { locale });

  if (isBR || isES) {
    if (variant === 2 || variant === 3) {
      formatted = formatted.replace("-feira", "");
    }

    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    if (variant === 1 || variant === 2) {
      formatted = formatted.replace(
        / de ([a-z])/i,
        (_match, letter) => ` de ${letter.toUpperCase()}`,
      );
    }
  }

  return formatted;
};
