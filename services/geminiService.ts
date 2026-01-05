import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const callGemini = async (contents: string | { parts: any[] }, responseSchema: any, model: string = 'gemini-2.5-flash') => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      let feedbackMessage = "The API returned an empty response.";
      if (response.promptFeedback?.blockReason) {
          feedbackMessage = `Request was blocked. Reason: ${response.promptFeedback.blockReason}.`;
          if (response.promptFeedback.blockReasonMessage) {
              feedbackMessage += ` ${response.promptFeedback.blockReasonMessage}`;
          }
      } else if (response.promptFeedback) {
          feedbackMessage += " This may be due to content safety filters. Please adjust your input and try again.";
      }
      throw new Error(feedbackMessage);
    }
    
    // The JSON from Gemini can sometimes be wrapped in ```json ... ``` which needs to be cleaned.
    const cleanedJsonText = response.text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    
    if (!cleanedJsonText) {
      throw new Error("The API returned an empty response after cleaning. This might be due to content safety filters.");
    }
    
    try {
      return JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini API. Raw text:", cleanedJsonText, "Original response:", response.text);
      throw new Error("The API returned a response, but it was not in a valid JSON format.");
    }
    
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    if (error instanceof Error) {
      // Clean up the error message from the SDK which might contain prefixes like "[GoogleGenerativeAI Error]:"
      const cleanMessage = error.message.replace(/\[.*?\]:\s*/, '');
      throw new Error(cleanMessage);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export interface KeywordWithMetadata {
  keyword: string;
  searchVolume: string;
  trendingRank: number;
  userIntent: string;
  competition: string;
  cpc: string;
  density?: number;
  strategicInsight?: string;
}

const keywordWithMetadataSchema = {
    type: Type.OBJECT,
    properties: {
        keyword: { type: Type.STRING, description: 'The suggested keyword, tag, or hashtag.' },
        searchVolume: { type: Type.STRING, description: 'Estimated search volume as "High", "Medium", or "Low".' },
        trendingRank: { type: Type.NUMBER, description: 'A rank from 1 to 10 indicating recent trendiness, with 1 being the most actively trending keyword based on recent search data analysis, akin to Google Trends.' },
        userIntent: { type: Type.STRING, description: 'The likely user intent behind the keyword, categorized as "Informational", "Navigational", "Commercial", or "Transactional". For local SEO, this can also be "Local Transactional" or "Local Informational".' },
        competition: { type: Type.STRING, description: 'Estimated competition level for ranking on this keyword, categorized as "High", "Medium", or "Low".' },
        cpc: { type: Type.STRING, description: 'An estimated Cost-Per-Click (CPC) range for advertising on this keyword, e.g., "$0.50 - $2.00".' },
        strategicInsight: { type: Type.STRING, description: 'A brief, actionable insight explaining why this keyword is valuable, especially in relation to the provided competitors. For example: "High opportunity, as your content covers this but competitors do not." or "Competitors rank for this, but your page content suggests you can provide more depth."' },
    },
    required: ['keyword', 'searchVolume', 'trendingRank', 'userIntent', 'competition', 'cpc'],
};

// 1. Website SEO
const seoSchema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: keywordWithMetadataSchema,
      description: "A comprehensive list of 20-30 SEO keywords, including head, body, and long-tail terms."
    },
  },
};

