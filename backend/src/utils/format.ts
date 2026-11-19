import { ProjectData, TaskDate } from "../types/query.js";

export function formatProjectData(
  projectData: ProjectData[],
  taskDate: TaskDate[],
) {
  const result: {
    p_id: number;
    project_name: string;
    describe: string;
    is_owner: boolean;
    member_seeds: string[];
    new_task: TaskDate[];
    in_review: TaskDate[];
    approved: TaskDate[];
  }[] = [];

  // this is use to store index of project id
  // exmaple {12: {index: 1}}
  // p_id 12  have is at index one of the arary i way help us to not loop thought the array every time
  // when use to find that id
  const exsitItem: Record<string, { index: number }> = {};

  for (const item of projectData) {
    if (!exsitItem[item.p_id]) {
      const index = result.length;
      exsitItem[item.p_id] = { index };
      result.push({
        p_id: item.p_id,
        project_name: item.project_name,
        describe: item.describe,
        is_owner: item.is_owner,
        member_seeds: [item.avatar_seed],
        new_task: [],
        in_review: [],
        approved: [],
      });
    } else {
      const index = exsitItem[item.p_id].index;
      result[index].member_seeds.push(item.avatar_seed);
    }
  }

  //   to each task to it own state
  for (const item of taskDate) {
    const index = exsitItem[item.p_id].index;
    result[index][item.current_state].push(item);
  }

  return result;
}
