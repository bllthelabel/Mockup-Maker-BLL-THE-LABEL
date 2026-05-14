
import { PhotographyFormat, PromptSettings, LibraryProduct, ColorOption } from '../types';

export const PHOTOGRAPHY_FORMATS: PhotographyFormat[] = [
  {
    id: 'moments',
    name: 'Echte Momenten',
    description: 'Candid lifestyle fotografie waarbij het product natuurlijk gedragen wordt door een model. Het beeld voelt ongedwongen, echt en menselijk.',
    basePrompt: 'Capture an honest lifestyle memory. The model is in a candid, unposed moment with a relaxed posture and a cheerful, happy expression with a genuine smile, not looking at the camera. Use warm natural light, preferably golden hour or soft window light, with gentle shadows. Use a 35mm film aesthetic with slight grain and soft contrast. The atmosphere is raw, real, warm, and calm. The environment should be minimal and quiet, providing plenty of negative space.'
  },
  {
    id: 'detail',
    name: 'Detail & Textuur',
    description: 'Macro productfotografie gericht op stof, borduursel, print, naden en materiaalgevoel.',
    basePrompt: 'Create an extreme close-up macro shot focusing on the tactile quality of the garment. Show the fabric texture, stitching, and artwork detail exactly as seen in the reference. Use soft natural side lighting to emphasize the material quality and physical depth. The aesthetic is raw and real, highlighting the craftsmanship.'
  },
  {
    id: 'portraits',
    name: 'Stille Portretten',
    description: 'Minimal editorial portret waarin het product duidelijk zichtbaar is. Rustig, clean en tijdloos.',
    basePrompt: 'A quiet, minimal editorial portrait. The model stands still with a relaxed, grounded posture and a warm, cheerful and vrolijke expression. Set in a minimal location with a neutral color palette (beige, cream, sand). Natural diffused light, calm composition with lots of negative space. The image feels like a warm, honest memory, clean and premium.'
  },
  {
    id: 'freestanding',
    name: 'Vrijstaand Product',
    description: 'Strakke flat-lay productfotografie op een egale achtergrond. Focus volledig op het kledingstuk zelf.',
    basePrompt: 'Create a minimal flat lay product photograph. The garment is laid naturally on a soft textured surface (like linen or matte plaster) in warm neutral tones (beige, sand, cream). Allow natural folds and subtle imperfections for a relaxed, real feeling. Top-down (flat lay) composition with plenty of negative space. Soft natural sunlight (window light or golden hour) with gentle side shadows. 35mm film look, slight grain, no props, no studio background.'
  }
];

