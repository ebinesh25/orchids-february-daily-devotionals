import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export interface DevotionalDoc {
  _id: string;
  _creationTime: number;
  month: string;
  day: number;
  englishTitle: string;
  englishData: string;
  tamilTitle: string;
  tamilData: string;
  englishStorageId?: string;
  tamilStorageId?: string;
  englishAudioUrl?: string | null;
  tamilAudioUrl?: string | null;
}

// Generate an upload URL for Convex file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Upsert a devotional entry (with optional audio storageId)
export const upsertDevotional = mutation({
  args: {
    month: v.string(),
    day: v.number(),
    englishTitle: v.string(),
    englishData: v.string(),
    tamilTitle: v.string(),
    tamilData: v.string(),
    englishStorageId: v.optional(v.id("_storage")),
    tamilStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("devotionals")
      .withIndex("by_month_day", (q) =>
        q.eq("month", args.month.toLowerCase()).eq("day", args.day)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        englishTitle: args.englishTitle,
        englishData: args.englishData,
        tamilTitle: args.tamilTitle,
        tamilData: args.tamilData,
        ...(args.englishStorageId !== undefined
          ? { englishStorageId: args.englishStorageId }
          : {}),
        ...(args.tamilStorageId !== undefined
          ? { tamilStorageId: args.tamilStorageId }
          : {}),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("devotionals", {
        month: args.month.toLowerCase(),
        day: args.day,
        englishTitle: args.englishTitle,
        englishData: args.englishData,
        tamilTitle: args.tamilTitle,
        tamilData: args.tamilData,
        englishStorageId: args.englishStorageId,
        tamilStorageId: args.tamilStorageId,
      });
    }
  },
});

// Update audio storage ID for a devotional
export const updateAudioStorageId = mutation({
  args: {
    month: v.string(),
    day: v.number(),
    language: v.union(v.literal("english"), v.literal("tamil")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("devotionals")
      .withIndex("by_month_day", (q) =>
        q.eq("month", args.month.toLowerCase()).eq("day", args.day)
      )
      .unique();

    if (existing) {
      if (args.language === "english") {
        await ctx.db.patch(existing._id, { englishStorageId: args.storageId });
      } else {
        await ctx.db.patch(existing._id, { tamilStorageId: args.storageId });
      }
      return existing._id;
    }
    return null;
  },
});

// Get a single devotional with resolved audio URLs
export const getDevotional = query({
  args: {
    month: v.string(),
    day: v.number(),
  },
  handler: async (ctx, args) => {
    const devotional = await ctx.db
      .query("devotionals")
      .withIndex("by_month_day", (q) =>
        q.eq("month", args.month.toLowerCase()).eq("day", args.day)
      )
      .unique();

    if (!devotional) return null;

    const englishAudioUrl = devotional.englishStorageId
      ? await ctx.storage.getUrl(devotional.englishStorageId)
      : devotional.englishAudioUrl || null;

    const tamilAudioUrl = devotional.tamilStorageId
      ? await ctx.storage.getUrl(devotional.tamilStorageId)
      : devotional.tamilAudioUrl || null;

    return {
      ...devotional,
      englishAudioUrl,
      tamilAudioUrl,
    };
  },
});

// Get all available months
export const getAvailableMonths = query({
  args: {},
  handler: async (ctx) => {
    const devotionals = await ctx.db.query("devotionals").collect();
    const monthOrder = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const foundMonths = Array.from(new Set(devotionals.map((d) => d.month)));
    return foundMonths.sort((a, b) => {
      const idxA = monthOrder.indexOf(a);
      const idxB = monthOrder.indexOf(b);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  },
});

// Get all days for a specific month
export const getDaysForMonth = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const devotionals = await ctx.db
      .query("devotionals")
      .withIndex("by_month", (q) => q.eq("month", args.month.toLowerCase()))
      .collect();

    return devotionals.map((d) => d.day).sort((a, b) => a - b);
  },
});

// Get all devotionals for a specific month
export const getDevotionalsForMonth = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const devotionals = await ctx.db
      .query("devotionals")
      .withIndex("by_month", (q) => q.eq("month", args.month.toLowerCase()))
      .collect();

    const withUrls = await Promise.all(
      devotionals.map(async (d) => {
        const englishAudioUrl = d.englishStorageId
          ? await ctx.storage.getUrl(d.englishStorageId)
          : d.englishAudioUrl || null;

        const tamilAudioUrl = d.tamilStorageId
          ? await ctx.storage.getUrl(d.tamilStorageId)
          : d.tamilAudioUrl || null;

        return {
          ...d,
          englishAudioUrl,
          tamilAudioUrl,
        };
      })
    );

    return withUrls.sort((a, b) => a.day - b.day);
  },
});

// Get all devotionals grouped by month
export const getAllDevotionals = query({
  args: {},
  handler: async (ctx) => {
    const devotionals = await ctx.db.query("devotionals").collect();
    const withUrls = await Promise.all(
      devotionals.map(async (d) => {
        const englishAudioUrl = d.englishStorageId
          ? await ctx.storage.getUrl(d.englishStorageId)
          : d.englishAudioUrl || null;

        const tamilAudioUrl = d.tamilStorageId
          ? await ctx.storage.getUrl(d.tamilStorageId)
          : d.tamilAudioUrl || null;

        return {
          ...d,
          englishAudioUrl,
          tamilAudioUrl,
        };
      })
    );

    // Group into MonthData shape
    const result: Record<
      string,
      Record<
        string,
        {
          english: { title: string; data: string; audioUrl?: string | null };
          tamil: { title: string; data: string; audioUrl?: string | null };
        }
      >
    > = {};

    for (const d of withUrls) {
      if (!result[d.month]) {
        result[d.month] = {};
      }
      result[d.month][`day${d.day}`] = {
        english: {
          title: d.englishTitle,
          data: d.englishData,
          audioUrl: d.englishAudioUrl,
        },
        tamil: {
          title: d.tamilTitle,
          data: d.tamilData,
          audioUrl: d.tamilAudioUrl,
        },
      };
    }

    return result;
  },
});
