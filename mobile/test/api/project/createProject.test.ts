import axios, { isAxiosError } from "axios";

import { createProject } from "@/api/project/project-func";
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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const payload = { project_name: "My Project", describe: "A description" };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
    mockedAxios.post.mockResolvedValue({});
    mockedIsAxiosError.mockReturnValue(false);
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it("calls the correct endpoint with Bearer token and body", async () => {
    await createProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project",
      { project_name: "My Project", describe: "A description" },
      { headers: { Authorization: "Bearer access-token" } },
    );
  });

  it("returns void on success", async () => {
    const result = await createProject(false, payload);

    expect(result).toBeUndefined();
  });

  it("uses null token when no access token is stored", async () => {
    mockedGetAccessToken.mockReturnValue(null);

    await createProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project",
      payload,
      { headers: { Authorization: "Bearer null" } },
    );
  });

  it("only calls POST once when successful (no retry)", async () => {
    await createProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  // ── 400 Bad Request ────────────────────────────────────────────────────────

  it("rethrows the error directly when status is 400", async () => {
    const error = { response: { status: 400 }, status: 400 };
    mockedAxios.post.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(true);

    await expect(createProject(false, payload)).rejects.toEqual(error);
    expect(mockedHandleAccessTokenError).not.toHaveBeenCalled();
  });

  // ── Token / network errors → handleAccessTokenError ────────────────────────

  it("delegates non-400 axios errors to handleAccessTokenError with isRetry=false", async () => {
    const error = { response: { status: 401 }, status: 401 };
    mockedAxios.post.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(true);
    mockedHandleAccessTokenError.mockResolvedValue(undefined as never);

    await createProject(false, payload);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
  });

  it("passes isRetry=true to handleAccessTokenError when called with true", async () => {
    const error = { response: { status: 401 }, status: 401 };
    mockedAxios.post.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(true);
    mockedHandleAccessTokenError.mockResolvedValue(undefined as never);

    await createProject(true, payload);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });

  it("delegates non-axios errors to handleAccessTokenError", async () => {
    const error = new Error("network failure");
    mockedAxios.post.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(false);
    mockedHandleAccessTokenError.mockResolvedValue(undefined as never);

    await createProject(false, payload);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
  });

  it("retries by calling createProject(true, payload) via the retry callback", async () => {
    const error = { response: { status: 401 }, status: 401 };
    mockedAxios.post
      .mockRejectedValueOnce(error)  // first call fails
      .mockResolvedValueOnce({});    // retry succeeds
    mockedIsAxiosError
      .mockReturnValueOnce(true)     // first error is axios
      .mockReturnValueOnce(false);   // second error check in retry path

    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => retry(),
    );

    await createProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    // Second call must have isRetry=true (passed as first arg to createProject)
    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
  });

  it("propagates errors thrown by handleAccessTokenError", async () => {
    const error = new Error("token invalid");
    mockedAxios.post.mockRejectedValue(error);
    mockedIsAxiosError.mockReturnValue(false);
    mockedHandleAccessTokenError.mockRejectedValue(error);

    await expect(createProject(false, payload)).rejects.toThrow("token invalid");
  });
});
