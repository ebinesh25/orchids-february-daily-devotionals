import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ACTIVE_WINDOW_MS = 60_000;

export const heartbeat = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    const existing = await ctx.db
      .query("readerPresence")
      .withIndex("by_client_id", (q) => q.eq("clientId", clientId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
    } else {
      await ctx.db.insert("readerPresence", { clientId, lastSeen: Date.now() });
    }
  },
});

export const activeReaders = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    const active = await ctx.db
      .query("readerPresence")
      .withIndex("by_last_seen", (q) => q.gte("lastSeen", cutoff))
      .collect();
    return active.length;
  },
});
