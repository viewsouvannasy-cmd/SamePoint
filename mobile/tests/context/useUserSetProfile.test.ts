import { useUserSetProfile } from "./../../src/context/useUserSetProfile";

describe("useUserSetProfile", () => {
  beforeEach(() => {
    useUserSetProfile.setState({
      data: { name: "", avatar: "pixel-dog", bg: "#E3E3E3" },
    });
  });

  test("it have correct default value", () => {
    const data = useUserSetProfile.getState().data;
    expect(data.name).toBe("");
    expect(data.avatar).toBe("pixel-dog");
    expect(data.bg).toBe("#E3E3E3");
  });

  test("change the name", () => {
    useUserSetProfile.getState().setDataForm("name", "view");
    expect(useUserSetProfile.getState().data.name).toBe("view");
  });

  test("change the avatar", () => {
    useUserSetProfile.getState().setDataForm("avatar", "pixel-cat");
    expect(useUserSetProfile.getState().data.avatar).toBe("pixel-cat");
  });

  test("change the bg", () => {
    useUserSetProfile.getState().setDataForm("bg", "#000000");
    expect(useUserSetProfile.getState().data.bg).toBe("#000000");
  });
});