export const COLORS: ColorOption[] = [
  // NIEUWE KLEUREN SS26
  { id: 'earthy-red', name: 'Earthy Red', hex: '#8A3F39' },
  { id: 'deep-plum', name: 'Deep Plum', hex: '#542B39' },
  { id: 'purple-love-gd', name: 'G. Dyed Purple Love', hex: '#807DB2' },
  { id: 'blue-grey', name: 'Blue Grey', hex: '#62677A' },
  { id: 'blue-grey-gd', name: 'G. Dyed Blue Grey', hex: '#868A9F' },
  { id: 'grounded-beige', name: 'Grounded Beige', hex: '#AF895A' },
  { id: 'faded-olive', name: 'Faded Olive', hex: '#A49667' },
  { id: 'misty-grey-gd', name: 'G. Dyed Misty Grey', hex: '#9FA39F' },
  { id: 'honey-paper', name: 'Honey Paper', hex: '#EFE8D0' },
  { id: 'anthracite-gd', name: 'G. Dyed Anthracite', hex: '#696C73' },

  // WHITES & NECESSITIES
  { id: 'white', name: 'White', hex: '#F4F9FF' },
  { id: 'off-white', name: 'Off White', hex: '#F2F0EB' },
  { id: 'natural-raw', name: 'Natural Raw', hex: '#E0D5C6' },
  { id: 'vintage-white', name: 'Vintage White', hex: '#E5D9D3' },
  { id: 'cream', name: 'Cream', hex: '#FBF5E2' },
  { id: 'butter', name: 'Butter', hex: '#F8EEC3' },
  { id: 'lemon-sorbet', name: 'Lemon Sorbet', hex: '#F3EFB1' },

  // PINKS, REDS & ORANGES
  { id: 'pink-joy', name: 'Pink Joy', hex: '#F29394' },
  { id: 'fiesta', name: 'Fiesta', hex: '#EB7053' },
  { id: 'canyon-pink', name: 'Canyon Pink', hex: '#D1969A' },
  { id: 'cotton-pink', name: 'Cotton Pink', hex: '#F2C1D1' },
  { id: 'bubble-pink', name: 'Bubble Pink', hex: '#D393B3' },
  { id: 'bubble-pink-gd', name: 'G. Dyed Bubble Pink', hex: '#DC9FB7' },
  { id: 'lilac-dream', name: 'Lilac Dream', hex: '#BD969E' },
  { id: 'red', name: 'Red', hex: '#BD162C' },
  { id: 'burgundy', name: 'Burgundy', hex: '#64242E' },
  { id: 'bright-orange', name: 'Bright Orange', hex: '#E95C20' },
  { id: 'red-brown', name: 'Red Brown', hex: '#4B353C' },
  { id: 'heritage-brown', name: 'Heritage Brown', hex: '#995444' },

  // BLUES & PURPLES
  { id: 'french-navy', name: 'French Navy', hex: '#282D3C' },
  { id: 'dusk', name: 'Dusk', hex: '#3F487A' },
  { id: 'midnight-blue', name: 'Midnight Blue', hex: '#36445A' },
  { id: 'worker-blue', name: 'Worker Blue', hex: '#273679' },
  { id: 'mindful-blue', name: 'Mindful Blue', hex: '#486C9F' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#005A92' },
  { id: 'bright-blue', name: 'Bright Blue', hex: '#5979A2' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#9BB7D4' },
  { id: 'serene-blue', name: 'Serene Blue', hex: '#A0AABF' },
  { id: 'lavender', name: 'Lavender', hex: '#B5B4C7' },
  { id: 'purple-love', name: 'Purple Love', hex: '#6C5A9E' },
  { id: 'violet', name: 'Violet', hex: '#9C9FC1' },
  { id: 'blue-soul', name: 'Blue Soul', hex: '#BACFEA' },
  { id: 'aqua-blue', name: 'Aqua Blue', hex: '#79BDE4' },
  { id: 'pool-blue', name: 'Pool Blue', hex: '#87BFBB' },
  { id: 'swimmer-blue-gd', name: 'G. Dyed Swimmer Blue', hex: '#849BCA' },
  { id: 'blue-stone-gd', name: 'G. Dyed Blue Stone', hex: '#ADBCC9' },

  // GREENS & TEALS
  { id: 'verdant-green', name: 'Verdant Green', hex: '#128463' },
  { id: 'bottle-green', name: 'Bottle Green', hex: '#344D41' },
  { id: 'deep-teal', name: 'Deep Teal', hex: '#325068' },
  { id: 'misty-jade', name: 'Misty Jade', hex: '#B5D1B5' },
  { id: 'aloe', name: 'Aloe', hex: '#ADBEB3' },
  { id: 'caribbean-blue', name: 'Caribbean Blue', hex: '#BCE3DF' },
  { id: 'stargazer', name: 'Stargazer', hex: '#39505C' },
  { id: 'ocean-depth', name: 'Ocean Depth', hex: '#006175' },
  { id: 'hydro-gd', name: 'G. Dyed Hydro', hex: '#56787A' },
  { id: 'glazed-green', name: 'Glazed Green', hex: '#264445' },
  { id: 'green-bay', name: 'Green Bay', hex: '#6F827C' },
  { id: 'teal-monstera', name: 'Teal Monstera', hex: '#649B9E' },
  { id: 'stem-green', name: 'Stem Green', hex: '#CAD3C1' },

  // YELLOWS, EARTH & BROWNS
  { id: 'viva-yellow', name: 'Viva Yellow', hex: '#F3DF8F' },
  { id: 'spectra-yellow', name: 'Spectra Yellow', hex: '#F7B718' },
  { id: 'ochre', name: 'Ochre', hex: '#B68A3A' },
  { id: 'khaki-gd', name: 'G. Dyed Khaki', hex: '#5F5F4D' },
  { id: 'khaki', name: 'Khaki', hex: '#545244' },
  { id: 'sage', name: 'Sage', hex: '#A39F86' },
  { id: 'desert-dust', name: 'Desert Dust', hex: '#C4B6A6' },
  { id: 'latte', name: 'Latte', hex: '#CEAC86' },
  { id: 'latte-gd', name: 'G. Dyed Latte', hex: '#CAAD8A' },
  { id: 'stone', name: 'Stone', hex: '#C1BCA6' },
  { id: 'gold-ochre-gd', name: 'G. Dyed Gold Ochre', hex: '#B68F52' },
  { id: 'nispero', name: 'Nispero', hex: '#EFC98B' },
  { id: 'kaffa-coffee', name: 'Kaffa Coffee', hex: '#856564' },
  { id: 'blue-ice', name: 'Blue Ice', hex: '#E2E9EA' },
  { id: 'fraiche-peche', name: 'Fraiche Peche', hex: '#E6BDA5' },
  { id: 'mocha', name: 'Mocha', hex: '#6E6058' },
  { id: 'go-green', name: 'Go Green', hex: '#008D36' },
  { id: 'day-fall', name: 'Day Fall', hex: '#B27045' },

  // DARKS, GREYS & HEATHERS
  { id: 'black', name: 'Black', hex: '#2A2B2D' },
  { id: 'black-rock-gd', name: 'G. Dyed Black Rock', hex: '#343737' },
  { id: 'anthracite', name: 'Anthracite', hex: '#4A4B4D' },
  { id: 'india-ink-grey', name: 'India Ink Grey', hex: '#3C3F4A' },
  { id: 'heather-grey', name: 'Heather Grey', hex: '#98979A' },
  { id: 'mid-heather-grey', name: 'Mid Heather Grey', hex: '#807D7F' },
  { id: 'dark-heather-grey', name: 'Dark Heather Grey', hex: '#2B2C30' },
  { id: 'dark-heather-blue', name: 'Dark Heather Blue', hex: '#4E5368' },
  { id: 'cool-heather-grey', name: 'Cool Heather Grey', hex: '#EFEBEE' },
  { id: 'heather-sand', name: 'Heather Sand', hex: '#9A9887' },
  { id: 'heather-haze', name: 'Heather Haze', hex: '#DDD8D1' },
  { id: 'heather-rainbow', name: 'Heather Rainbow', hex: '#E4CCC6' },
  { id: 'eco-heather', name: 'Eco-Heather', hex: '#F5F0E9' },
  { id: 're-navy', name: 'RE-Navy', hex: '#5F6471' },
  { id: 'misty-grey', name: 'Misty Grey', hex: '#959B98' }
];

export const PRINT_TECHNIQUES = [
  { id: 'screenprint', name: 'Zeefdruk', description: 'Klassieke zeefdruk met een lichte voelbare inktlaag op de stof.' },
  { id: 'embroidery', name: 'Borduring', description: 'Gedetailleerde borduring met glanzend garen en fysiek reliëf.' },
  { id: 'dtg', name: 'Digital Print (DTG)', description: 'Digitale print die diep in de vezels van het katoen trekt.' },
  { id: 'puff print', name: 'Puff Print', description: '3D opgebolde inkt met een dikke, matte textuur.' },
  { id: 'flock print', name: 'Flock Print', description: 'Zachte, fluweelachtige verhoogde print.' },
  { id: 'none', name: 'Geen specifieke techniek', description: 'Laat de AI de techniek bepalen op basis van de referentie.' }
];

export const DEFAULT_SETTINGS: PromptSettings = {
  modelType: 'female',
  position: 'front',
  environment: 'indoor minimal',
  mood: 'calm',
  aspectRatio: '4:5',
  resolution: 'HD',
  color: 'white',
  printTechnique: 'none'
};

export const NEGATIVE_PROMPT = 'Do not change the product design. Do not change the logo. Do not change the print. Do not change the embroidery. Do not add extra text or labels. Do not add random graphics. No creative hallucinations. No deviations from reference images. Do not make the image look like a glossy commercial ad. No harsh studio lighting. No flash or artificial studio lighting. No forced posing. No busy background. No distorted hands. No deformed clothing. No incorrect text. No fake logos. No bright or saturated colors. No HDR or over-processed look.';

export const BASE_PRODUCTS: LibraryProduct[] = [
  {
    id: 'basic-tee-creator',
    name: 'Basic T-shirt Creator',
    description: 'BLL Basic T-shirt Creator basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-15.13.13.png',
    availableColors: [
      'white', 'natural-raw', 'vintage-white', 'off-white',
      'earthy-red', 'deep-plum', 'blue-grey', 'faded-olive', 'honey-paper',
      'black', 'french-navy', 'fiesta', 'nispero', 'fraiche-peche',
      'cotton-pink', 'bubble-pink', 'red-brown', 'burgundy', 'red',
      'lilac-dream', 'lavender', 'purple-love', 'worker-blue', 'blue-ice',
      'blue-soul', 'aqua-blue', 'bright-blue', 'mindful-blue', 'aloe',
      'stargazer', 'deep-teal', 'pool-blue', 'verdant-green', 'glazed-green',
      'green-bay', 'misty-jade', 'khaki', 'spectra-yellow', 'viva-yellow',
      'ochre', 'heritage-brown', 'mocha', 'latte', 'desert-dust', 'stone',
      'misty-grey', 'india-ink-grey', 'anthracite',
      'heather-grey', 'dark-heather-blue', 'cool-heather-grey', 'heather-haze',
      'mid-heather-grey', 'dark-heather-grey', 'eco-heather'
    ],
    technicalDetails: 'Stanley/Stella Creator (STTU169): Unisex Iconic T-shirt, loose fit and relaxed look, 180 GSM. Unlike a standard fit, this shirt hangs loosely and drapes softly on the body. Features: 1x1 rib at neck collar, set-in sleeves. The fabric is light and fluid, creating a comfortable baggy silhouette without being bulky.',
    category: 'top'
  },
  {
    id: 'oversized-tee-freestyler',
    name: 'Oversized T-shirt Freestyler',
    description: 'BLL Oversized T-shirt Freestyler basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-15.48.06.png',
    availableColors: [
      'white', 'natural-raw', 'black', 'french-navy', 'fraiche-peche', 'burgundy',
      'kaffa-coffee', 'worker-blue', 'mindful-blue', 'aloe', 'stargazer', 'glazed-green',
      'misty-jade', 'khaki', 'day-fall', 'heritage-brown', 'mocha', 'desert-dust', 'simple-white', 'cream',
      'heather-grey', 'cool-heather-grey', 'heather-haze', 'dark-heather-grey'
    ],
    technicalDetails: 'Stanley/Stella Freestyler (STTU788): Unisex ultra-heavy T-shirt, boxy oversized fit, 240 GSM. This is a heavy-duty garment with a structured, wide silhouette and dropped shoulders. The fabric is thick and stiff (dry handfeel), maintaining its boxy shape. It is significantly wider and heavier than the Creator model.',
    category: 'top'
  },
  {
    id: 'oversized-longsleeve-freestyler',
    name: 'Oversized Longsleeve T-shirt Freestyler',
    description: 'BLL Oversized Longsleeve T-shirt Freestyler basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-15.54.36.png',
    availableColors: [
      'white', 'natural-raw', 'black', 'french-navy', 'mindful-blue', 'stargazer',
      'heritage-brown', 'heather-grey', 'cool-heather-grey', 'heather-haze'
    ],
    technicalDetails: 'Stanley/Stella Freestyler Long Sleeve (STTU200): Unisex heavy long sleeve T-shirt, relaxed fit, 240 GSM. Features: 1x1 rib at neck collar, self-fabric neck tape, set-in sleeves, double needle topstitch at sleeve hem and bottom hem. Fabric has a unique dry handfeel.',
    category: 'top'
  },
  {
    id: 'basic-hoodie-archer',
    name: 'Basic Hoodie Archer',
    description: 'BLL Basic Hoodie Archer basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-16.02.07.png',
    availableColors: [
      'white', 'natural-raw', 'black', 'french-navy', 'canyon-pink', 'pink-joy',
      'burgundy', 'lavender', 'bright-blue', 'ocean-depth', 'caribbean-blue',
      'go-green', 'teal-monstera', 'stem-green', 'sage', 'butter', 'heather-grey'
    ],
    technicalDetails: 'Stanley/Stella Archer (STSU011): Unisex French Terry hoodie, medium fit, 300 GSM. Features: double-layered hood, round tonal drawcords with metal tipping, metal eyelets, kangaroo pocket, 1x1 rib at cuffs and hem.',
    category: 'top'
  },
  {
    id: 'oversized-hoodie-voicer',
    name: 'Oversized Hoodie Voicer',
    description: 'BLL Oversized Hoodie Voicer basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-16.03.41.png',
    availableColors: ['natural-raw', 'faded-olive', 'black', 'french-navy', 'misty-grey'],
    technicalDetails: 'Stanley/Stella Voicer (STSU256): Unisex boxy hoodie, oversized fit, 400 GSM. Features: double-layered hood, herringbone neck tape, self-fabric half moon, no drawcords, set-in sleeves, 1x1 rib at cuffs and hem.',
    category: 'top'
  },
  {
    id: 'basic-sweater-matcher',
    name: 'Basic Sweater Matcher',
    description: 'BLL Basic Sweater Matcher basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-16.05.49.png',
    availableColors: [
      'white', 'natural-raw', 'black', 'french-navy', 'canyon-pink', 'pink-joy',
      'burgundy', 'lavender', 'bright-blue', 'ocean-depth', 'caribbean-blue',
      'go-green', 'teal-monstera', 'stem-green', 'sage', 'butter', 'heather-grey'
    ],
    technicalDetails: 'Stanley/Stella Matcher (STSU799): Unisex French Terry crewneck sweatshirt, medium fit, 300 GSM. Features: 1x1 rib at neck, cuffs and hem, herringbone neck tape, self-fabric half moon, double needle topstitch.',
    category: 'top'
  },
  {
    id: 'oversized-sweater-radder',
    name: 'Oversized Sweater Radder',
    description: 'BLL Oversized Sweater Radder basis voor jouw ontwerpen.',
    imageUrl: 'https://bllthelabel.com/app/uploads/2026/04/Schermafbeelding-2026-04-29-om-16.07.26.png',
    availableColors: [
      'white', 'natural-raw', 'black', 'french-navy', 'pink-joy', 'violet',
      'dusk', 'blue-ice', 'mindful-blue', 'misty-jade', 'khaki', 'mocha',
      'stone', 'cream', 'misty-grey', 'heather-grey', 'cool-heather-grey'
    ],
    technicalDetails: 'Stanley/Stella Radder 2.0 (STSU208): Unisex oversized crewneck sweatshirt, 350 GSM. Features: 2x1 rib at neck, cuffs and hem, herringbone neck tape, self-fabric half moon, garment dyed for unique washed look.',
    category: 'top'
  }
];
