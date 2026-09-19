import {
  buildVillagePayload,
  clampParticipantCount,
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
} from "../form-logic";
import { API_BASE } from "../config";
import { initCommonPage } from "./common";
import "../styles/form.css";

const SPECIAL_VILLAGE_URL = `${API_BASE}/specialvillage`;

export function initFormPage(): void {
  initCommonPage();
  const element = document.querySelector<HTMLFormElement>("#village-form");
  if (!element || element.dataset.initialized) return;
  const form = element;
  form.dataset.initialized = "true";

  const fields = form.querySelector<HTMLFieldSetElement>(".builder-fields")!;
  const list = form.querySelector<HTMLDivElement>("#message-list")!;
  const decrease = form.querySelector<HTMLButtonElement>("#decrease")!;
  const increase = form.querySelector<HTMLButtonElement>("#increase")!;
  const submit = form.querySelector<HTMLButtonElement>("#create-village")!;
  const error = form.querySelector<HTMLDivElement>("#create-error")!;
  const result = document.querySelector<HTMLElement>("#village-result")!;
  const number = document.querySelector<HTMLElement>("#village-number")!;
  const copy = document.querySelector<HTMLButtonElement>("#copy-number")!;
  const copyStatus = document.querySelector<HTMLElement>("#copy-status")!;
  // Keep removed rows in memory so changing the count cannot discard a draft.
  const drafts = Array.from({ length: MAX_PARTICIPANTS }, () => "");
  let count = 5;
  let submitting = false;

  function updateSummary(): void {
    document.querySelector("#summary-count")!.textContent = String(count);
    document.querySelector("#total-count")!.textContent = String(count);
    document.querySelector("#filled-count")!.textContent = String(
      drafts.slice(0, count).filter((text) => text.trim()).length,
    );
    decrease.disabled = count === MIN_PARTICIPANTS;
    increase.disabled = count === MAX_PARTICIPANTS;
  }

  function renderMessages(): void {
    document.querySelector("#participant-count")!.innerHTML =
      `${count}<span>人</span>`;
    list.replaceChildren();
    for (let index = 0; index < count; index++) {
      const card = document.createElement("div");
      card.className = "message-card";
      const heading = document.createElement("div");
      heading.className = "message-label";
      const label = document.createElement("label");
      label.htmlFor = `message-${index + 1}`;
      const ordinal = document.createElement("span");
      ordinal.textContent = String(index + 1).padStart(2, "0");
      ordinal.setAttribute("aria-hidden", "true");
      label.append(ordinal, `${index + 1}人目へのメッセージ`);
      const counter = document.createElement("span");
      counter.className = "message-counter";
      counter.id = `count-${index + 1}`;
      counter.textContent = `${drafts[index].length} / 150`;
      const input = document.createElement("textarea");
      input.id = label.htmlFor;
      input.name = "message";
      input.maxLength = 150;
      input.value = drafts[index];
      input.placeholder =
        index === 0
          ? "例：あなたはインサイダーです。お題は「りんご」です。"
          : "この人にだけ届けたいメッセージ（任意）";
      input.setAttribute("aria-describedby", counter.id);
      input.addEventListener("input", () => {
        drafts[index] = input.value;
        counter.textContent = `${input.value.length} / 150`;
        updateSummary();
      });
      heading.append(label, counter);
      card.append(heading, input);
      list.append(card);
    }
    updateSummary();
  }

  for (const [button, delta] of [
    [decrease, -1],
    [increase, 1],
  ] as const) {
    button.addEventListener("click", () => {
      if (submitting) return;
      count = clampParticipantCount(count + delta);
      renderMessages();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    void createVillage();
  });

  async function createVillage(): Promise<void> {
    submitting = true;
    fields.disabled = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    submit.textContent = "村を作成しています…";
    error.hidden = true;
    try {
      const response = await fetch(SPECIAL_VILLAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildVillagePayload(drafts.slice(0, count))),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error("Request failed");
      const data: unknown = await response.json();
      if (
        typeof data !== "object" ||
        data === null ||
        !("data" in data) ||
        typeof data.data !== "string" ||
        !/^\d{5}$/.test(data.data)
      ) {
        throw new Error("Invalid village number");
      }
      number.textContent = data.data;
      copyStatus.textContent = "";
      copy.textContent = "村番号をコピー";
      form.hidden = true;
      result.hidden = false;
      result.focus();
    } catch {
      error.textContent =
        "作成結果を確認できませんでした。入力内容は残っています。通信環境を確認して、もう一度お試しください。";
      error.hidden = false;
    } finally {
      submitting = false;
      fields.disabled = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
      submit.innerHTML =
        '<span>この内容で村を作成</span><span aria-hidden="true">↗</span>';
    }
  }

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(number.textContent ?? "");
      copy.textContent = "コピーしました ✓";
      copyStatus.textContent = "参加者に村番号を送ってください。";
    } catch {
      copyStatus.textContent =
        "コピーできませんでした。上の村番号を長押し・選択してコピーしてください。";
    }
  });
  document.querySelector("#edit-village")!.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    (increase.disabled ? decrease : increase).focus();
  });
  renderMessages();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFormPage, { once: true });
  } else {
    initFormPage();
  }
}
