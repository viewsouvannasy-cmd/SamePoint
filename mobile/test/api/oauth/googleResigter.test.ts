import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import googleResigter from "@/api/oauth/googleResigter-func";
import { saveAccessToken } from "@/store/token/accessToken";
import {
  GOOGLE_CLIENT_IOS_ID,
  GOOGLE_CLIENT_WEB_ID,
} from "@/config/env";

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  isSuccessResponse: jest.fn(),
}));

jest.mock("axios");
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
}));
jest.mock("@/store/token/accessToken", () => ({
  saveAccessToken: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  GOOGLE_CLIENT_IOS_ID: "ios-client-id",
  GOOGLE_CLIENT_WEB_ID: "web-client-id",
  SERVER_HOST: "https://api.example.com",
}));

const mockedGoogleSignin = jest.mocked(GoogleSignin);
const mockedIsSuccessResponse = jest.mocked(isSuccessResponse);
const mockedAxios = jest.mocked(axios);
const mockedSaveAccessToken = jest.mocked(saveAccessToken);
const mockedSetItemAsync = jest.mocked(SecureStore.setItemAsync);
const mockedReplace = jest.mocked(router.replace);

const successGoogleResponse = {
  data: { idToken: "google-id-token" },
};

const successServerResponse = {
  data: {
    ok: true,
    msg: "ok",
    data: [{ accessToken: "access-token", refreshToken: "refresh-token" }],
  },
};

describe("googleResigter", () => {
  const googleSigninConfigureCall =
    mockedGoogleSignin.configure.mock.calls[0];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockedGoogleSignin.hasPlayServices.mockResolvedValue(true);
    mockedGoogleSignin.signIn.mockResolvedValue(successGoogleResponse as never);
    mockedIsSuccessResponse.mockReturnValue(true);
    mockedAxios.get.mockResolvedValue(successServerResponse);
    mockedSetItemAsync.mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("configures GoogleSignin with client ids", () => {
    expect(googleSigninConfigureCall).toEqual([
      {
        webClientId: GOOGLE_CLIENT_WEB_ID,
        iosClientId: GOOGLE_CLIENT_IOS_ID,
      },
    ]);
  });

  it("saves tokens and navigates on success", async () => {
    await googleResigter();

    expect(mockedGoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(mockedGoogleSignin.signIn).toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/oauth/google/mobile",
      {
        headers: { Authorization: "Bearer google-id-token" },
      },
    );
    expect(mockedSaveAccessToken).toHaveBeenCalledWith("access-token");
    expect(mockedSetItemAsync).toHaveBeenCalledWith(
      "refreshToken",
      "refresh-token",
    );
    expect(mockedReplace).toHaveBeenCalledWith("/(tab)");
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("returns without calling the server when Google sign in is not successful", async () => {
    mockedIsSuccessResponse.mockReturnValue(false);

    await googleResigter();

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
    expect(mockedSetItemAsync).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("alerts when Google does not return an idToken", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    mockedGoogleSignin.signIn.mockResolvedValue({
      data: { idToken: null },
    } as never);

    await googleResigter();

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Something went wrong try again");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("alerts when the server returns ok false", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    mockedAxios.get.mockResolvedValue({
      data: {
        ok: false,
        msg: "failed",
        data: [{ accessToken: "access-token", refreshToken: "refresh-token" }],
      },
    });

    await googleResigter();

    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
    expect(mockedSetItemAsync).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Something went wrong try again");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("alerts when Google sign in throws", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const error = new Error("play services unavailable");
    mockedGoogleSignin.hasPlayServices.mockRejectedValue(error);

    await googleResigter();

    expect(mockedGoogleSignin.signIn).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Something went wrong try again");
    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });

  it("alerts when the server request fails", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const error = new Error("network error");
    mockedAxios.get.mockRejectedValue(error);

    await googleResigter();

    expect(mockedSaveAccessToken).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Something went wrong try again");
    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });
});
