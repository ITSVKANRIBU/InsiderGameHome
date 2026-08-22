export const FIRST_MESSAGE =
  "こんにちは！ 参加したい村の番号を入力してください。";
export const CHAT_ERROR_MESSAGE =
  "通信に失敗しました。時間をおいて再度お試しください。";

type ChatMessage = {
  type?: unknown;
  text?: unknown;
  template?: {
    text?: unknown;
    thumbnailImageUrl?: unknown;
  };
};

function firstMessage(data: unknown): ChatMessage | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const message = data[0];
  if (typeof message !== "object" || message === null) {
    return null;
  }

  return message as ChatMessage;
}

export function zeroPadding(num: number, len: number): string {
  return String(num).padStart(len, "0");
}

export function createUserId(
  timestamp = Date.now(),
  random = Math.random(),
): string {
  return `${timestamp}${random.toString(36).slice(2)}`;
}

export function getText(data: unknown): string {
  const message = firstMessage(data);

  if (message?.type === "text" && typeof message.text === "string") {
    return message.text;
  }

  if (
    message?.type === "template" &&
    typeof message.template?.text === "string"
  ) {
    return message.template.text;
  }

  return CHAT_ERROR_MESSAGE;
}

export function getImg(data: unknown): string | null {
  const message = firstMessage(data);

  if (
    message?.type === "template" &&
    typeof message.template?.thumbnailImageUrl === "string"
  ) {
    return message.template.thumbnailImageUrl;
  }

  return null;
}
