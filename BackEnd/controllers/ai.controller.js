const Joi=require('joi');
const axios=require('axios');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE,LANGUAGE_MAP } = require('../utils/constants');
const Groq= require('groq-sdk');
const aiSession=require('../models/AISession');
const submission=require('../models/submission');
const { extractJSON } = require('../utils/helper');

const DSA_SYSTEM_PROMPT = `You are a friendly and knowledgeable DSA (Data Structures & Algorithms) mentor.

SCOPE:
- Primarily help with DSA topics: arrays, linked lists, stacks, queues, trees, graphs, recursion, dynamic programming, greedy, backtracking, sorting, searching, etc.
- You may respond casually to greetings or small talk (e.g., "hi", "hello", "how are you").
- If a question is clearly NOT related to DSA, politely decline with:
  "I'm mainly here to help with DSA-related questions. Try asking something about data structures or algorithms 🙂"

LANGUAGE SUPPORT:
- Use the programming language specified by the user (C++, Java, Python, JavaScript, C).
- If no language is specified, default to C++.

RESPONSE STYLE:
- Do NOT directly give full working solutions unless the user explicitly asks for it after multiple hints.

Follow this teaching flow:
1. Understand & Restate  
   - Briefly restate the problem in simple words.

2. Guide with Questions  
   - Ask 1–2 helpful questions to push their thinking.

3. Hint the Approach  
   - Suggest patterns like two pointers, sliding window, recursion, DP, BFS/DFS, etc.

4. Light Structure (if needed)  
   - Provide pseudocode or a skeleton (not full implementation).

5. Complexity Awareness  
   - Encourage thinking about time and space complexity.

6. Encourage  
   - End with a motivating line (keep it natural, not forced).

FLEXIBILITY:
- If the user is completely stuck or explicitly says "give me the solution", you may provide a full solution with explanation.
- Adjust depth based on user level (beginner → more guidance, advanced → concise hints).

TONE:
- Friendly, supportive, and slightly conversational.
- Avoid sounding robotic or overly strict.`;


const CODE_ANALYSIS_PROMPT = `You are an expert code analyst specializing in algorithmic complexity and code quality.

TASK:
Analyze the provided code and return a structured JSON response ONLY. No extra text, no markdown, no explanation outside the JSON.

ANALYSIS RULES:
- Derive Big-O time complexity by identifying loops, recursion depth, and nested operations
- Derive Big-O space complexity by identifying auxiliary data structures, call stack usage, and allocations
- Be precise: distinguish between best, average, and worst case where they differ significantly
- Code suggestions must be actionable, specific to the given code — not generic advice
- If the code has no improvable issues, say so honestly in suggestions

RESPONSE FORMAT — Return ONLY this JSON structure, nothing else:
{
  "time_complexity": {
    "value": "O(...)",
    "best_case": "O(...)",
    "average_case": "O(...)",
    "worst_case": "O(...)",
    "description": "Plain English explanation of why this complexity arises from the code structure"
  },
  "space_complexity": {
    "value": "O(...)",
    "includes_call_stack": true or false,
    "description": "Plain English explanation of memory usage, auxiliary structures, and recursion stack if any"
  },
  "code_suggestions": 
    {
      "issue": "Short title of the problem",
      "explanation": "Why this is a concern or inefficiency",
      "suggestion": "Concrete fix or alternative approach",
      "impact": "time" or "space" or "readability" or "both"
    }
,
  "overall_rating": {
    "score": 1–10,
    "summary": "One-line verdict on the code's efficiency and quality"
  }
}

STRICT RULES:
- Output ONLY valid JSON — no prose before or after
- Do NOT add markdown code fences around the JSON
- Do NOT invent complexities — if ambiguous, state it clearly in the description field
- Language of the code does not matter — analyze logic, not syntax`


const groq = new Groq({
  apiKey:process.env.GROK_API_KEY,
});

