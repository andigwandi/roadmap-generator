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
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a structured learning roadmap for ${topic} following the style of Roadmap.sh. The roadmap should be structured as a JSON array of objects, where each object represents a major learning path and follows this structure:

{
  "id": "unique_string_id",
  "type": "main",
  "label": "Major Topic/Concept",
  "children": [
    {
      "id": "unique_string_id",
      "type": "sub",
      "label": "Subtopic or Category",
      "children": [
        {
          "id": "unique_string_id",
          "type": "skill",
          "label": "Specific Skill or Technology"
        }
      ]
    }
  ]
}

Requirements:
1. Include 4-6 major learning paths
2. Each major path should have 3-5 relevant subtopics
3. Each subtopic should have 2-4 specific skills or technologies
4. Use clear, concise labels
5. Order topics from fundamental/prerequisite knowledge to advanced concepts
6. Include both theoretical concepts and practical skills
7. Ensure progressive difficulty levels
8. Make relationships between topics clear and logical

The response must be valid JSON that can be parsed. Do not include any explanatory text, only the JSON array.`;

  const result = await model.generateContent(prompt);
  try {
    // Make the API call to generate content
    const apiResponse = await model.generateContent(prompt);
    console.log(apiResponse.response);

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
