import { callApi } from "../chat/api";
import {
  createUserId,
  FIRST_MESSAGE,
  getImg,
  getText,
  zeroPadding,
} from "../chat/logic";

type JQueryLike = {
  (selector: string): any;
  trim(value: unknown): string;
};

type CookieApi = {
  get(key: string): string | undefined;
  set(key: string, value: string, options: { expires: number }): void;
};

const jquery = (window as unknown as { jQuery: JQueryLike }).jQuery;
const cookies = (window as unknown as { Cookies: CookieApi }).Cookies;
const messages = jquery(".messages-content");
let userId = "";

function updateScrollbar(): void {
  messages
    .mCustomScrollbar("update")
    .mCustomScrollbar("scrollTo", "bottom", {
      scrollInertia: 10,
      timeout: 0,
    });
}

function setDate(): void {
  const date = new Date();
  const timestamp =
    `${zeroPadding(date.getHours(), 2)}:${zeroPadding(date.getMinutes(), 2)}`;
  jquery(
    `<div class="timestamp">${timestamp}</div>`,
  ).appendTo(jquery(".message:last"));
}

function setUserId(): void {
  userId = cookies.get("userId") ?? "";
  if (!userId) {
    userId = createUserId();
    cookies.set("userId", userId, { expires: 365 });
  }
}

function putMessage(message: string): void {
  jquery(".message.loading").remove();

  jquery(
    '<div class="message new"><figure class="avatar"><img src="./contents/img/icon.png" /></figure>' +
      message +
      "</div>",
  )
    .appendTo(jquery(".mCSB_container"))
    .addClass("new");
  setDate();
  updateScrollbar();
}

function putImg(imgUrl: string): void {
  const image = new Image();
  image.src = imgUrl;
  image.onload = () => {
    const imageDom = `<img src="${imgUrl}" class="thumbnailI" alt="役職画像" />`;
    jquery(
      '<div class="message new"><figure class="avatar"><img src="./contents/img/icon.png" /></figure>' +
        imageDom +
        "</div>",
    )
      .appendTo(jquery(".mCSB_container"))
      .addClass("new");
    setDate();
    updateScrollbar();
  };
}

async function insertMessage(): Promise<void> {
  const input = jquery(".message-input");
  const message = input.val();
  if (jquery.trim(message) === "") {
    return;
  }

  jquery('<div class="message message-personal">' + message + "</div>")
    .appendTo(jquery(".mCSB_container"))
    .addClass("new");
  setDate();
  input.val(null);
  updateScrollbar();

  const data = await callApi(userId, message);
  putMessage(getText(data));
  const imageUrl = getImg(data);
  if (imageUrl) {
    putImg(imageUrl);
  }
}

function initChat(): void {
  setUserId();
  messages.mCustomScrollbar();
  window.setTimeout(() => putMessage(FIRST_MESSAGE), 100);

  jquery(".message-submit").on("click", () => {
    void insertMessage();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void insertMessage();
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("load", initChat, { once: true });
}
