import { WorkspaceWithUsers } from "@/lib/types";

// Workspace clicks usage overage checks
export const throwIfClicksUsageExceeded = (workspace: WorkspaceWithUsers) => {
  // LIMIT Clicks is disabled for now
  // We get the default limit values from the Prisma workspace schema.
  // if (workspace.usage > workspace.usageLimit) {
  //   throw new DubApiError({
  //     code: "forbidden",
  //     message: exceededLimitError({
  //       plan: workspace.plan,
  //       limit: workspace.usageLimit,
  //       type: "clicks",
  //     }),
  //   });
  // }
};

// Workspace links usage overage checks
export const throwIfLinksUsageExceeded = (workspace: WorkspaceWithUsers) => {
  // LIMIT Links is disabled for now
  // We get the default limit values from the Prisma workspace schema.
  // if (
  //   workspace.linksUsage >= workspace.linksLimit &&
  //   (workspace.plan === "free" || workspace.plan === "pro")
  // ) {
  //   throw new DubApiError({
  //     code: "forbidden",
  //     message: exceededLimitError({
  //       plan: workspace.plan,
  //       limit: workspace.linksLimit,
  //       type: "links",
  //     }),
  //   });
  // }
};