export const generateSeoKeywords = async (text: string, language: string, type: 'description' | 'content' = 'description', competitors?: string): Promise<{ keywords: KeywordWithMetadata[] }> => {
  let prompt;
  if (competitors && competitors.trim()) {
    const competitiveSchemaDescription = `For each keyword, you MUST provide:
    1.  **Keyword:** The keyword itself.
    2.  **Search Volume:** Estimated as "High", "Medium", or "Low".
    3.  **Trending Rank:** A score from 1 to 10, where 1 indicates a keyword with the highest recent growth in search interest, similar to a "breakout" topic on Google Trends.
    4.  **User Intent:** Classify the user's goal as "Informational", "Navigational", "Commercial", or "Transactional".
    5.  **Competition:** The estimated difficulty to rank organically for this keyword, rated as "High", "Medium", or "Low".
    6.  **CPC:** An estimated Cost-Per-Click (CPC) range for Google Ads, e.g., "$0.50 - $2.00".
    7.  **Strategic Insight:** A crucial, brief analysis (1-2 sentences) explaining the strategic value of this keyword in the competitive landscape. Examples: "High opportunity gap, none of the competitors are targeting this.", "Your content provides a better answer for this than competitors.", "A foundational keyword your top competitor ranks for, you must also target it."`;

    prompt = `You are a world-class senior SEO strategist specializing in competitive analysis, aiming for 100% accuracy and relevance in your strategic recommendations.

    Your task is to analyze my business/content, compare it against my competitors, and generate a highly strategic list of 20-30 SEO keywords. Your analysis must remain strictly focused on the core topic provided.

    **My Content/Business:**
    "${text}"

    **My Competitors:**
    "${competitors}"

    **CRITICAL ANALYSIS INSTRUCTION:**
    - If my business is described as an IIT/JEE coaching institute (e.g., from an input like "mentorsedu.com"), all keyword analysis and suggestions must revolve around engineering/medical entrance exams in that context.
    - **DO NOT** deviate to unrelated topics like UPSC, banking exams, or study abroad programs unless the provided business description explicitly includes them. Your competitive analysis should focus on how to outperform the given competitors in the specified niche.

    Based on this focused comparison, generate the list of keywords.
    ${competitiveSchemaDescription}
    
    **CRITICAL OUTPUT INSTRUCTIONS:**
    - All keywords must be real, actionable, and timely.
    - If a topic is current, ensure keywords reflect the current year (e.g., 'JEE Mains 2025 syllabus').
    - Do not generate sample or placeholder keywords.
    - Identify keyword gaps, overlaps, and opportunities where my content has an edge within the defined niche.

    The final output must be in ${language}.`;
  } else {
    const contentToAnalyze = type === 'content'
        ? `the following website content:\n\n---\n\n"${text}"\n\n---`
        : `the following business description, brand name, or URL: "${text}"`;

    prompt = `You are a world-class senior SEO analyst with deep expertise in keyword research for specific business niches. Your analysis must be 100% accurate and strictly relevant to the provided content.
  
    Your task is to analyze ${contentToAnalyze} and generate a comprehensive list of 20-30 highly relevant, real-world SEO keywords.
    
    **CRITICAL ANALYSIS INSTRUCTION:**
    - If the input is a URL (e.g., "mentorsedu.com"), analyze the name to infer the primary business. For "mentorsedu.com", the focus should be on "mentors" and "edu" (education), likely related to coaching for competitive exams like IIT-JEE & NEET in India.
    - **DO NOT** generate keywords for unrelated topics. For an educational institute focused on specific exams (like IIT/JEE, NEET), do not suggest keywords for other exams (like UPSC) or unrelated services (like study abroad), unless the provided text explicitly mentions them. Your focus must be laser-sharp on the core topic.
    
    For each keyword, provide:
    1.  **Keyword:** The keyword itself.
    2.  **Search Volume:** Estimated as "High", "Medium", or "Low".
    3.  **Trending Rank:** A score from 1 to 10, where 1 indicates a keyword with the highest recent growth in search interest, similar to a "breakout" topic on Google Trends.
    4.  **User Intent:** Classify the user's goal as "Informational", "Navigational", "Commercial", or "Transactional".
    5.  **Competition:** The estimated difficulty to rank organically for this keyword, rated as "High", "Medium", or "Low".
    6.  **CPC:** An estimated Cost-Per-Click (CPC) range for Google Ads, e.g., "$0.50 - $2.00".
    
    **CRITICAL OUTPUT INSTRUCTIONS:**
    - All keywords must be real, actionable, and timely.
    - If a topic is current, ensure keywords reflect the current year (e.g., 'JEE Advanced 2025').
    - Do not generate sample or placeholder keywords.
    - Ensure you provide a diverse mix of head, body, and long-tail keywords.

    The final output must be in ${language}.`;
  }
  return callGemini(prompt, seoSchema);
};

// 1.1 Meta Descriptions
const metaDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        metaDescriptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3 unique, compelling, and SEO-optimized meta description suggestions, each under 160 characters."
        },
    },
};

