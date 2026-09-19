import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFormPage } from "./form";

const html = readFileSync(`${process.cwd()}/form.html`, "utf8");
const button = (id: string) => document.querySelector<HTMLButtonElement>(id)!;
const input = (index: number) =>
  document.querySelector<HTMLTextAreaElement>(`#message-${index}`)!;
function enter(index: number, text: string) {
  input(index).value = text;
  input(index).dispatchEvent(new Event("input", { bubbles: true }));
}
function submit() {
  document
    .querySelector("form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  document.body.innerHTML = html.slice(html.indexOf("<body"));
  initFormPage();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("village builder", () => {
  it("retains a removed draft and adds an empty field instead of copying another participant", () => {
    enter(1, "秘密のお題");
    enter(5, "最後の参加者");
    button("#decrease").click();
    button("#increase").click();
    expect(input(5).value).toBe("最後の参加者");
    button("#increase").click();
    expect(input(6).value).toBe("");
    expect(document.querySelector("#filled-count")!.textContent).toBe("2");
    expect(document.querySelector('label[for="message-6"]')).not.toBeNull();
  });

  it("enforces the participant bounds", () => {
    for (let i = 0; i < 25; i++) button("#increase").click();
    expect(document.querySelectorAll("textarea")).toHaveLength(20);
    expect(button("#increase").disabled).toBe(true);
    for (let i = 0; i < 25; i++) button("#decrease").click();
    expect(document.querySelectorAll("textarea")).toHaveLength(2);
    expect(button("#decrease").disabled).toBe(true);
  });

  it("sends only active messages in order, prevents duplicate submits, and presents the village number", async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(
      (_url: RequestInfo | URL, _options?: RequestInit) =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    enter(1, "最初");
    enter(5, "除外");
    button("#decrease").click();
    submit();
    submit();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({
      message: ["最初", "", "", ""],
    });
    expect(button("#create-village").disabled).toBe(true);
    finish(new Response(JSON.stringify({ data: "12345" })));
    await vi.waitFor(() =>
      expect(
        document.querySelector<HTMLElement>("#village-result")!.hidden,
      ).toBe(false),
    );
    expect(document.querySelector("#village-number")!.textContent).toBe(
      "12345",
    );
    expect(document.activeElement?.id).toBe("village-result");
    button("#edit-village").click();
    expect(input(1).value).toBe("最初");
  });

  it.each([new Response("{}"), new Response("", { status: 500 })])(
    "keeps drafts and shows a recoverable error for invalid or failed responses",
    async (response) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
      enter(1, "残しておく内容");
      submit();
      await vi.waitFor(() =>
        expect(
          document.querySelector<HTMLElement>("#create-error")!.hidden,
        ).toBe(false),
      );
      expect(input(1).value).toBe("残しておく内容");
      expect(button("#create-village").disabled).toBe(false);
      expect(
        document.querySelector<HTMLElement>("#village-result")!.hidden,
      ).toBe(true);
    },
  );
  it("copies the returned village number and explains clipboard failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ data: "23456" }))),
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    submit();
    await vi.waitFor(() =>
      expect(
        document.querySelector<HTMLElement>("#village-result")!.hidden,
      ).toBe(false),
    );
    button("#copy-number").click();
    await vi.waitFor(() =>
      expect(button("#copy-number").textContent).toContain("コピーしました"),
    );
    expect(writeText).toHaveBeenCalledWith("23456");
    writeText.mockRejectedValue(new Error("Clipboard unavailable"));
    button("#copy-number").click();
    await vi.waitFor(() =>
      expect(document.querySelector("#copy-status")!.textContent).toContain(
        "長押し",
      ),
    );
  });

  it("recovers from a network failure without clearing input", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Network error")),
    );
    enter(2, "大事な役職");
    submit();
    await vi.waitFor(() =>
      expect(button("#create-village").disabled).toBe(false),
    );
    expect(input(2).value).toBe("大事な役職");
    expect(
      document.querySelector<HTMLFieldSetElement>("fieldset")!.disabled,
    ).toBe(false);
  });
});
