import { callApi } from "./api";

describe("chat API", () => {
  it("builds the expected callapi request", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => [{ type: "text", text: "応答" }],
    } as Response);

    const result = await callApi("user 1", "お題", fetchImpl);
    const request = fetchImpl.mock.calls[0]?.[0];

    expect(result).toEqual([{ type: "text", text: "応答" }]);
    expect(request).toBeInstanceOf(URL);
    expect((request as URL).pathname).toBe("/callapi");
    expect((request as URL).searchParams.get("userId")).toBe("user 1");
    expect((request as URL).searchParams.get("message")).toBe("お題");
  });

  it("returns null when the backend request fails", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));

    await expect(callApi("user 1", "お題", fetchImpl)).resolves.toBeNull();
  });
});