export const generateMetaDescription = async (text: string, language: string, type: 'description' | 'content' = 'description', competitors?: string): Promise<{ metaDescriptions: string[] }> => {
    const promptIntro = type === 'description'
        ? `For the following business or content description, generate 3 unique and compelling meta descriptions.`
        : `Based on the following website content, generate 3 unique and compelling meta descriptions that accurately summarize the page.`;

    let prompt;
    if (competitors && competitors.trim()) {
        prompt = `You are an expert SEO copywriter specializing in creating high-converting meta descriptions that stand out from the competition. Your goal is 100% accuracy in reflecting the brand's unique value.

        Analyze my content and my competitors' potential positioning to write 3 unique meta descriptions. Each must be a single sentence, strictly under 160 characters, and highlight a unique selling proposition that differentiates my content from theirs. Include a subtle call-to-action.

        My Content: "${text}"
        Competitors: "${competitors}"
        
        The final output must be in ${language}.`;
    } else {
        prompt = `You are an expert SEO copywriter. ${promptIntro} Each description must be a single sentence, strictly under 160 characters, and should aim to include a subtle call-to-action (like "Learn more," "Explore now," or "Shop today").
    
        Content: "${text}"
        
        The final output must be in ${language}.`;
    }
    return callGemini(prompt, metaDescriptionSchema);
};

// 1.2 Schema Markup
const schemaMarkupSchema = {
    type: Type.OBJECT,
    properties: {
        schemaType: { type: Type.STRING, description: "The identified schema.org type, e.g., 'LocalBusiness', 'Article', 'Product'." },
        jsonLd: { type: Type.STRING, description: "The complete and valid JSON-LD schema markup as a JSON string." },
    },
    required: ['schemaType', 'jsonLd'],
};

export const generateSchemaMarkup = async (text: string, language: string, type: 'description' | 'content' = 'description', competitors?: string): Promise<{ schemaType: string, jsonLd: string }> => {
    const promptIntro = type === 'description'
    ? `For the following business or content description, generate the most appropriate and detailed JSON-LD schema markup.`
    : `Based on the full text content of the webpage provided below, generate the most appropriate and detailed JSON-LD schema markup.`;
    
    let prompt;
    if (competitors && competitors.trim()) {
        prompt = `You are a technical SEO specialist focused on 100% accurate and strategically superior structured data.
        
        Analyze my business description and my competitors'. Based on this, identify the most powerful schema.org type to give me a competitive edge (e.g., more specific types like 'MedicalBusiness' instead of 'LocalBusiness'). Generate complete and valid JSON-LD markup. Your output must be more detailed and comprehensive than what my competitors are likely using. Fill in as much information as possible from the content, using placeholders only when necessary.

        My Content: "${text}"
        Competitors: "${competitors}"

        Your response must be a valid JSON object containing the schema type and the JSON-LD as a string. The text within the JSON-LD should be in ${language}.`;
    } else {
        prompt = `You are a technical SEO specialist. ${promptIntro}
        
        1.  First, identify the best schema.org type (e.g., LocalBusiness, Organization, Article, Product, etc.).
        2.  Then, generate the complete JSON-LD markup. Populate it with as much relevant information as you can infer from the content. Use placeholder values like "[Your Name]" or "[Your Address]" for any information you cannot infer.
        
        Content: "${text}"
        
        Your response must be a valid JSON object containing the schema type and the JSON-LD as a string. The text within the JSON-LD should be in ${language}.`;
    }
    return callGemini(prompt, schemaMarkupSchema);
};


// 1.3 Content Brief & SERP Analysis
export interface ContentBrief {
  searchIntent: string;
  suggestedTitle: string;
  metaDescription: string;
  serpAnalysis: string;
  keyTopics: string[];
  questionsToAnswer: string[];
  suggestedOutline: { heading: string; children: { heading: string }[] }[];
  targetWordCount: string;
  linkingSuggestions: string;
}

const outlineItemSchema = {
    type: Type.OBJECT,
    properties: {
        heading: { type: Type.STRING },
        children: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    heading: { type: Type.STRING }
                },
                required: ['heading']
            }
        }
    },
    required: ['heading', 'children']
};

