import {
  CHAT_ERROR_MESSAGE,
  createUserId,
  getImg,
  getText,
  zeroPadding,
} from "./logic";

describe("chat response logic", () => {
  it("reads text messages", () => {
    expect(getText([{ type: "text", text: "村番号を入力してください" }])).toBe(
      "村番号を入力してください",
    );
    expect(getImg([{ type: "text", text: "本文" }])).toBeNull();
  });

  it("reads template text and thumbnail image", () => {
    const data = [
      {
        type: "template",
        template: {
          text: "あなたの役職です",
          thumbnailImageUrl: "https://example.com/role.png",
        },
      },
    ];

    expect(getText(data)).toBe("あなたの役職です");
    expect(getImg(data)).toBe("https://example.com/role.png");
  });

  it.each([null, [], [{ type: "unknown" }], [{ type: "template" }]])(
    "returns a safe error message for invalid response %#",
    (data) => {
      expect(getText(data)).toBe(CHAT_ERROR_MESSAGE);
      expect(getImg(data)).toBeNull();
    },
  );

  it("keeps the existing padding and user id formats", () => {
    expect(zeroPadding(7, 2)).toBe("07");
    expect(createUserId(1700000000000, 0.5)).toBe("1700000000000i");
  });
});
