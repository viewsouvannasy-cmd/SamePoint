import axios from "axios";

import { getUserData } from "@/api/user/user-func";
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

const mockUser = {
  ok: true,
  msg: "Success",
  data: [
    {
      user_name: "Alice",
      user_email: "alice@example.com",
      avatar_seed: "seed123",
      profile_url: "",
      total_archive_project: 1,
    },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getUserData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
  });

  it("calls /api/v1/user with Bearer token and returns data", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const result = await getUserData(false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/user",
      { headers: { Authorization: "Bearer access-token" } },
    );
    expect(result).toEqual(mockUser);
  });

  it("delegates errors to handleAccessTokenError and retries with isRetry=true", async () => {
    const error = new Error("401");
    mockedAxios.get
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ data: mockUser });

    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => await retry(),
    );

    const result = await getUserData();

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockUser);
  });

  it("passes isRetry=true to handleAccessTokenError when already retrying", async () => {
    const error = new Error("401");
    mockedAxios.get.mockRejectedValueOnce(error);
    mockedHandleAccessTokenError.mockRejectedValueOnce(error);

    await expect(getUserData(true)).rejects.toThrow("401");

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });
});