const contentBriefSchema = {
    type: Type.OBJECT,
    properties: {
        searchIntent: { type: Type.STRING, description: 'The likely user intent (e.g., "Informational", "Commercial").' },
        suggestedTitle: { type: Type.STRING, description: 'An SEO-optimized title for the content, under 60 characters.' },
        metaDescription: { type: Type.STRING, description: 'A compelling meta description, under 160 characters.' },
        serpAnalysis: { type: Type.STRING, description: 'A brief summary of the top 10 search results, including content types (e.g., "listicles, guides") and common themes.' },
        keyTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of essential semantic keywords and sub-topics to cover.' },
        questionsToAnswer: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of common user questions to answer, inspired by "People Also Ask".' },
        suggestedOutline: { type: Type.ARRAY, items: outlineItemSchema, description: 'A hierarchical content outline with H2s and H3s.' },
        targetWordCount: { type: Type.STRING, description: 'An estimated word count to be competitive (e.g., "1500-2000 words").' },
        linkingSuggestions: { type: Type.STRING, description: 'Suggestions for internal and external links to include.' },
    },
    required: ['searchIntent', 'suggestedTitle', 'metaDescription', 'serpAnalysis', 'keyTopics', 'questionsToAnswer', 'suggestedOutline', 'targetWordCount', 'linkingSuggestions'],
};

export const generateContentBrief = async (keyword: string, language: string, competitors?: string): Promise<ContentBrief> => {
    let prompt = `You are a world-class senior SEO strategist with access to data equivalent to Ahrefs and SEMrush. Your task is to perform an advanced analysis of the Google SERP for a target keyword and generate a comprehensive content brief.

**Target Keyword:** "${keyword}"

**Analysis Steps:**
1.  **Determine Search Intent:** Analyze the keyword to classify the user's primary goal (Informational, Commercial, Navigational, Transactional).
2.  **Simulate SERP Analysis:** Imagine you are analyzing the top 10 search results for the keyword. Identify the dominant content formats (e.g., blog posts, listicles, product pages, videos), recurring themes, and the average level of detail.
3.  **Entity & Topic Extraction:** Identify the key entities, concepts, and sub-topics that the top-ranking pages consistently cover.
4.  **"People Also Ask" Synthesis:** Synthesize the most relevant questions users are asking related to this keyword.
5.  **Competitive Angle (If provided):** If competitors are listed, identify opportunities to create content that is more comprehensive, authoritative, or provides a unique perspective they are missing.

**Content Brief Generation:**
Based on your analysis, generate a complete content brief with the following sections:
-   **Search Intent:** The identified user intent.
-   **Suggested Title:** A compelling, SEO-optimized title (under 60 characters).
-   **Meta Description:** An engaging meta description that encourages clicks (under 160 characters).
-   **SERP Analysis:** A 2-3 sentence summary of your findings about the current top-ranking content.
-   **Key Topics to Cover:** A list of crucial semantic keywords and sub-topics.
-   **Questions to Answer:** A list of key user questions the content must answer.
-   **Suggested Outline:** A logical content structure with H2 and H3 headings.
-   **Target Word Count:** An estimated word count needed to be competitive.
-   **Linking Suggestions:** Brief advice on internal and external linking strategy.
`;

    if (competitors && competitors.trim()) {
        prompt += `\n**My Competitors:** "${competitors}"\nTailor the SERP analysis and linking suggestions to identify gaps and opportunities relative to these competitors.`;
    }

    prompt += `\nThe final output must be in ${language}.`;

    return callGemini(prompt, contentBriefSchema);
};

