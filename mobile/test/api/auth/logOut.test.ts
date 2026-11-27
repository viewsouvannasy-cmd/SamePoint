import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { logOut } from "@/api/auth/auth-func";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("axios");
jest.mock("expo-router", () => ({
  router: {
    dismissAll: jest.fn(),
    replace: jest.fn(),
  },
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  SERVER_HOST: "https://api.example.com",
}));

const mockedAxios = jest.mocked(axios);
const mockedGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockedDismissAll = jest.mocked(router.dismissAll);
const mockedReplace = jest.mocked(router.replace);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("logOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItemAsync.mockResolvedValue("stored-refresh-token");
    mockedAxios.get.mockResolvedValue({ data: { ok: true } });
  });

  it("reads refreshToken from SecureStore, calls logout endpoint, and navigates to signin", async () => {
    await logOut();

    expect(mockedGetItemAsync).toHaveBeenCalledWith("refreshToken");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/mobile/logout",
      {
        headers: { Authorization: "Bearer stored-refresh-token" },
      },
    );
    expect(mockedDismissAll).toHaveBeenCalledTimes(1);
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("navigates to signin and rethrows when logout request fails", async () => {
    const error = new Error("Logout request failed");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(logOut()).rejects.toThrow("Logout request failed");

    expect(mockedDismissAll).toHaveBeenCalledTimes(1);
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("navigates to signin and rethrows when SecureStore fails", async () => {
    const storeError = new Error("Keychain error");
    mockedGetItemAsync.mockRejectedValueOnce(storeError);

    await expect(logOut()).rejects.toThrow("Keychain error");

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedDismissAll).toHaveBeenCalledTimes(1);
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });
});
