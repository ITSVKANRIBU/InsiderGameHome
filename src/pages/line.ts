import { callApi } from "../chat/api";
import {
  createUserId,
  FIRST_MESSAGE,
  getImg,
  getText,
  zeroPadding,
} from "../chat/logic";

const COOKIE_NAME = "userId";
const COOKIE_EXPIRY_DAYS = 365;

let userId = "";

function getCookie(name: string): string | undefined {
  const cookie = document.cookie.split("; ").find((entry) => {
    const separator = entry.indexOf("=");
    return separator !== -1 && decodeURIComponent(entry.slice(0, separator)) === name;
  });

  if (!cookie) {
    return undefined;
  }

  const separator = cookie.indexOf("=");
  return decodeURIComponent(cookie.slice(separator + 1));
}

function setCookie(name: string, value: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
}

function getMessageContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".messages-content");
}

function updateScrollbar(): void {
  const viewport = document.querySelector<HTMLElement>(".messages");
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight;
  }
}

function setDate(message: HTMLElement): void {
  const date = new Date();
  const timestamp = `${zeroPadding(date.getHours(), 2)}:${zeroPadding(
    date.getMinutes(),
    2,
  )}`;
  const timestampElement = document.createElement("div");
  timestampElement.className = "timestamp";
  timestampElement.textContent = timestamp;
  message.append(timestampElement);
}

function createAvatar(): HTMLElement {
  const avatar = document.createElement("figure");
  avatar.className = "avatar";
  const image = document.createElement("img");
  image.src = "/contents/img/icon.png";
  image.alt = "インサイダーゲームツール";
  avatar.append(image);
  return avatar;
}

function appendMessage(
  messageText: string,
  className: "message new" | "message message-personal new",
): HTMLElement | null {
  const container = getMessageContainer();
  if (!container) {
    return null;
  }

  const message = document.createElement("div");
  message.className = className;
  if (className === "message new") {
    message.append(createAvatar());
  }
  message.append(document.createTextNode(messageText));
  container.append(message);
  setDate(message);
  return message;
}

function putMessage(messageText: string): void {
  document.querySelectorAll(".message.loading").forEach((element) => {
    element.remove();
  });
  appendMessage(messageText, "message new");
  updateScrollbar();
}

function getSafeImageUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function putImg(imgUrl: string): void {
  const safeUrl = getSafeImageUrl(imgUrl);
  if (!safeUrl) {
    return;
  }

  const image = new Image();
  image.onload = () => {
    const container = getMessageContainer();
    if (!container) {
      return;
    }

    const message = document.createElement("div");
    message.className = "message new";
    message.append(createAvatar());
    const imageElement = document.createElement("img");
    imageElement.className = "thumbnailI";
    imageElement.src = safeUrl;
    imageElement.alt = "役職画像";
    message.append(imageElement);
    container.append(message);
    setDate(message);
    updateScrollbar();
  };
  image.src = safeUrl;
}

async function insertMessage(): Promise<void> {
  const input = document.querySelector<HTMLTextAreaElement>(".message-input");
  if (!input) {
    return;
  }

  const message = input.value.trim();
  if (message === "") {
    return;
  }

  appendMessage(message, "message message-personal new");
  input.value = "";
  updateScrollbar();

  const data = await callApi(userId, message);
  putMessage(getText(data));
  const imageUrl = getImg(data);
  if (imageUrl) {
    putImg(imageUrl);
  }
}

function setUserId(): void {
  userId = getCookie(COOKIE_NAME) ?? "";
  if (!userId) {
    userId = createUserId();
    setCookie(COOKIE_NAME, userId);
  }
}

function initChat(): void {
  setUserId();
  window.setTimeout(() => putMessage(FIRST_MESSAGE), 100);

  const submit = document.querySelector<HTMLButtonElement>(".message-submit");
  submit?.addEventListener("click", () => {
    void insertMessage();
  });

  document
    .querySelector<HTMLTextAreaElement>(".message-input")
    ?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void insertMessage();
      }
    });
}

if (typeof window !== "undefined") {
  window.addEventListener("load", initChat, { once: true });
}