// 1.4 Google Maps SEO
export const generateGoogleMapsKeywords = async (
  text: string, 
  language: string, 
  location: { latitude: number; longitude: number }, 
  competitors?: string
): Promise<{ keywords: KeywordWithMetadata[], groundingChunks: any[] }> => {
  let prompt = `You are a world-class local SEO expert specializing in Google Maps and Google Business Profile optimization. Your task is to generate a highly strategic list of 20-30 local SEO keywords for a business, grounded in real-world location data.

My Business Description/Name: "${text}"
${competitors ? `My Competitors: "${competitors}"` : ''}

Analyze the business and generate keywords that customers would use to find it on Google Maps. Include:
- "Near me" queries.
- Keywords with geo-modifiers (city, neighborhood, zip code).
- Service-in-location keywords (e.g., "plumber in Brooklyn").
- Product-in-location keywords (e.g., "sourdough bread downtown").

For each keyword, please provide its searchVolume, trendingRank, userIntent, competition, cpc, and a strategicInsight tailored for local SEO.

Please format your response as a single JSON object inside a markdown block. The JSON object should have a "keywords" key, containing an array of keyword objects with the requested metadata. Ensure the final text inside the JSON is in ${language}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: location
          }
        }
      },
    });

    if (!response.text) {
      throw new Error("The API returned an empty response. This may be due to content safety filters.");
    }
    
    const cleanedJsonText = response.text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
    if (!cleanedJsonText) {
      throw new Error("The API returned an empty response after cleaning.");
    }

    const parsedResult = JSON.parse(cleanedJsonText);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { keywords: parsedResult.keywords, groundingChunks };

  } catch (error) {
    console.error("Error in generateGoogleMapsKeywords:", error);
    if (error instanceof Error) {
      const cleanMessage = error.message.replace(/\[.*?\]:\s*/, '');
      throw new Error(cleanMessage);
    }
    throw new Error("An unknown error occurred while generating Google Maps keywords.");
  }
};



// 2. YouTube
const youTubeSchema = {
  type: Type.OBJECT,
  properties: {
    "Video Tags": { type: Type.ARRAY, items: keywordWithMetadataSchema, description: 'A list of 15-20 relevant and trending YouTube video tags with their search volume and trending rank.' },
    "Description Keywords": { type: Type.ARRAY, items: keywordWithMetadataSchema, description: 'A list of trending keywords with their search volume and trending rank to include naturally in the video description.' },
    "Video Description": { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array containing a single string: a compelling and SEO-optimized description for the YouTube video (3-4 sentences), incorporating generated keywords.' },
    "Title Suggestions": { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 creative and SEO-friendly title suggestions for the video.' },
    "Suggested Categories": { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 relevant YouTube category suggestions for the video.' }
  },
  propertyOrdering: ["Video Tags", "Description Keywords", "Video Description", "Title Suggestions", "Suggested Categories"],
};

interface YouTubeContentParams {
  videoInfo: string;
  category: string;
  language: string;
  fileData?: { mimeType: string, data: string };
}

export const generateYouTubeContent = async ({ videoInfo, category, fileData, language }: YouTubeContentParams): Promise<{ "Video Tags": KeywordWithMetadata[], "Description Keywords": KeywordWithMetadata[], "Video Description": string[], "Title Suggestions": string[], "Suggested Categories": string[] }> => {
  let prompt;
  const urlInstruction = `\n\n**IMPORTANT RULE:** If the video description appears to be a URL, do not access the link. Base your suggestions solely on the text of the URL itself as the video's topic.`;

  if (fileData) {
    prompt = `You are a YouTube growth expert. Your task is to generate SEO-optimized content based on the provided video description and the attached visual media.

**CRITICAL INSTRUCTION FOR VISUAL ANALYSIS:**
Deeply analyze the attached image/video. Your primary goal is to extract detailed information from the visuals. Identify:
- **Key Subjects:** People, animals, main objects.
- **Setting & Environment:** Indoor/outdoor, city, nature, specific landmarks.
- **Actions & Events:** What is happening?
- **Mood & Style:** Is it cinematic, vlog-style, funny, serious, artistic?
- **Text & Logos:** Any visible text or branding.
Your generated tags, keywords, description and titles **must be primarily derived from this detailed visual analysis** to ensure maximum relevance and specificity. Use the text description for additional context only.

Video Description: "${videoInfo}"`;
  } else {
    prompt = `You are a YouTube growth expert. Your task is to generate SEO-optimized content based on the provided video description.

Video Description: "${videoInfo}"`;
  }
  
  prompt += urlInstruction;

  prompt += `\n\nPlease provide:
1. 15-20 trending tags: For each tag, provide an estimated search volume ("High", "Medium", or "Low") and a trending rank (from 1 to 10, with 1 being the most trending).
2. Description keywords: For each keyword, also provide an estimated search volume and a trending rank.
3. A compelling, SEO-optimized video description as a single-element string array.
4. Engaging title suggestions (3 options).
5. Relevant YouTube categories.`;

  if (category && category.trim()) {
    prompt += `\n\nThe video is intended for the "${category}" category. Please tailor the suggestions accordingly.`
  }
  
  prompt += `\n\n**CRITICAL INSTRUCTIONS:** All suggestions must be genuine, ready-to-use, and highly relevant, not generic samples. Ensure any date-sensitive suggestions are for the current year.`;

  prompt += `\n\nThe final output must be in ${language}.`;


  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  return callGemini({ parts }, youTubeSchema);
};


