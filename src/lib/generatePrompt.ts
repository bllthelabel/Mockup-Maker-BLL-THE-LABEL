
import { PhotographyFormat, PromptSettings, LibraryProduct } from '../types';
export function generatePrompt(format: PhotographyFormat, settings: PromptSettings, libraryProducts?: LibraryProduct[]): string {
  const protectionRule = "CRITICAL VISUAL IDENTITY: You MUST replicate the EXACT artwork, print, and design from the reference image onto the garment. The red popsicle graphic and 'No spang!' text (or whatever design is present) must be visible and identical in position, color, and detail. DO NOT hallucinate extra labels, neck tags, or new graphics.";
  
  const selectedProduct = settings.baseProductId ? libraryProducts?.find(p => p.id === settings.baseProductId) : null;
  const techDetails = selectedProduct?.technicalDetails ? `\nTechnical Construction: ${selectedProduct.technicalDetails}` : "";
  
  const colorPart = settings.color 
    ? `The fabric color must be exactly: ${settings.color}.` 
    : "The color must precisely match the provided source reference.";
  
  const productName = selectedProduct 
    ? `The product is a BLL THE LABEL ${selectedProduct.name}. ${colorPart}${techDetails}` 
    : `This is a high-end BLL THE LABEL garment. ${colorPart}`;

  const isNoModelFormat = ['foto_1', 'foto_2', 'foto_7'].includes(format.id);

  const modelPart = isNoModelFormat
    ? "ABSOLUTE REQUIREMENT: SHOW ONLY THE PRODUCT. NO HUMANS, NO MODELS, NO BODY PARTS, NO SKIN, NO FACES, NO HANDS. The scene must be 100% empty of any human presence."
    : settings.modelType === 'no model'
    ? "SHOW ONLY THE PRODUCT on an invisible support. NO HUMANS, NO MODELS, NO SKIN."
    : `The product is worn by a ${settings.modelType} model with a warm, happy and cheerful smile.`;
    
  const positionPart = `The viewpoint focuses on the ${settings.position} of the garment.`;
  
  const isGhostMannequin = format.id === 'foto_7';
  const environmentPart = isGhostMannequin
    ? `[STRICT ENVIRONMENT]: The background MUST be a clean, solid color hex #F6F6F6. This is a studio setting.`
    : `[STRICT ENVIRONMENT]: The entire scene must be set in a neutrale fotostudio met passend licht. This environment setting is MANDATORY and must be consistent across all photos.`;
    
  const moodPart = `[STRICT MOOD]: The overall atmosphere and lighting must be ontspannen (relaxed), calm, and grounded.`;
  const stylePart = "BLL THE LABEL brand aesthetic: raw, real, warm, and grounded. This is professional lifestyle/studio storytelling. Use natural light only (golden hour or soft window light). 35mm film look with soft contrast and slight grain.";

  const techniqueDescriptions: Record<string, string> = {
    'screenprint': 'The artwork is applied using high-quality screenprinting, showing a slight physical ink texture on the fabric.',
    'embroidery': 'The design is realized through premium embroidery, with high-density stitching, distinct physical depth, and a slight luster to the thread.',
    'dtg': 'The graphic is digitally printed (DTG), perfectly integrated into the cotton fibers for a soft, breathable vintage feel.',
    'puff print': 'The print uses 3D puff ink, resulting in a significantly raised, thick, and matte textured finish.',
    'flock print': 'The design has a soft, velvet-like flock texture that is physically raised from the fabric surface.'
  };

  const printTechniquePart = (settings.printTechnique && settings.printTechnique !== 'none')
    ? `\nPrinting Technique: ${techniqueDescriptions[settings.printTechnique]}`
    : "";

  // Build the prompt segments
  const systemConstraints = `[SYSTEM CONSTRAINTS]\n${protectionRule}\n${environmentPart}\n${moodPart}\n${stylePart}`;
  const subjectDescription = `[SUBJECT: ${format.name.toUpperCase()}]\n${productName}${printTechniquePart}\n${format.basePrompt}\nSTRICT DESIGN REQUIREMENT: The artwork from the reference image must be perfectly visible on the garment.`;
  const visualDirectives = `[VISUAL DIRECTIVES]\n${modelPart}\n${positionPart}`;
  
  const strictSummary = `\n[FINAL CHECK: MANDATORY CONSISTENCY]\nScene: ${settings.environment}\nMood: ${settings.mood}\nHuman Presence: ${isNoModelFormat ? 'ABSOLUTELY NONE' : 'Natural'}`;

  return `${systemConstraints}\n\n${subjectDescription}\n\n${visualDirectives}${strictSummary}`;
}
