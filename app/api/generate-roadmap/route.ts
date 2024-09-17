// app/api/generate-roadmap/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Console } from "console";
import { ApiError } from "next/dist/server/api-utils";

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
if (!genAI) {
  console.error("GOOGLE_API_KEY is not set in the environment variables");
  throw new Error("GOOGLE_API_KEY is not configured");
}

interface RoadmapItem {
  id: string;
  type: "main" | "sub" | "skill";
  label: string;
  children?: RoadmapItem[];
}

async function generateRoadmapWithGemini(
  topic: string,
): Promise<RoadmapItem[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are only authorized to generate roadmap with below format. Generate a detailed learning roadmap for ${topic}. The roadmap should be structured as a JSON array of objects, where each object represents a main topic and has the following structure: {
    "id": "unique string id",
    "type": "main",
    "label": "name of the main topic",
    "children": [
      {
        "id": "unique string id",
        "type": "sub" or "skill",
        "label": "name of the subtopic or skill",
        "children": [] (optional, for further nesting)
      }
    ]
  }
  Include 5-8 main topics, each with relevant subtopics and skills. . also arrange nodes and children into searate hierarchy.
  Ensure the structure is valid JSON`;

  const result = await model.generateContent(prompt);
  try {
    // Make the API call to generate content
    const apiResponse = await model.generateContent(prompt);
    console.log(apiResponse);

    // Ensure apiResponse and the required fields are defined
    if (
      apiResponse &&
      apiResponse.response &&
      apiResponse.response.candidates &&
      apiResponse.response.candidates[0] &&
      apiResponse.response.candidates[0].content &&
      apiResponse.response.candidates[0].content.parts &&
      apiResponse.response.candidates[0].content.parts[0]
    ) {
      // Extract JSON string from the response
      const jsonString =
        apiResponse.response.candidates[0].content.parts[0].text;

      // Remove markdown code block delimiters
      const cleanedJsonString = jsonString.replace(/```json\n|\n```/g, "");

      // Parse the cleaned JSON string
      const roadmap = JSON.parse(cleanedJsonString);

      return roadmap;
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to generate valid roadmap data");
  }
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const roadmap = await generateRoadmapWithGemini(topic);
    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 },
    );
  }
}
