type TaskState = "new-task" | "in-review" | "approved";
interface ColorStatus {
  bg: string;
  border: string;
}

const COLOR_STATUS: Record<TaskState, ColorStatus> = {
  "new-task": {
    bg: "bg-background-secondary",
    border: "border-border-muted",
  },
  "in-review": {
    bg: "bg-background-warming",
    border: "border-border-warming",
  },
  approved: {
    bg: "bg-background-approve",
    border: "border-border-approve",
  },
};

export function getIconStatus(state: TaskState): "add" | "report" | "check" {
  if (state === "new-task") {
    return "add";
  }

  if (state === "in-review") {
    return "report";
  }

  return "check";
}

export function getColorStatus(state: TaskState): ColorStatus {
  return COLOR_STATUS[state];
}
