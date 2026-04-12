type CronJobState = {
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastRunStatus?: string;
  consecutiveErrors?: number;
  lastDelivered?: boolean;
  lastDeliveryStatus?: string;
  actionCount?: number;
  actionType?: string;
  lastActionSummary?: string;
  lastActionAtMs?: number;
  deliveredAction?: boolean;
  deliveredActions7d?: number;
  runs7d?: number;
};

type CronJobRecord = {
  state?: CronJobState;
};

export type JobActionTracking = {
  deliveredAction: boolean;
  actionType: string | null;
  actionCount: number;
  summary: string | null;
  lastActionAt: string | null;
  deliveredActions7d: number | null;
  runs7d: number | null;
};

export function getJobActionTracking(job: CronJobRecord): JobActionTracking {
  const state = job.state ?? {};
  const deliveredAction = state.deliveredAction ?? state.lastDelivered ?? false;
  const actionType = typeof state.actionType === "string" && state.actionType.trim().length > 0
    ? state.actionType.trim()
    : deliveredAction
      ? inferActionTypeFromDelivery(state.lastDeliveryStatus)
      : null;

  const actionCount = typeof state.actionCount === "number"
    ? state.actionCount
    : deliveredAction
      ? 1
      : 0;

  const summary = typeof state.lastActionSummary === "string" && state.lastActionSummary.trim().length > 0
    ? state.lastActionSummary.trim()
    : deliveredAction
      ? inferSummary(actionType, state.lastDeliveryStatus)
      : null;

  return {
    deliveredAction,
    actionType,
    actionCount,
    summary,
    lastActionAt: typeof state.lastActionAtMs === "number" ? new Date(state.lastActionAtMs).toISOString() : null,
    deliveredActions7d: typeof state.deliveredActions7d === "number" ? state.deliveredActions7d : null,
    runs7d: typeof state.runs7d === "number" ? state.runs7d : null,
  };
}

function inferActionTypeFromDelivery(lastDeliveryStatus?: string): string | null {
  if (lastDeliveryStatus === "delivered") return "message";
  return null;
}

function inferSummary(actionType: string | null, lastDeliveryStatus?: string): string | null {
  if (actionType === "message" || lastDeliveryStatus === "delivered") {
    return "Delivered a notification/message";
  }
  return null;
}
