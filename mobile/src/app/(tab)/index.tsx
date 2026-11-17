// library
import { View, StatusBar, useColorScheme, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  clamp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

// components
import Icon from "@/components/icon/Icon";

// main components
import { Header } from "@/components/app/index/Header";
import { ProjectItem } from "@/components/app/index/project-item/ProjectItem";

// util

export interface Status {
  job: string; // work to do like Create new landing page
  name: string; // worker name
  position: string;
  time: Date;
}

export interface TestData {
  project_name: string;
  number_of_member: number;
  member_seeds: string[]; // random string 10 character
  total_tasks: number;
  completed_task: number;
  describe: string;
  "new-task": Status[];
  "in-review": Status[];
  approved: Status[];
}

const testData: TestData[] = [
  // 1. Data in every state
  {
    project_name: "Website Redesign",
    number_of_member: 4,
    member_seeds: ["aB3kP9xQ2m", "Zt7Lw4nR8c", "p0Vd6HsY1e", "Kq5Jf2uG9b"],
    total_tasks: 6,
    completed_task: 2,
    describe:
      "Redesign the company website with a new landing page and updated brand.",
    "new-task": [
      {
        job: "Create new landing page",
        name: "Alice Johnson",
        position: "Frontend Developer",
        time: new Date("2026-11-10T09:00:00Z"),
      },
      {
        job: "Write copy for pricing section",
        name: "Bob Smith",
        position: "Content Writer",
        time: new Date("2026-11-11T13:30:00Z"),
      },
    ],
    "in-review": [
      {
        job: "Design hero banner",
        name: "Carol Lee",
        position: "UI/UX Designer",
        time: new Date("2026-11-12T10:15:00Z"),
      },
      {
        job: "Set up analytics tracking",
        name: "David Kim",
        position: "Backend Developer",
        time: new Date("2026-11-13T15:45:00Z"),
      },
    ],
    approved: [
      {
        job: "Create brand color palette",
        name: "Carol Lee",
        position: "UI/UX Designer",
        time: new Date("2026-11-08T11:00:00Z"),
      },
      {
        job: "Set up project repository",
        name: "David Kim",
        position: "Backend Developer",
        time: new Date("2026-11-07T08:30:00Z"),
      },
    ],
  },

  // 2. No data in any state
  {
    project_name: "Empty Project",
    number_of_member: 2,
    member_seeds: ["mN8xT2qWz4", "Rc1YvB6hJ0"],
    total_tasks: 0,
    completed_task: 0,
    describe: "A new project with no tasks yet.",
    "new-task": [],
    "in-review": [],
    approved: [],
  },

  // 3. Only new-task and in-review, nothing approved yet
  {
    project_name: "Mobile App Launch",
    number_of_member: 5,
    member_seeds: [
      "xH4mN7qRt2",
      "Lb9WcE3vYa",
      "oP6dZ1kSjU",
      "fG8tA5yXiB",
      "nV2rQ0eMwD",
    ],
    total_tasks: 4,
    completed_task: 0,
    describe:
      "Prepare and ship the first public release of the iOS and Android app.",
    "new-task": [
      {
        job: "Design onboarding screens",
        name: "Emma Wilson",
        position: "UI/UX Designer",
        time: new Date("2026-11-14T09:30:00Z"),
      },
      {
        job: "Implement push notifications",
        name: "Frank Chen",
        position: "Mobile Developer",
        time: new Date("2026-11-14T14:00:00Z"),
      },
      {
        job: "Prepare App Store listing",
        name: "Grace Park",
        position: "Product Manager",
        time: new Date("2026-11-15T10:00:00Z"),
      },
    ],
    "in-review": [
      {
        job: "Build login and signup flow",
        name: "Frank Chen",
        position: "Mobile Developer",
        time: new Date("2026-11-13T16:20:00Z"),
      },
    ],
    approved: [],
  },

  // 4. new-task empty, in-review and approved filled
  {
    project_name: "Marketing Campaign Q4",
    number_of_member: 3,
    member_seeds: ["hC7uJ3bKzT", "Yw1sL9pOaE", "qR4gF6nXdM"],
    total_tasks: 5,
    completed_task: 3,
    describe:
      "Plan and run the end-of-year marketing campaign across email and social.",
    "new-task": [],
    "in-review": [
      {
        job: "Final review of email sequence",
        name: "Henry Adams",
        position: "Marketing Manager",
        time: new Date("2026-11-15T08:45:00Z"),
      },
      {
        job: "Social media calendar for December",
        name: "Isabel Torres",
        position: "Social Media Specialist",
        time: new Date("2026-11-15T12:10:00Z"),
      },
    ],
    approved: [
      {
        job: "Campaign strategy document",
        name: "Henry Adams",
        position: "Marketing Manager",
        time: new Date("2026-11-03T09:00:00Z"),
      },
      {
        job: "Design Black Friday banners",
        name: "Jack Nguyen",
        position: "Graphic Designer",
        time: new Date("2026-11-06T13:15:00Z"),
      },
      {
        job: "Set up ad accounts and budget",
        name: "Isabel Torres",
        position: "Social Media Specialist",
        time: new Date("2026-11-05T10:30:00Z"),
      },
    ],
  },

  // 5. Everything approved (fully completed)
  {
    project_name: "Internal Dashboard",
    number_of_member: 3,
    member_seeds: ["tN5vB8cHkW", "eZ2aU7mQjP", "iD0xS3yLrG"],
    total_tasks: 3,
    completed_task: 3,
    describe:
      "Internal analytics dashboard for the operations team. Project is complete.",
    "new-task": [],
    "in-review": [],
    approved: [
      {
        job: "Build charts for weekly metrics",
        name: "Karen Brooks",
        position: "Frontend Developer",
        time: new Date("2026-10-28T11:00:00Z"),
      },
      {
        job: "Create data export endpoint",
        name: "Liam O'Connor",
        position: "Backend Developer",
        time: new Date("2026-10-30T15:00:00Z"),
      },
      {
        job: "Write user documentation",
        name: "Mia Rossi",
        position: "Technical Writer",
        time: new Date("2026-11-02T09:45:00Z"),
      },
    ],
  },

  // 6. Larger project, mostly new tasks
  {
    project_name: "API Migration",
    number_of_member: 6,
    member_seeds: [
      "kM6wT1hVbA",
      "Pj9cE4nZuR",
      "sX3qY8dFgL",
      "bU7oK2vWtH",
      "cA5iN0zJmQ",
      "rL1eD6xGpS",
    ],
    total_tasks: 6,
    completed_task: 1,
    describe:
      "Migrate the legacy REST API to a new GraphQL gateway with zero downtime.",
    "new-task": [
      {
        job: "Define GraphQL schema",
        name: "Noah Fischer",
        position: "Backend Developer",
        time: new Date("2026-11-16T08:00:00Z"),
      },
      {
        job: "Write migration scripts for user data",
        name: "Olivia Martin",
        position: "Database Engineer",
        time: new Date("2026-11-16T09:30:00Z"),
      },
      {
        job: "Plan rollout and rollback strategy",
        name: "Paul Dubois",
        position: "DevOps Engineer",
        time: new Date("2026-11-16T11:00:00Z"),
      },
    ],
    "in-review": [
      {
        job: "Add authentication middleware",
        name: "Noah Fischer",
        position: "Backend Developer",
        time: new Date("2026-11-14T17:00:00Z"),
      },
      {
        job: "Load testing for new gateway",
        name: "Quinn Walker",
        position: "QA Engineer",
        time: new Date("2026-11-15T14:30:00Z"),
      },
    ],
    approved: [
      {
        job: "Audit existing REST endpoints",
        name: "Rachel Green",
        position: "Tech Lead",
        time: new Date("2026-11-09T10:00:00Z"),
      },
    ],
  },
];

function Project() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const searchHight = 60;

  const translateY = useSharedValue(0);
  const lastY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = Math.max(0, e.contentOffset.y);
      const diff = y - lastY.value;
      translateY.value = clamp(translateY.value - diff, -searchHight, 0);
      lastY.value = y;
    },
  });

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 + translateY.value / searchHight,
  }));

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingLeft: insets.left,
      }}
      className="bg-background flex-1"
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header />

      <View className="mt-3 flex-1 overflow-hidden px-4">
        <Animated.View
          className="bg-background px-4 pt-0.75"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              height: searchHight,
            },
            searchStyle,
          ]}
        >
          <View className="justify-center">
            <View className="absolute z-100 h-10 w-10 items-center justify-center pl-2">
              <Icon
                name="search"
                size={20}
                strokeWidth={4}
                color="rgb(120,120,120)"
              />
            </View>
            <TextInput
              className="bg-background-muted rounded-full border border-transparent p-3.5 pl-11 focus:border-blue-500"
              placeholderTextColor="rgb(120,120,120)"
              placeholder="Search..."
            />
          </View>
        </Animated.View>

        <Animated.FlatList
          data={testData}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-5 grow pt-[61px]"
          ListFooterComponent={<View className="mb-40"></View>}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => <ProjectItem item={item} />}
          scrollEventThrottle={16}
          onScroll={onScroll}
        />
      </View>
    </View>
  );
}

export default Project;
