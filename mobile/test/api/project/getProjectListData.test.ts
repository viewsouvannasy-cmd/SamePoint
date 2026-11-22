import axios, { isAxiosError } from "axios";

import { getProjectListData } from "@/api/project/project-func";
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
      project_name: "Alpha",
      describe: "desc",
      is_owner: true,
      member_seeds: ["seed1"],
      new_task: { count: 0, data: [] },
      in_review: { count: 0, data: [] },
      approved: { count: 0, data: [] },
    },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getProjectListData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockReturnValue("access-token");
    mockedAxios.get.mockResolvedValue({ data: mockProjectList });
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it("calls the correct endpoint with Bearer token", async () => {
    await getProjectListData();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project",
      { headers: { Authorization: "Bearer access-token" } },
    );
  });

  it("returns the response data on success", async () => {
    const result = await getProjectListData();

    expect(result).toEqual(mockProjectList);
  });

  it("uses null token when no access token is stored", async () => {
    mockedGetAccessToken.mockReturnValue(null);

    await getProjectListData();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/project",
      { headers: { Authorization: "Bearer null" } },
    );
  });

  it("only calls GET once when successful (no retry)", async () => {
    await getProjectListData();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("delegates errors to handleAccessTokenError with isRetry=false by default", async () => {
    const error = new Error("network error");
    mockedAxios.get.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockResolvedValue(mockProjectList as never);

    const result = await getProjectListData();

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(result).toEqual(mockProjectList);
  });

  it("passes isRetry=true to handleAccessTokenError when called with true", async () => {
    const error = new Error("fail");
    mockedAxios.get.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockResolvedValue(mockProjectList as never);

    await getProjectListData(true);

    expect(mockedHandleAccessTokenError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });

  it("retries by calling getProjectListData(true) via the retry callback", async () => {
    const error = new Error("fail");
    mockedAxios.get
      .mockRejectedValueOnce(error)       // first call fails
      .mockResolvedValueOnce({ data: mockProjectList }); // retry succeeds

    // Invoke the captured retry callback to verify recursive call
    mockedHandleAccessTokenError.mockImplementationOnce(
      async (_err, _isRetry, retry) => retry(),
    );

    const result = await getProjectListData();

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockProjectList);
  });

  it("propagates errors thrown by handleAccessTokenError", async () => {
    const error = new Error("token invalid");
    mockedAxios.get.mockRejectedValue(error);
    mockedHandleAccessTokenError.mockRejectedValue(error);

    await expect(getProjectListData()).rejects.toThrow("token invalid");
  });
});
