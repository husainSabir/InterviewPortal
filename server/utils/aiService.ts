import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to check if error is due to API limits or rate limiting
const isApiLimitError = (error: unknown): boolean => {
  if (error && typeof error === "object") {
    const err = error as any;
    // Check for rate limit errors (429) or quota exceeded errors
    if (err?.status === 429 || err?.statusCode === 429) {
      return true;
    }
    // Check for OpenAI API error types
    if (err?.error?.type === "rate_limit_error" || err?.error?.type === "insufficient_quota") {
      return true;
    }
    // Check error message for rate limit keywords
    const errorMessage = err?.message || err?.error?.message || "";
    if (
      errorMessage.toLowerCase().includes("rate limit") ||
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("limit exceeded")
    ) {
      return true;
    }
  }
  return false;
};

// Fallback function to generate generic company description
const getGenericCompanyDescription = (companyName: string): string => {
  return `${companyName} is a forward-thinking company focused on delivering innovative solutions and exceptional value to its clients. The company is committed to excellence, collaboration, and continuous improvement in all aspects of its operations.`;
};

// Fallback function to generate generic role description
const getGenericRoleDescription = (role: string, companyName?: string): string => {
  const companyContext = companyName ? ` at ${companyName}` : "";
  return `The ${role} position${companyContext} involves working on key projects and contributing to the team's success. This role requires strong technical skills, effective communication, and the ability to collaborate with cross-functional teams to achieve organizational goals.`;
};

export const generateCompanyDescription = async (
  companyName: string
): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise company descriptions. Keep descriptions short (2-3 sentences, max 150 words).",
        },
        {
          role: "user",
          content: `Generate a brief company description for ${companyName}. Include what the company does and its main focus areas.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || getGenericCompanyDescription(companyName);
  } catch (error) {
    console.error("Error generating company description:", error);

    throw error;
    
    // Return generic description if API limit is reached or any error occurs
    // if (isApiLimitError(error)) {
    //   console.warn("API limit reached, using fallback description for company");
    // } else {
    //   console.warn("API error occurred, using fallback description for company");
    // }
    
    // return getGenericCompanyDescription(companyName);
  }
};

export const generateRoleDescription = async (
  role: string,
  companyName?: string
): Promise<string> => {
  try {
    const companyContext = companyName
      ? ` for ${companyName}`
      : "";
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise job role descriptions. Keep descriptions short (2-3 sentences, max 150 words).",
        },
        {
          role: "user",
          content: `Generate a brief role description for the position of ${role}${companyContext}. Include key responsibilities and requirements.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || getGenericRoleDescription(role, companyName);
  } catch (error) {
    console.error("Error generating role description:", error);
    
    // Return generic description if API limit is reached or any error occurs
    if (isApiLimitError(error)) {
      console.warn("API limit reached, using fallback description for role");
    } else {
      console.warn("API error occurred, using fallback description for role");
    }
    
    return getGenericRoleDescription(role, companyName);
  }
};

export const generateBothDescriptions = async (
  companyName: string,
  role: string
): Promise<{ companyDescription: string; roleDescription: string }> => {
  // Both functions now have fallback logic, so they will always return a value
  // even if the API fails. We use Promise.allSettled to ensure both complete
  // even if one fails, though with our fallback logic, they shouldn't throw errors anymore.
  try {
    const [companyDescription, roleDescription] = await Promise.all([
      generateCompanyDescription(companyName),
      generateRoleDescription(role, companyName),
    ]);

    return {
      companyDescription,
      roleDescription,
    };
  } catch (error) {
    // This catch block is a safety net, but with fallback logic in individual functions,
    // we should rarely reach here. Still, provide fallback just in case.
    console.error("Unexpected error generating descriptions:", error);
    return {
      companyDescription: getGenericCompanyDescription(companyName),
      roleDescription: getGenericRoleDescription(role, companyName),
    };
  }
};