// 3. LinkedIn
const hashtagSchema = {
  type: Type.OBJECT,
  properties: {
    hashtags: {
      type: Type.ARRAY,
      items: keywordWithMetadataSchema,
      description: "A list of relevant and effective hashtags, each with search volume and trending rank."
    },
  },
};

interface SocialPostParams {
  postInfo: string;
  language: string;
  fileData?: { mimeType: string, data: string };
}

export const generateLinkedInHashtags = async ({ postInfo, fileData, language }: SocialPostParams): Promise<{ hashtags: KeywordWithMetadata[] }> => {
  let prompt;
  const urlInstruction = `\n\n**IMPORTANT RULE:** If the post content appears to be a URL, do not access the link. Instead, treat the URL string itself as the post's topic.`;
  
  if (fileData) {
    prompt = `You are a LinkedIn marketing expert. Generate a list of relevant and trending hashtags based on the provided post content and attached image.

**CRITICAL INSTRUCTION FOR IMAGE ANALYSIS:**
Your hashtag suggestions **must be driven primarily by a deep analysis of the attached image**. Identify the following visual elements:
- **Professional Context:** Office setting, industry type (tech, finance, creative), charts, graphs, presentation.
- **People & Roles:** Individuals or groups, their apparent profession, actions (e.g., handshake, public speaking).
- **Objects & Technology:** Laptops, specific software, industry equipment.
- **Overall Theme:** Collaboration, innovation, leadership, corporate event.
The generated hashtags must directly reflect these visual cues to attract a targeted professional audience. Use the post text to refine and add context to your image-based suggestions.

Post content: "${postInfo}"`;
  } else {
    prompt = `You are a LinkedIn marketing expert. Generate a list of relevant and trending hashtags based on the provided post content.

Post content: "${postInfo}"`;
  }

  prompt += urlInstruction;
  prompt += `\n\nFor each hashtag, provide an estimated search volume ("High", "Medium", or "Low") and a trending rank (from 1 to 10, with 1 being the most trending) to maximize reach and engagement. The hashtags must be real, widely-used or emerging, and not placeholder examples. Focus on current professional trends. The final output must be in ${language}.`;
  
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }
  
  return callGemini({ parts }, hashtagSchema);
};

// 4. Instagram
const instagramSchema = {
  type: Type.OBJECT,
  properties: {
    "Post Caption": { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "An array with a single string containing an engaging Instagram caption (2-3 sentences). The caption should be tailored to the platform's tone and could include relevant emojis."
    },
    hashtags: {
      type: Type.ARRAY,
      items: keywordWithMetadataSchema,
      description: "A list of relevant and effective hashtags, each with search volume and trending rank."
    },
  },
  propertyOrdering: ["Post Caption", "hashtags"],
};

