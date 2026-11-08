import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  devotionals: defineTable({
    month: v.string(), // "feb", "mar", "apr", "may", "jun", "jul", "aug"
    day: v.number(),   // 1, 2, 3...
    englishTitle: v.string(),
    englishData: v.string(),
    tamilTitle: v.string(),
    tamilData: v.string(),
    englishStorageId: v.optional(v.id("_storage")),
    tamilStorageId: v.optional(v.id("_storage")),
    englishAudioUrl: v.optional(v.string()),
    tamilAudioUrl: v.optional(v.string()),
  })
    .index("by_month_day", ["month", "day"])
    .index("by_month", ["month"]),
  readerPresence: defineTable({
    clientId: v.string(),
    lastSeen: v.number(),
  })
    .index("by_client_id", ["clientId"])
    .index("by_last_seen", ["lastSeen"]),
});
