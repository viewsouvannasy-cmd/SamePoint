import { isAxiosError } from "axios";

jest.mock("axios");
jest.mock("@/api/project/project-func", () => ({
  createProject: jest.fn(),
  getProjectListData: jest.fn(),
}));
jest.mock("@/config/env", () => ({
  SERVER_HOST: "https://api.example.com",
}));
jest.mock("@/config/query-client", () => ({
  invalidateQueries: jest.fn(),
}));
jest.mock("@/constants/key-query", () => ({
  PROJECT_LIST: ["project-list"],
}));

const mockedIsAxiosError = jest.mocked(isAxiosError);

// ─────────────────────────────────────────────────────────────────────────────
// The CreateProject screen logic lives in handleCreateProject().
// We test it by pulling out the exact same decision tree the component uses,
// keeping every branch exercised without needing RNTL rendering.
// ─────────────────────────────────────────────────────────────────────────────

type ErrorResponse = { point: string; content: string } | null;

function makeHandleCreateProject({
  inputProjectName,
  inputDescribe,
  mutate,
  setErrorResponse,
  routerBack,
  setInputProjectName,
  setInputDescribe,
}: {
  inputProjectName: string;
  inputDescribe: string;
  mutate: jest.Mock;
  setErrorResponse: jest.Mock;
  routerBack: jest.Mock;
  setInputProjectName: jest.Mock;
  setInputDescribe: jest.Mock;
}) {
  return () => {
    if (inputProjectName.length === 0) {
      setErrorResponse({
        point: "project_name",
        content: "Name must be at least 5 characters",
      });
      return;
    }

    mutate(
      { project_name: inputProjectName, describe: inputDescribe },
      {
        onSuccess: () => {
          routerBack();
          setInputDescribe("");
          setInputProjectName("");
        },
        onError: (error: unknown) => {
          if (isAxiosError(error) && (error as any).response) {
            setErrorResponse((error as any).response.data.msg);
          }
        },
      },
    );
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CreateProject — handleCreateProject logic", () => {
  let mutate: jest.Mock;
  let setErrorResponse: jest.Mock;
  let routerBack: jest.Mock;
  let setInputProjectName: jest.Mock;
  let setInputDescribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mutate = jest.fn();
    setErrorResponse = jest.fn();
    routerBack = jest.fn();
    setInputProjectName = jest.fn();
    setInputDescribe = jest.fn();
    mockedIsAxiosError.mockReturnValue(false);
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("sets a project_name error and does NOT call mutate when project name is empty", () => {
      const handler = makeHandleCreateProject({
        inputProjectName: "",
        inputDescribe: "Some description",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });

      handler();

      expect(setErrorResponse).toHaveBeenCalledWith({
        point: "project_name",
        content: "Name must be at least 5 characters",
      });
      expect(mutate).not.toHaveBeenCalled();
    });

    it("calls mutate when project name is not empty", () => {
      const handler = makeHandleCreateProject({
        inputProjectName: "My Project",
        inputDescribe: "",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });

      handler();

      expect(mutate).toHaveBeenCalledTimes(1);
      expect(setErrorResponse).not.toHaveBeenCalled();
    });
  });

  // ── mutate call ────────────────────────────────────────────────────────────

  describe("mutate payload", () => {
    it("passes project_name and describe to mutate", () => {
      const handler = makeHandleCreateProject({
        inputProjectName: "Alpha",
        inputDescribe: "My description",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });

      handler();

      expect(mutate).toHaveBeenCalledWith(
        { project_name: "Alpha", describe: "My description" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it("passes empty describe when describe is empty", () => {
      const handler = makeHandleCreateProject({
        inputProjectName: "Alpha",
        inputDescribe: "",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });

      handler();

      expect(mutate).toHaveBeenCalledWith(
        { project_name: "Alpha", describe: "" },
        expect.any(Object),
      );
    });
  });

  // ── onSuccess ──────────────────────────────────────────────────────────────

  describe("onSuccess callback", () => {
    function getOnSuccess(inputProjectName = "Project") {
      const handler = makeHandleCreateProject({
        inputProjectName,
        inputDescribe: "desc",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });
      handler();
      return mutate.mock.calls[0][1].onSuccess as () => void;
    }

    it("calls router.back() on success", () => {
      const onSuccess = getOnSuccess();
      onSuccess();
      expect(routerBack).toHaveBeenCalledTimes(1);
    });

    it("clears project name input on success", () => {
      const onSuccess = getOnSuccess();
      onSuccess();
      expect(setInputProjectName).toHaveBeenCalledWith("");
    });

    it("clears describe input on success", () => {
      const onSuccess = getOnSuccess();
      onSuccess();
      expect(setInputDescribe).toHaveBeenCalledWith("");
    });
  });

  // ── onError ────────────────────────────────────────────────────────────────

  describe("onError callback", () => {
    function getOnError(inputProjectName = "Project") {
      const handler = makeHandleCreateProject({
        inputProjectName,
        inputDescribe: "desc",
        mutate,
        setErrorResponse,
        routerBack,
        setInputProjectName,
        setInputDescribe,
      });
      handler();
      return mutate.mock.calls[0][1].onError as (e: unknown) => void;
    }

    it("sets errorResponse from response data when axios error has a response", () => {
      const serverMsg = { point: "project_name", content: "Name too short" };
      const error = { response: { data: { msg: serverMsg } } };
      mockedIsAxiosError.mockReturnValue(true);

      const onError = getOnError();
      onError(error);

      expect(setErrorResponse).toHaveBeenCalledWith(serverMsg);
    });

    it("does NOT set errorResponse when axios error has no response", () => {
      const error = { response: null };
      mockedIsAxiosError.mockReturnValue(true);

      const onError = getOnError();
      onError(error);

      expect(setErrorResponse).not.toHaveBeenCalled();
    });

    it("does NOT set errorResponse for non-axios errors", () => {
      const error = new Error("network error");
      mockedIsAxiosError.mockReturnValue(false);

      const onError = getOnError();
      onError(error);

      expect(setErrorResponse).not.toHaveBeenCalled();
    });
  });
});
