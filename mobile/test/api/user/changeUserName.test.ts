import axios, { isAxiosError } from "axios";

import { changeUserName } from "@/api/user/user-func";
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
const mockedIsAxiosError = jest.mocked(isAxiosError);
const mockedGetAccessToken = jest.mocked(getAccessToken);
const mockedHandleAccessTokenError = jest.mocked(handleAccessTokenError);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("changeUserName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
    mockedIsAxiosError.mockReturnValue(false);
  });

  it("sends PUT /api/v1/user/user-name with new_name and Bearer token", async () => {
    mockedAxios.put.mockResolvedValueOnce({});

    const result = await changeUserName(false, { new_name: "Bob" });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/user/user-name",
      { new_name: "Bob" },
      { headers: { Authorization: "Bearer access-token" } },
    );
    expect(result).toBeUndefined();
  });

  it("rethrows 400 axios errors directly without calling handleAccessTokenError", async () => {
    const error = { response: { status: 400 }, status: 400 };
    mockedAxios.put.mockRejectedValueOnce(error);
    mockedIsAxiosError.mockReturnValueOnce(true);

    await expect(changeUserName(false, { new_name: "ab" })).rejects.toEqual(
      error,
    );

    expect(mockedHandleAccessTokenError).not.toHaveBeenCalled();
  });

  it("delegates non-400 errors to handleAccessTokenError and retries with isRetry=true", async () => {
    const error = { response: { status: 401 }, status: 401 };
    mockedAxios.put.mockRejectedValueOnce(error).mockResolvedValueOnce({});
    mockedIsAxiosError.mockReturnValueOnce(true);
    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => await retry(),
    );

    await changeUserName(false, { new_name: "Alice" });

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(mockedAxios.put).toHaveBeenCalledTimes(2);
  });
});
