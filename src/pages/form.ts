import {
  buildVillagePayload,
  clampParticipantCount,
  participantLabel,
} from "../form-logic";
import { API_BASE } from "../config";
import { initCommonPage } from "./common";

const SPECIAL_VILLAGE_URL = `${API_BASE}/specialvillage`;

function setAlertVisibility(element: HTMLElement | null, visible: boolean): void {
  if (element) {
    element.style.display = visible ? "" : "none";
  }
}

function changeParticipantCount(button: HTMLInputElement): void {
  const targetSelector = button.dataset.target;
  const delta = Number(button.dataset.cal);
  const target = targetSelector
    ? document.querySelector<HTMLInputElement>(targetSelector)
    : null;

  if (!target || !Number.isFinite(delta)) {
    return;
  }

  const current = Number(target.value);
  const next = clampParticipantCount(current + delta);
  target.value = String(next);

  if (next === current) {
    return;
  }

  const group = document.querySelector<HTMLElement>(".group");
  if (!group) {
    return;
  }

  const users = [...group.querySelectorAll<HTMLElement>(".userdiv")];
  if (delta > 0) {
    const template = users[0];
    if (!template) {
      return;
    }

    const clone = template.cloneNode(true) as HTMLElement;
    const label = clone.querySelector("label");
    if (label) {
      label.textContent = participantLabel(next);
    }
    group.append(clone);
    return;
  }

  users[next]?.remove();
}

export async function submitVillage(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>(".button");
  if (!button) {
    return;
  }

  const successAlert = document.querySelector<HTMLElement>(".success-alert");
  const dangerAlert = document.querySelector<HTMLElement>(".danger-alert");
  const villageNumber = document.querySelector<HTMLElement>("#villagenum");

  button.disabled = true;
  setAlertVisibility(successAlert, false);
  setAlertVisibility(dangerAlert, false);
  button.classList.add("loading");
  button.innerHTML = '<span class="spinner"></span>';

  const messages = [...
    document.querySelectorAll<HTMLTextAreaElement>('[name="message"]'),
  ].map((input) => input.value);
  const payload = buildVillagePayload(messages);
  console.log(payload);

  try {
    const response = await fetch(SPECIAL_VILLAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`村作成 API returned ${response.status}`);
    }

    const jsonData = (await response.json()) as { data?: unknown };
    window.setTimeout(() => {
      if (villageNumber) {
        villageNumber.textContent = String(jsonData.data ?? "");
      }
      setAlertVisibility(successAlert, true);
    }, 500);
  } catch {
    setAlertVisibility(dangerAlert, true);
  } finally {
    window.setTimeout(() => {
      button.disabled = false;
      button.classList.remove("loading");
      button.textContent = "村作成";
    }, 500);
  }
}

export function initFormPage(): void {
  initCommonPage();

  document.querySelectorAll<HTMLInputElement>(".btnspinner").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      changeParticipantCount(button);
    });
  });

  document.querySelector<HTMLButtonElement>(".button")?.addEventListener(
    "click",
    () => {
      void submitVillage();
    },
  );
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFormPage, { once: true });
  } else {
    initFormPage();
  }
}
