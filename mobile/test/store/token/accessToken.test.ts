import {
  getAccessToken,
  clearAccessToken,
  saveAccessToken,
} from "@/store/token/accessToken";

describe("accessToken", () => {
  it("return null be default", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("save token", () => {
    saveAccessToken("abc123");
    expect(getAccessToken()).toBe("abc123");
  });

  it("clear token", () => {
    saveAccessToken("abc123");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
