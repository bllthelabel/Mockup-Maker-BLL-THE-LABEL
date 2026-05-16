
import { PhotographyFormat, PromptSettings, LibraryProduct } from '../types';
import { NEGATIVE_PROMPT, FORMAT_NEGATIVE_PROMPTS } from './constants';

const PRINT_TECHNIQUE_INSTRUCTIONS = {
  screenprint: 'The print has flat, opaque colors with clean edges. No gradients unless specified. It looks like high-quality ink applied directly to the fabric.',
  embroidery: 'The design has raised texture, thread-like quality, and a clear dimensional appearance with subtle thread sheen.',
  dtg: 'The print integrates naturally into the fabric texture with slight bleed at edges, feeling soft to the touch.',
  'puff print': 'The design has a 3D raised foam-like texture, casting a subtle shadow on the fabric.',
  'flock print': 'The design has a velvet-like soft fuzzy texture with a matte finish.',
  'none': ''
};

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

  const printTechniquePart = (settings.printTechnique && settings.printTechnique !== 'none')
    ? `\n[PRINT TECHNIQUE]: ${PRINT_TECHNIQUE_INSTRUCTIONS[settings.printTechnique as keyof typeof PRINT_TECHNIQUE_INSTRUCTIONS]}`
    : "";

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

  const variationHint = settings.variationIndex && settings.variationIndex > 0 
    ? `[COMPOSITIONAL VARIATION ${settings.variationIndex}]: Slightly different angle, clothing fold, or framing than the previous shot for a unique look.`
    : '';

  // Build the prompt segments
  const systemConstraints = `[SYSTEM CONSTRAINTS]\n${protectionRule}\n${environmentPart}\n${moodPart}\n${stylePart}\n${variationHint}`;
  const subjectDescription = `[SUBJECT: ${format.name.toUpperCase()}]\n${productName}${printTechniquePart}\n${format.basePrompt}\nSTRICT DESIGN REQUIREMENT: The artwork from the reference image must be perfectly visible on the garment.`;
  const visualDirectives = `[VISUAL DIRECTIVES]\n${modelPart}\n${positionPart}`;
  
  const strictSummary = `\n[FINAL CHECK: MANDATORY CONSISTENCY]\nScene: ${settings.environment}\nMood: ${settings.mood}\nHuman Presence: ${isNoModelFormat ? 'ABSOLUTELY NONE' : 'Natural'}`;

  return `${systemConstraints}\n\n${subjectDescription}\n\n${visualDirectives}\n${strictSummary}`;
}

export function generateNegativePrompt(format: PhotographyFormat): string {
  const formatSpecific = FORMAT_NEGATIVE_PROMPTS[format.id] || '';
  return `${NEGATIVE_PROMPT}${formatSpecific ? ', ' + formatSpecific : ''}`;
}
