import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { isAxiosError } from "axios";

import ChangeUserName from "@/app/(setting)/change-user-name";
import { useChangeUserName } from "@/api/user/user";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockBack = jest.fn();

jest.mock("axios", () => ({
  isAxiosError: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/icon/Icon", () => {
  const { Text } = require("react-native");
  return function MockIcon({ name }: { name: string }) {
    return <Text testID={`icon-${name}`}>{name}</Text>;
  };
});

jest.mock("@/components/load-state/LoadingDots", () => {
  const { View } = require("react-native");
  return function MockLoadingDots() {
    return <View testID="loading-dots" />;
  };
});

jest.mock("@/api/user/user", () => ({
  useChangeUserName: jest.fn(),
}));

const mockedUseChangeUserName = jest.mocked(useChangeUserName);
const mockedIsAxiosError = jest.mocked(isAxiosError);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ChangeUserName", () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate = jest.fn();
    mockedUseChangeUserName.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as never);
    mockedIsAxiosError.mockReturnValue(false);
  });

  it("renders initial UI state correctly", async () => {
    const { getByText, getByPlaceholderText, queryByTestId } = await render(
      <ChangeUserName />,
    );

    expect(getByText("User name")).toBeTruthy();
    expect(getByPlaceholderText("My new name..")).toBeTruthy();
    expect(getByText("Shown to teammates and on your projects")).toBeTruthy();
    expect(getByText("0/30")).toBeTruthy();
    expect(getByText("Save name")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(queryByTestId("icon-plus")).toBeNull();
  });

  it("updates character counter as user types and clears input with clear button when focused", async () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByTestId } =
      await render(<ChangeUserName />);

    const input = getByPlaceholderText("My new name..");

    await fireEvent(input, "focus");
    expect(queryByTestId("icon-plus")).toBeNull();

    await fireEvent.changeText(input, "Alice");
    expect(getByText("5/30")).toBeTruthy();
    expect(getByTestId("icon-plus")).toBeTruthy();

    await fireEvent.press(getByTestId("icon-plus"));
    expect(input.props.value).toBe("");
    expect(getByText("0/30")).toBeTruthy();
    expect(queryByTestId("icon-plus")).toBeNull();

    await fireEvent.changeText(input, "Bob");
    await fireEvent(input, "blur");
    expect(queryByTestId("icon-plus")).toBeNull();
  });

  it("clears input and calls router.back() when Cancel is pressed", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangeUserName />,
    );

    const input = getByPlaceholderText("My new name..");
    await fireEvent.changeText(input, "Alice");
    await fireEvent.press(getByText("Cancel"));

    expect(input.props.value).toBe("");
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("shows validation error when Save name is pressed with empty input", async () => {
    const { getByText } = await render(<ChangeUserName />);

    await fireEvent.press(getByText("Save name"));

    expect(getByText("Name must be at least 3 characters")).toBeTruthy();
    expect(mockMutate).toHaveBeenCalledWith(
      { new_name: "" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("submits new_name, resets input, and navigates back on success", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangeUserName />,
    );

    const input = getByPlaceholderText("My new name..");
    await fireEvent.changeText(input, "Alice");
    await fireEvent.press(getByText("Save name"));

    expect(mockMutate).toHaveBeenCalledWith(
      { new_name: "Alice" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );

    const { onSuccess } = mockMutate.mock.calls[0][1];
    await act(async () => {
      onSuccess();
    });

    expect(input.props.value).toBe("");
    expect(getByText("0/30")).toBeTruthy();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("displays server error message on Axios error response and clears it on input focus", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangeUserName />,
    );

    const input = getByPlaceholderText("My new name..");
    await fireEvent.changeText(input, "Al");
    await fireEvent.press(getByText("Save name"));

    mockedIsAxiosError.mockReturnValue(true);
    const { onError } = mockMutate.mock.calls[0][1];
    await act(async () => {
      onError({
        response: {
          data: {
            msg: {
              point: "new_name",
              content: "Name must be at least 3 characters",
            },
          },
        },
      });
    });

    expect(getByText("Name must be at least 3 characters")).toBeTruthy();

    await fireEvent(input, "focus");
    expect(getByText("Shown to teammates and on your projects")).toBeTruthy();
  });

  it("keeps helper text when onError receives a non-Axios error", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangeUserName />,
    );

    await fireEvent.changeText(getByPlaceholderText("My new name.."), "Alice");
    await fireEvent.press(getByText("Save name"));

    mockedIsAxiosError.mockReturnValue(false);
    const { onError } = mockMutate.mock.calls[0][1];
    await act(async () => {
      onError(new Error("Network error"));
    });

    expect(getByText("Shown to teammates and on your projects")).toBeTruthy();
  });

  it("renders LoadingDots and disables actions while mutation is pending", async () => {
    mockedUseChangeUserName.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as never);

    const { getByTestId, queryByText, getByText } = await render(
      <ChangeUserName />,
    );

    expect(getByTestId("loading-dots")).toBeTruthy();
    expect(queryByText("Save name")).toBeNull();

    await fireEvent.press(getByTestId("loading-dots"));
    await fireEvent.press(getByText("Cancel"));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
