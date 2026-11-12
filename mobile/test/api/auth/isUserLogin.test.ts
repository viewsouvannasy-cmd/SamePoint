import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

import { isUserLogin } from "@/api/auth/auth-func";
import { saveAccessToken } from "@/store/token/accessToken";

jest.mock("axios");
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));
jest.mock("@/store/token/accessToken", () => ({
  saveAccessToken: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  SERVER_HOST: "https://api.example.com",
}));

const mockedAxios = jest.mocked(axios);
const mockedIsAxiosError = jest.mocked(isAxiosError);
const mockedGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockedSaveAccessToken = jest.mocked(saveAccessToken);

const successResponse = {
  data: {
    ok: true,
    msg: "ok",
    data: [{ accessToken: "access-token" }],
  },
};

describe("isUserLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItemAsync.mockResolvedValue("refresh-token");
    mockedAxios.get.mockResolvedValue(successResponse);
    mockedIsAxiosError.mockReturnValue(false);
  });

  it("saves the access token and returns the server payload on success", async () => {
    const result = await isUserLogin();

    expect(mockedGetItemAsync).toHaveBeenCalledWith("refreshToken");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/mobile/is-login",
      {
        headers: { Authorization: "Bearer refresh-token" },
      },
    );
    expect(mockedSaveAccessToken).toHaveBeenCalledWith("access-token");
    expect(result).toEqual(successResponse.data);
  });

  it("sends Bearer null when no refresh token is stored", async () => {
    mockedGetItemAsync.mockResolvedValue(null);

    await isUserLogin();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/mobile/is-login",
      {
        headers: { Authorization: "Bearer null" },
      },
    );
  });

  it("returns the server error body when axios fails with a response", async () => {
    const errorBody = {
      ok: false,
      msg: "unauthorized",
      data: [{ accessToken: "" }],
    };
    mockedAxios.get.mockRejectedValue({
      response: { data: errorBody },
    });
    mockedIsAxiosError.mockReturnValue(true);

    const result = await isUserLogin();

    expect(result).toEqual(errorBody);
    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
  });

  it("rethrows axios errors that have no response", async () => {
    const error = new Error("network error");
    mockedAxios.get.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(true);

    await expect(isUserLogin()).rejects.toThrow("network error");
    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
  });

  it("rethrows non-axios errors", async () => {
    const error = new Error("secure store failed");
    mockedGetItemAsync.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(false);

    await expect(isUserLogin()).rejects.toThrow("secure store failed");
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
  });
});