async function chatResponse(req, res) {
  const codeSchema = Joi.object({
    prompt: Joi.string().required(),
  });

  try {

    const { error, value } = codeSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(
        res,
        error.details,
        "Validation error",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const { prompt} = value;


    const grokResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: DSA_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    

    const reply = grokResponse.choices[0].message.content.trim();

    console.log("Grok API Response:", reply);

    if (!reply) {
      return sendErrorResponse(
        res,
        {},
        "No response from Grok API",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }

    return sendSuccessResponse(res, reply , "Mentoring response generated successfully", STATUS_CODE.SUCCESS);

  } catch (err) {
    console.log(err)
    return sendErrorResponse(
      res,
      {},
      `Error Generating Code: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function analyzeCode(req, res) {
  const codeSchema = Joi.object({
    submission_id: Joi.string().hex().required(),
  });

  try {

    const { error, value } = codeSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(
        res,
        error.details,
        "Validation error",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const { submission_id } = value;


    const existingAnalysis = await aiSession.findOne({ submission_id });

    if (existingAnalysis) {
      return sendSuccessResponse(res, existingAnalysis, "Existing analysis retrieved", STATUS_CODE.SUCCESS);
    }


    const required_submission = await submission.findById(submission_id);

    if (!required_submission) {
      return sendErrorResponse(
        res,
        {},
        "Submission not found",
        STATUS_CODE.NOT_FOUND
      );
    }

    const { code, language_id } = required_submission;

    if (!code || !language_id) {
      return sendErrorResponse(
        res,
        {},
        "Submission is missing code or language fields",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const language = LANGUAGE_MAP[language_id];



    const grokResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
          { role: "system", content: CODE_ANALYSIS_PROMPT },
          {
            role: "user",
            content: `Language: ${language}\n\nCode to analyze:\n${code}`,
          },
        ],
      max_tokens: 500,
    });

    
    

    const rawReply = grokResponse.choices[0].message.content;

  

    if (!rawReply) {
      return sendErrorResponse(
        res,
        {},
        "No response from Grok API",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }


    let analysisResult;
    try {
      analysisResult = extractJSON(rawReply);
    } catch (parseErr) {
      console.log("Error parsing Grok response as JSON:", parseErr);
      return sendErrorResponse(
        res,
        { raw: rawReply },
        "Grok returned malformed JSON. Try again.",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
    


    const aiSessionData = await aiSession.create({
      submission_id,
      user_id:req.user.id,
      time_complexity: analysisResult.time_complexity,
      space_complexity: analysisResult.space_complexity,
      code_suggestions: analysisResult.code_suggestions,
      overall_rating: analysisResult.overall_rating
    });

    return sendSuccessResponse(res, aiSessionData, "Code analyzed successfully", STATUS_CODE.SUCCESS);

  } catch (err) {
    console.log(err);
    return sendErrorResponse(
      res,
      {},
      `Error Analyzing Code: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

const PROBLEM_GENERATION_PROMPT = `You are an expert competitive programming problem setter with years of experience creating high-quality DSA problems for coding platforms like LeetCode, Codeforces, and HackerRank.

TASK:
Given a brief problem idea or description from an admin, generate a COMPLETE, well-structured coding problem with test cases. Make it feel like a real, professionally written problem — not AI-generated.

WRITING STYLE:
- Write the problem description in clear, concise English like a human educator would
- Use natural language, vary sentence structure, avoid repetitive patterns
- Include a relatable context or story when appropriate (e.g., "Alice has an array..." or "You are given a grid representing a city map...")
- Be specific about input/output format
- Add 2-3 examples with clear explanations

OUTPUT FORMAT — Return ONLY this JSON structure, nothing else:
{
  "title": "Problem Title",
  "description_md": "Full problem description in Markdown. Include:\\n- Problem statement\\n- Input format\\n- Output format\\n- Examples with explanation\\n\\nMake it detailed and clear.",
  "difficulty": "Easy" or "Medium" or "Hard",
  "tags": ["tag1", "tag2"],
  "supported_languages": ["cpp", "java", "python", "js"],
  "constraints": {
    "time_limit_ms": 2000,
    "memory_limit_kb": 128000,
    "details": ["1 <= N <= 10^5", "1 <= arr[i] <= 10^9"]
  },
  "test_cases": [
    { "input": "exact stdin input", "expected_output": "exact stdout output", "isHidden": false },
    { "input": "...", "expected_output": "...", "isHidden": false },
    { "input": "edge case input", "expected_output": "...", "isHidden": true },
    { "input": "large input scenario", "expected_output": "...", "isHidden": true }
  ],
  "hints": ["Hint 1 for students", "Hint 2 if needed"]
}

RULES:
- Generate at least 4-6 test cases (2-3 visible, rest hidden)
- Include edge cases (empty input, single element, max constraints)
- Test case inputs/outputs must be EXACT strings that a program would read from stdin / write to stdout
- The difficulty should match the complexity of the problem
- Output ONLY valid JSON — no prose, no markdown fences
- Make the description_md rich with examples formatted nicely in markdown
- Constraints should be realistic for the difficulty level`;


async function generateProblem(req, res) {
  const schema = Joi.object({
    description: Joi.string().min(10).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  });

  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const { description, difficulty } = value;

    const userPrompt = difficulty
      ? `Generate a ${difficulty} difficulty coding problem based on this idea:\n\n${description}`
      : `Generate a coding problem based on this idea:\n\n${description}`;

    const grokResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROBLEM_GENERATION_PROMPT },
        { role: "user", content: userPrompt + "\n\nIMPORTANT: Return ONLY raw JSON. No markdown, no code fences, no explanation." },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawReply = grokResponse.choices[0].message.content;

    if (!rawReply) {
      return sendErrorResponse(res, {}, "No response from AI", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }

    let problemData;
    try {
      problemData = extractJSON(rawReply);
    } catch (parseErr) {
      console.log("Error parsing AI response as JSON:", parseErr);
      return sendErrorResponse(
        res,
        { raw: rawReply },
        "AI returned malformed JSON. Try again.",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }

    return sendSuccessResponse(res, problemData, "Problem generated successfully", STATUS_CODE.SUCCESS);

  } catch (err) {
    console.log(err);
    return sendErrorResponse(
      res,
      {},
      `Error generating problem: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports={
    chatResponse,
    analyzeCode,
    generateProblem
}