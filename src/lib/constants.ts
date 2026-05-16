
import { PhotographyFormat, PromptSettings, LibraryProduct, ColorOption } from '../types';

export const PHOTOGRAPHY_FORMATS: PhotographyFormat[] = [
  {
    id: 'foto_1',
    name: 'Detail shot - Close-up bovengedeelte',
    description: 'Close-up van het bovenste gedeelte van het product, schuin van bovenaf (~45 graden) gefotografeerd.',
    basePrompt: 'Create a high-detail close-up shot of the upper portion of the garment. Camera angle: ~45 degrees from above. Framing: 40-50% of the image, ensuring the neckline and the chest artwork from the reference image are clearly visible and centered. The print/artwork must be sharp and perfectly reproduced. Background: Pure white. NO extra labels.'
  },
  {
    id: 'foto_2',
    name: 'Product flat lay - Frontaal',
    description: 'Volledig product shot in flat-lay stijl, recht van voren gefotografeerd op een wit fond.',
    basePrompt: 'Create a professional product flat lay photograph. The entire garment is visible, laid flat. The artwork/print from the reference image must be perfectly centered and clearly visible. Camera angle: Directly horizontal (0 degrees). Framing: 70% of image. Background: Pure white. Entirely sharp.'
  },
  {
    id: 'foto_3',
    name: 'Model portret - Frontaal',
    description: 'Portret van een model van voren, focus op het bovenlichaam op een wit fond.',
    basePrompt: 'Model portrait showing the torso clearly. The design from the reference image must be visible on the chest. Camera: Shoulder height. Framing: Upper body. Lighting: Soft studio. Background: Pure white. Neutral expression.'
  },
  {
    id: 'foto_4',
    name: 'Model profiel - Zijkant',
    description: 'Model gefotografeerd van de zijkant (profiel) op een wit fond.',
    basePrompt: 'Model profile shot. The side of the garment and a portion of the front design should be visible. Camera: 90 degrees profile. Framing: Upper body. Background: Pure white.'
  },
  {
    id: 'foto_5',
    name: 'Model full-body - Driekwart',
    description: 'Volledig lichaamsportret in een driekwart positie op een wit fond.',
    basePrompt: 'Full-body model photo in 45-degree position. The chest design must remain visible. Framing: Head to toe. Lighting: Even studio. Background: Pure white.'
  },
  {
    id: 'foto_6',
    name: 'Model portret - Frontaal Close',
    description: 'Close-up portret van een model met direct oogcontact op een wit fond.',
    basePrompt: 'Close-up model portrait. The framing must include enough of the chest to show the original design/artwork clearly. Direct eye contact. Lighting: Symmetrical studio. Background: Pure white.'
  },
  {
    id: 'foto_7',
    name: 'Ghost mannequin - Frontaal',
    description: 'Product gepresenteerd op een onzichtbare paspop om pasvorm en vorm te tonen op een wit fond.',
    basePrompt: 'Professional ghost mannequin shot. The garment maintains its 3D shape. The artwork from the reference image must be perfectly positioned on the chest. Framing: Shoulders to waist. Hollow neck effect. Background: Pure white.'
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
  environment: 'neutrale fotostudio met passend licht',
  mood: 'ontspannen',
  aspectRatio: '4:5',
  resolution: 'HD',
  color: 'white',
  printTechnique: 'none',
  provider: 'google'
};

export const NEGATIVE_PROMPT = 'extra neck labels, invented brand labels, random prints, graphics not in original product, logos not in original product, text, blurry, distorted, low quality, multiple people, extra limbs, cluttered background, distracting props, watermarks, signature.';

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
