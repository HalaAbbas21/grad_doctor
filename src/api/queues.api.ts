import { apiClient } from "./client";
import { unwrapList, type RawPaginatedList } from "./pagination";
import { mapQueueItem } from "./mappers/queue.mapper";
import type { RawQueueItem } from "./types/raw";
import type { Department } from "@/constants/departments";

/** GET /queues?department=&perPage= — the department filter is confirmed (part of the verified sample request), unlike appointments' assumed ?department=. */
export async function listQueues(department: Department, perPage = 20) {
  const res = await apiClient.get<RawPaginatedList<RawQueueItem>>("/queues", {
    params: { department, perPage },
  });
  return unwrapList(res.data, mapQueueItem);
}
