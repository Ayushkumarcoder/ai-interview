// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";
// import { getCurrentUser } from "@/lib/actions/auth.action";

// export async function POST(request: Request) {
//   console.log("====================================");
//   console.log("🚀 VAPI Generate Endpoint - POST Request Started");
//   console.log("====================================");
//   console.log("⏰ Timestamp:", new Date().toISOString());
  
//   try {
//     const body = await request.json();
//     console.log("📦 Request Body Received:", JSON.stringify(body, null, 2));
    
//     const { type, role, level, techstack, amount, interviewId } = body;
//     console.log("📝 Extracted Parameters:");
//     console.log("  - type:", type);
//     console.log("  - role:", role);
//     console.log("  - level:", level);
//     console.log("  - techstack:", techstack);
//     console.log("  - amount:", amount);
//     console.log("  - interviewId:", interviewId);

//     // If a pre-created interviewId is provided, use it and do not require session.
//     // Otherwise, fallback to session-derived user.
//     let userId: string | null = null;
//     if (!interviewId) {
//       console.log("⚠️  No interviewId provided, attempting to get current user...");
//       const user = await getCurrentUser();
//       if (!user) {
//         console.error("❌ ERROR: No user session found - Unauthorized");
//         return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
//       }
//       userId = user.id;
//       console.log("✅ User authenticated from session, userId:", userId);
//     } else {
//       console.log("ℹ️  interviewId provided, will update existing interview");
//     }

//     console.log("\n🤖 Calling Gemini AI to generate interview questions...");
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `,
//     });
//     console.log("✅ AI Response Received Successfully!");
//     console.log("📄 Raw AI Output Length:", questions.length, "characters");
//     console.log("📄 Raw AI Output:", questions);

//     console.log("\n🔄 Parsing and structuring interview data...");
//     let parsedQuestions;
//     try {
//       parsedQuestions = JSON.parse(questions);
//       console.log("✅ Questions parsed successfully:", parsedQuestions.length, "questions");
//     } catch (parseError) {
//       console.error("❌ ERROR: Failed to parse AI questions as JSON");
//       console.error("Parse Error:", parseError);
//       throw parseError;
//     }

//     const techs = Array.isArray(techstack)
//       ? techstack
//       : typeof techstack === "string"
//       ? techstack.split(",").map((s) => s.trim()).filter(Boolean)
//       : [];
    
//     console.log("🔧 Processed techstack:", techs);

//     const interview = {
//       role: role,
//       type: type,
//       level: level,
//       techstack: techs,
//       questions: parsedQuestions,
//       userId: userId!,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };
    
//     console.log("\n💾 Preparing to save interview to Firestore...");
//     console.log("📊 Interview Data:", JSON.stringify(interview, null, 2));

//     if (interviewId) {
//       console.log("🔄 Updating existing interview document:", interviewId);
//       await db.collection("interviews").doc(interviewId).set(interview, { merge: true });
//       console.log("✅ Successfully updated interview document:", interviewId);
//     } else {
//       console.log("➕ Creating new interview document...");
//       const docRef = await db.collection("interviews").add(interview);
//       console.log("✅ Successfully created new interview document:", docRef.id);
//     }

//     console.log("\n🎉 SUCCESS: Interview generation completed!");
//     console.log("====================================\n");
//     return Response.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("\n❌❌❌ FATAL ERROR ❌❌❌");
//     console.error("Error Type:", (error as any)?.constructor?.name);
//     console.error("Error Message:", (error as any)?.message);
//     console.error("Full Error:", error);
//     console.error("Stack Trace:", (error as any)?.stack);
//     console.error("====================================\n");
//     return Response.json({ success: false, error: String(error) }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }



import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid, interviewId } = await request.json();

  let userId: string | null = null;
  if (!interviewId) {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }


  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userId!,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}