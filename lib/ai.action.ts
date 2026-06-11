import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";
export async function fetchasdataurl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }


  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("FileReader did not return a string result"));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read blob as data URL"));
    };

    // base 64 url of the image data, 
    // eg base 64 url : data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    reader.readAsDataURL(blob);
  });
}

export const generate3DView = async ({sourceImage} : Generate3DViewParams)  => {
    // checks if already base64 url, if not fetches the image and converts to base64 url
        const dataUrl = sourceImage.startsWith("data:") 
        ? sourceImage 
        : await fetchasdataurl(sourceImage); 
       
    // const  base64Data = dataUrl.split(",")[1];
    // const mimeType = dataUrl.split(";")[0].split(":")[1];

    // if (!base64Data || !mimeType) {
    //     throw new Error("Invalid data URL format");
    // }

    const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
   if (!match) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
        provider: "gemini",
        model: "gemini-2.5-flash-image-preview",
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024 },
    });

    const rawImageUrl = (response as HTMLImageElement).src ?? null;
    if(!rawImageUrl) return  { renderedImage : null , renderedPath : undefined }
    const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl 
    : await fetchasdataurl(rawImageUrl);

    return { renderedImage, renderedPath : undefined }
}

// goto visualiser and put this generate3CView function . 