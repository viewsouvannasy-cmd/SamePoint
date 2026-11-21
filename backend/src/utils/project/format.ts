import type {
  ProjectData,
  TaskDate,
  TotalEachState,
} from "../../types/query.js";

// maximum szie of projectData is

export function formatProjectData(
  projectData: ProjectData[],
  memberSeed: { p_id: number; avatar_seed: string }[],
  totalEachState: TotalEachState[],
  taskDate: TaskDate[],
) {
  const result: {
    p_id: number;
    project_name: string;
    describe: string;
    is_owner: boolean;
    member_seeds: string[];
    new_task: {
      count: number;
      data: TaskDate[];
    };
    in_review: {
      count: number;
      data: TaskDate[];
    };
    approved: {
      count: number;
      data: TaskDate[];
    };
  }[] = [];

  // this is use to store index of project id
  // exmaple {12: {index: 1}}
  // p_id 12  have is at index one of the arary i way help us to not loop thought the array every time
  // when use to find that id
  const exsitItem: Record<string, { index: number }> = {};
  for (const item of projectData) {
    if (!exsitItem[item.p_id]) {
      exsitItem[item.p_id] = { index: result.length };
      result.push({
        p_id: item.p_id,
        project_name: item.project_name,
        describe: item.describe,
        is_owner: item.is_owner,
        member_seeds: [],
        new_task: {
          count: 0,
          data: [],
        },
        in_review: {
          count: 0,
          data: [],
        },
        approved: {
          count: 0,
          data: [],
        },
      });
    }
  }

  // loop memberSeed to push member seed to it own project
  for (const item of memberSeed) {
    const index = exsitItem[item.p_id].index;
    result[index].member_seeds.push(item.avatar_seed);
  }

  // loop totalEachState push total to it own state of it own project
  for (const item of totalEachState) {
    const index = exsitItem[item.p_id].index;
    result[index][item.current_state].count = Number(item.count);
  }

  // loop taskData to push task to it own state of it own project
  for (const item of taskDate) {
    const index = exsitItem[item.p_id].index;
    if (item.current_state === "approved") {
      if (isThenMoreEightMinAgo(item.create_at)) {
        continue;
      }
    }

    result[index][item.current_state].data.push(item);
  }
  return result;
}

function isThenMoreEightMinAgo(time: Date) {
  const eightMinutesMs = 8 * 60 * 1000;
  return Date.now() - time.getTime() > eightMinutesMs;
}
