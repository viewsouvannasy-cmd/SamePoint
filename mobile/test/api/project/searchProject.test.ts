import axios from "axios";

import { searchProject } from "@/api/project/project-func";
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

const mockProjectList = {
  ok: true,
  msg: "ok",
  data: [
    {
      p_id: 1,
      project_name: "Alpha Project",
      describe: "Alpha description",
      is_owner: true,
      member_seeds: ["seed1"],
      new_task: { count: 0, data: [] },
      in_review: { count: 0, data: [] },
      approved: { count: 0, data: [] },
    },
  ],
};

const payload = { search: "Alpha" };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("searchProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
    mockedAxios.post.mockResolvedValue({ data: mockProjectList });
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it("calls the correct endpoint with search payload and Bearer token", async () => {
    await searchProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project/search",
      { search: "Alpha" },
      { headers: { Authorization: "Bearer access-token" } },
    );
  });

  it("returns the response data on success", async () => {
    const result = await searchProject(false, payload);

    expect(result).toEqual(mockProjectList);
  });

  it("uses null token when no access token is stored", async () => {
    mockedGetAccessToken.mockReturnValue(null);

    await searchProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project/search",
      payload,
      { headers: { Authorization: "Bearer null" } },
    );
  });

  it("only calls POST once when successful (no retry)", async () => {
    await searchProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("works with empty search query", async () => {
    await searchProject(false, { search: "" });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project/search",
      { search: "" },
      { headers: { Authorization: "Bearer access-token" } },
    );
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("delegates errors to handleAccessTokenError with isRetry=false by default", async () => {
    const error = new Error("network error");
    mockedAxios.post.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockResolvedValue(mockProjectList as never);

    const result = await searchProject(false, payload);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(result).toEqual(mockProjectList);
  });

  it("passes isRetry=true to handleAccessTokenError when called with true", async () => {
    const error = new Error("fail");
    mockedAxios.post.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockResolvedValue(mockProjectList as never);

    await searchProject(true, payload);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });

  it("retries by calling searchProject(true, { search }) via the retry callback", async () => {
    const error = new Error("fail");
    mockedAxios.post
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ data: mockProjectList });

    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => retry(),
    );

    const result = await searchProject(false, payload);

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/v1/project/search",
      { search: "Alpha" },
      { headers: { Authorization: "Bearer access-token" } },
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/v1/project/search",
      { search: "Alpha" },
      { headers: { Authorization: "Bearer access-token" } },
    );
    expect(result).toEqual(mockProjectList);
  });

  it("propagates errors thrown by handleAccessTokenError", async () => {
    const error = new Error("token invalid");
    mockedAxios.post.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockRejectedValue(error);

    await expect(searchProject(false, payload)).rejects.toThrow(
      "token invalid",
    );
  });
});
