import axios from "axios";

import { getUserProfile } from "@/api/user/user-func";
import { getAccessToken } from "@/store/token/accessToken";
import { handleAccessTokenError } from "@/utils/handleError";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("axios");
jest.mock("@/store/token/accessToken", () => ({
  getAccessToken: jest.fn(),
}));
jest.mock("@/utils/handleError", () => ({
  handleAccessTokenError: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  SERVER_HOST: "https://api.example.com",
}));

const mockedAxios = jest.mocked(axios);
const mockedGetAccessToken = jest.mocked(getAccessToken);
const mockedHandleAccessTokenError = jest.mocked(handleAccessTokenError);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProfile = {
  ok: true,
  msg: "Success",
  data: [{ avatar_seed: "seed123", profile_url: "" }],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
  });

  it("calls /api/v1/user/profile with Bearer token and returns data", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

    const result = await getUserProfile(false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/user/profile",
      { headers: { Authorization: "Bearer access-token" } },
    );
    expect(result).toEqual(mockProfile);
  });

  it("delegates errors to handleAccessTokenError and retries with isRetry=true", async () => {
    const error = new Error("401");
    mockedAxios.get
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ data: mockProfile });

    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => await retry(),
    );

    const result = await getUserProfile();

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockProfile);
  });

  it("passes isRetry=true to handleAccessTokenError when already retrying", async () => {
    const error = new Error("401");
    mockedAxios.get.mockRejectedValueOnce(error);
    mockedHandleAccessTokenError.mockRejectedValueOnce(error);

    await expect(getUserProfile(true)).rejects.toThrow("401");

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });
});
