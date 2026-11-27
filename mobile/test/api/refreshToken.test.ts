import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { fetchRefreshToken } from "@/api/refresh-token";
import { saveAccessToken, clearAccessToken } from "@/store/token/accessToken";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("axios");
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));
jest.mock("@/store/token/accessToken", () => ({
  saveAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  SERVER_HOST: "https://api.example.com",
}));

const mockedAxios = jest.mocked(axios);
const mockedGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockedSaveAccessToken = jest.mocked(saveAccessToken);
const mockedClearAccessToken = jest.mocked(clearAccessToken);
const mockedReplace = jest.mocked(router.replace);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("fetchRefreshToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItemAsync.mockResolvedValue("stored-refresh-token");
    mockedAxios.get.mockResolvedValue({
      data: {
        ok: true,
        msg: "ok",
        data: [{ accessToken: "new-access-token" }],
      },
    });
  });

  it("fetches a new access token and saves it on success", async () => {
    await fetchRefreshToken();

    expect(mockedGetItemAsync).toHaveBeenCalledWith("refreshToken");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/refresh-token/mobile",
      {
        headers: { Authorization: "Bearer stored-refresh-token" },
      },
    );
    expect(mockedSaveAccessToken).toHaveBeenCalledWith("new-access-token");
    expect(mockedClearAccessToken).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent calls into a single network request", async () => {
    let resolveRequest!: (value: unknown) => void;
    mockedAxios.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }) as never,
    );

    const p1 = fetchRefreshToken();
    const p2 = fetchRefreshToken();

    // Flush microtasks so SecureStore.getItemAsync resolves and axios.get is invoked
    await Promise.resolve();
    await Promise.resolve();

    resolveRequest({
      data: {
        ok: true,
        msg: "ok",
        data: [{ accessToken: "shared-token" }],
      },
    });

    await Promise.all([p1, p2]);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedSaveAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedSaveAccessToken).toHaveBeenCalledWith("shared-token");
  });

  it("clears access token, navigates to signin, and rethrows on failure", async () => {
    const error = new Error("Refresh failed");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(fetchRefreshToken()).rejects.toThrow("Refresh failed");

    expect(mockedClearAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
  });

  it("allows a fresh request after a previous failure settles", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Temporary failure"));

    await expect(fetchRefreshToken()).rejects.toThrow("Temporary failure");

    await fetchRefreshToken();

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedSaveAccessToken).toHaveBeenCalledWith("new-access-token");
  });
});