export const generateInstagramContent = async ({ postInfo, fileData, language }: SocialPostParams): Promise<{ "Post Caption": string[], hashtags: KeywordWithMetadata[] }> => {
  let prompt;
  const urlInstruction = `\n\n**IMPORTANT RULE:** If the post description appears to be a URL, do not access the link. Treat the URL string itself as the topic of the post.`;

  if (fileData) {
    prompt = `You are an Instagram marketing specialist. Your goal is to generate an engaging caption and a list of relevant hashtags based on the provided post description and attached visual media.

**CRITICAL INSTRUCTION FOR VISUAL ANALYSIS:**
Your hashtag and caption generation **must be rooted in a deep, nuanced analysis of the visual content**. Go beyond simple object identification. Focus on:
- **Aesthetic & Vibe:** Moody, vibrant, minimalist, vintage, futuristic.
- **Color Palette:** Dominant and accent colors (e.g., #PastelTones, #NeonVibes).
- **Composition & Style:** Photography style (e.g., #StreetPhotography, #Portraiture, #DroneShot).
- **Emotion & Mood:** Joyful, serene, adventurous, romantic.
- **Niche & Subject:** Specific hobbies, locations, or communities depicted.
The caption and hashtags must capture the essence of the visual media to connect with the right audience. Use the post description to complement the visual-driven suggestions.

Post description: "${postInfo}"`;
  } else {
    prompt = `You are an Instagram marketing specialist. Your goal is to generate an engaging caption and a list of relevant hashtags based on the provided post description.

Post description: "${postInfo}"`;
  }

  prompt += urlInstruction;
  prompt += `\n\nPlease provide:
1. An engaging, authentic, and ready-to-post caption as a single-element string array. Avoid generic or sample content.
2. A list of hashtags, including a mix of popular and niche ones. For each hashtag, provide an estimated search volume ("High", "Medium", or "Low") and a trending rank (from 1 to 10, with 1 being the most trending). Ensure hashtags reflect current trends.

The final output must be in ${language}.`;
  
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  return callGemini({ parts }, instagramSchema);
};

// 5. Facebook
const facebookSchema = {
  type: Type.OBJECT,
  properties: {
    "Post Text": {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array with a single string containing an engaging Facebook post text (3-5 sentences). The text should be conversational and encourage interaction (likes, comments, shares)."
    },
    hashtags: {
      type: Type.ARRAY,
      items: keywordWithMetadataSchema,
      description: "A list of 3-7 relevant and effective hashtags, each with search volume and trending rank."
    },
    "Call to Action Suggestions": {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 distinct and compelling call-to-action suggestions suitable for a Facebook post (e.g., 'Learn More', 'Shop Now', 'Comment below')."
    }
  },
  propertyOrdering: ["Post Text", "hashtags", "Call to Action Suggestions"],
};

export const generateFacebookContent = async ({ postInfo, fileData, language }: SocialPostParams): Promise<{ "Post Text": string[], hashtags: KeywordWithMetadata[], "Call to Action Suggestions": string[] }> => {
  let prompt;
  const urlInstruction = `\n\n**IMPORTANT RULE:** If the post description appears to be a URL, do not access the link. Treat the URL string itself as the topic of the post.`;

  if (fileData) {
    prompt = `You are a Facebook marketing expert. Your goal is to generate an engaging post, relevant hashtags, and clear calls to action based on the provided post description and attached visual media.

**CRITICAL INSTRUCTION FOR VISUAL ANALYSIS:**
Your suggestions for post text, hashtags, and calls to action **must be driven by a thorough analysis of the attached visual content**. Identify:
- **Central Subject & Story:** What is the main focus? What story does the visual tell?
- **Audience Appeal:** Who would this visual appeal to on Facebook (e.g., families, tech enthusiasts, small business owners)?
- **Actionable Elements:** Does the visual show a product, an event, a service? What action can a user take based on it?
- **Emotional Tone:** Is it inspiring, funny, informative, or heartwarming?
The generated content must align with the visual's core message to drive community engagement and action. Use the post description for supplemental details.

Post description: "${postInfo}"`;
  } else {
    prompt = `You are a Facebook marketing expert. Your goal is to generate an engaging post, relevant hashtags, and clear calls to action based on the provided post description.

Post description: "${postInfo}"`;
  }

  prompt += urlInstruction;
  prompt += `\n\nPlease provide:
1. An engaging post text as a single-element string array, designed to foster community interaction. This must be practical and not sample content.
2. A list of 3-7 hashtags. For each hashtag, provide an estimated search volume ("High", "Medium", or "Low") and a trending rank (from 1 to 10, with 1 being the most trending). Hashtags should be timely and relevant.
3. Three distinct and practical call-to-action suggestions.

The final output must be in ${language}.`;
  
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  return callGemini({ parts }, facebookSchema);
};