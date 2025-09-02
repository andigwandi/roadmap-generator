import { mutation, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

interface RoadmapItem {
    id: string;
    type: "main" | "sub" | "skill";
    label: string;
    children?: RoadmapItem[];
}

export const addItem = mutation({
    args: {
        topic: v.string(),
        apiResponse: v.string(),
    },
    handler: async (ctx, args) => {
        // Parse the JSON string to ensure it's valid
        const parsedResponse = JSON.parse(args.apiResponse);
        
        // Store the roadmap request in the database
        await ctx.db.insert("roadmapRequests", {
            topic: args.topic,
            apiResponse: parsedResponse, // Store the parsed JSON object
            createdAt: new Date().getTime(), // Store as milliseconds timestamp
        });
    }
});

async function trackChange(ctx: MutationCtx, type: "addItem" | "removeItem") {
    await ctx.db.insert("changes", { type });
}