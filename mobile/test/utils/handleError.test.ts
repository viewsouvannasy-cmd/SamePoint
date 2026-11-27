import { isAxiosError } from "axios";
import { router } from "expo-router";

import { handleAccessTokenError } from "@/utils/handleError";
import { fetchRefreshToken } from "@/api/refresh-token";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("axios", () => ({
  isAxiosError: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock("@/api/refresh-token", () => ({
  fetchRefreshToken: jest.fn(),
}));

const mockedIsAxiosError = jest.mocked(isAxiosError);
const mockedFetchRefreshToken = jest.mocked(fetchRefreshToken);
const mockedReplace = jest.mocked(router.replace);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("handleAccessTokenError", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockedIsAxiosError.mockReturnValue(false);
    mockedFetchRefreshToken.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("refreshes token and invokes retry when TOKEN_EXPIRED and isRetry is false", async () => {
    const error = {
      response: {
        status: 401,
        data: { ok_verify_token: false, msg: "TOKEN_EXPIRED" },
      },
    };
    mockedIsAxiosError.mockReturnValueOnce(true);
    const retry = jest.fn().mockResolvedValueOnce("retried-data");

    const result = await handleAccessTokenError(error, false, retry);

    expect(mockedFetchRefreshToken).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result).toBe("retried-data");
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("refreshes token and invokes retry when TOKEN_MISSING and isRetry is false", async () => {
    const error = {
      response: {
        status: 401,
        data: { ok_verify_token: false, msg: "TOKEN_MISSING" },
      },
    };
    mockedIsAxiosError.mockReturnValueOnce(true);
    const retry = jest.fn().mockResolvedValueOnce("ok");

    const result = await handleAccessTokenError(error, false, retry);

    expect(mockedFetchRefreshToken).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result).toBe("ok");
  });

  it("navigates to signin and rethrows when TOKEN_EXPIRED and isRetry is already true", async () => {
    const error = {
      response: {
        status: 401,
        data: { ok_verify_token: false, msg: "TOKEN_EXPIRED" },
      },
    };
    mockedIsAxiosError.mockReturnValueOnce(true);
    const retry = jest.fn();

    await expect(handleAccessTokenError(error, true, retry)).rejects.toEqual(
      error,
    );

    expect(mockedFetchRefreshToken).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("navigates to signin and rethrows when msg is TOKEN_INVALID", async () => {
    const error = {
      response: {
        status: 401,
        data: { ok_verify_token: false, msg: "TOKEN_INVALID" },
      },
    };
    mockedIsAxiosError.mockReturnValueOnce(true);
    const retry = jest.fn();

    await expect(handleAccessTokenError(error, false, retry)).rejects.toEqual(
      error,
    );

    expect(mockedFetchRefreshToken).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("navigates to signin and rethrows for non-axios errors", async () => {
    const error = new Error("Unexpected failure");
    mockedIsAxiosError.mockReturnValueOnce(false);
    const retry = jest.fn();

    await expect(handleAccessTokenError(error, false, retry)).rejects.toThrow(
      "Unexpected failure",
    );

    expect(mockedFetchRefreshToken).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("navigates to signin and rethrows for non-401 axios errors", async () => {
    const error = {
      response: {
        status: 500,
        data: { ok_verify_token: false, msg: "Internal Server Error" },
      },
    };
    mockedIsAxiosError.mockReturnValueOnce(true);
    const retry = jest.fn();

    await expect(handleAccessTokenError(error, false, retry)).rejects.toEqual(
      error,
    );

    expect(mockedFetchRefreshToken).not.toHaveBeenCalled();
    expect(mockedReplace).toHaveBeenCalledWith("/(auth)/signin");
  });
});
