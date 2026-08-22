import { API_BASE } from "./config";

describe("API configuration", () => {
  it("keeps the production backend as the default", () => {
    expect(API_BASE).toBe("https://insidergamehelper.herokuapp.com");
  });
});
