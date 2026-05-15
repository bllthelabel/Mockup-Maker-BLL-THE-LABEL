import { PhotographyFormat, PromptSettings, LibraryProduct } from '../types';

export function generatePrompt(
  format: PhotographyFormat,
  settings: PromptSettings,
  libraryProducts?: LibraryProduct[]
): string {

  const imageRoles = `REFERENCE IMAGES INSTRUCTIONS:
- Image 1 (if provided): This is the DESIGN reference. It contains the exact artwork, print, logo, or embroidery that must appear on the final garment. Do not alter, simplify, or hallucinate any part of this design.
- Image 2 (if provided): This is the SHAPE reference. It shows the garment silhouette, fit, and construction only. Use it solely to understand proportions, drape, and structure.`;

  const protectionRule = `CRITICAL: The design from Image 1 is absolute and final. Do not deviate from it. The shape from Image 2 is only for fit context. Do not hallucinate extra details, labels, or patterns.`;

  const selectedProduct = settings.baseProductId
    ? libraryProducts?.find(p => p.id === settings.baseProductId)
    : null;

  const techDetails = selectedProduct?.technicalDetails
    ? `\nTechnical Construction: ${selectedProduct.technicalDetails}`
    : "";

  const colorPart = settings.color
    ? `The fabric color must be exactly: ${settings.color}.`
    : "The color must precisely match the provided source reference.";

  const productName = selectedProduct
    ? `The product is a BLL THE LABEL ${selectedProduct.name}. ${colorPart}${techDetails}`
    : `This is a high-end BLL THE LABEL garment. ${colorPart}`;

  const modelPart = format.id === 'freestanding' || format.id === 'ghost-mannequin'
    ? "The product is displayed alone as a flat-lay or ghost mannequin, styled perfectly without any person or mannequin visible."
    : settings.modelType === 'no model'
    ? "The product is displayed alone on a minimal invisible mannequin or flat-lay, styled naturally."
    : `The product is worn by a ${settings.modelType} model with a warm, happy and cheerful smile.`;

  const positionPart = `The viewpoint focuses on the ${settings.position} of the garment.`;
  const environmentPart = `Set in a ${settings.environment} environment.`;
  const moodPart = `The overall atmosphere is ${settings.mood}, calm, and human.`;
  const stylePart = `BLL THE LABEL brand aesthetic: raw, real, warm, and grounded. This is emotional lifestyle storytelling, looking like an honest memory captured in real life. Use natural light only (golden hour or soft window light). 35mm film look with soft contrast and slight grain.`;

  const techniqueDescriptions: Record<string, string> = {
    screenprint: 'The artwork is applied using high-quality screenprinting, showing a slight physical ink texture on the fabric.',
    embroidery: 'The design is realized through premium embroidery, with high-density stitching, distinct physical depth, and a slight luster to the thread.',
    dtg: 'The graphic is digitally printed (DTG), perfectly integrated into the cotton fibers for a soft, breathable vintage feel.',
    'puff print': 'The print uses 3D puff ink, resulting in a significantly raised, thick, and matte textured finish.',
    'flock print': 'The design has a soft, velvet-like flock texture that is physically raised from the fabric surface.'
  };

  const printTechniquePart = settings.printTechnique && settings.printTechnique !== 'none'
    ? `\nPrinting Technique: ${techniqueDescriptions[settings.printTechnique]}`
    : "";

  return `${imageRoles}\n\n${protectionRule}\n\n${productName}${printTechniquePart} ${format.basePrompt}\n\n${modelPart} ${positionPart} ${environmentPart} ${moodPart} ${stylePart}`;
}
