import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the SDK with your hidden API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 2. We use Gemini 1.5 Flash because it is incredibly fast and amazing at reading images
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 3. Helper function to turn a URL into the format Gemini requires
async function fetchImageAsGenerativePart(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const base64data = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });

  return {
    inlineData: {
      data: base64data,
      mimeType: blob.type,
    },
  };
}

// THIS IS THE CRUCIAL LINE!
export { model, fetchImageAsGenerativePart };