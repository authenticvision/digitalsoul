const colorMappings = {
  "accent": ["a"],
  "accent-content": ["ac"],
  "base-100": ["b1"],
  "base-content": ["bc"],
  "base-200": ["b2"],
  "base-300": ["b3"],
  "error": ["er"],
  "error-content": ["erc"],
  "info": ["in"],
  "info-content": ["inc"],
  "neutral": ["n"],
  "neutral-content": ["nc"],
  "primary": ["p"],
  "primary-content": ["pc"],
  "secondary": ["s"],
  "secondary-content": ["sc"],
  "success": ["su"],
  "success-content": ["suc"],
  "warning": ["wa"],
  "warning-content": ["wac"],
}

export function generateDaisyColors(theme) {
  // This allows to load colors output by the DaisyUI-Theme generator (see https://daisyui.com/theme-generator/)
  // dynmically from the DB and apply it at rendering

  let allColors = {}
  Object.keys(theme).forEach(key => {
    // This is supported syntax by the oklch function built into browsers!
    const strColorValue = `from ${theme[key]} l c h`;
    allColors[key] = strColorValue;

    const mapping = colorMappings[key];

    if(mapping) {
      mapping.forEach(mk => {
        allColors[mk] = strColorValue;
      })
    }
  });

  return allColors;
  
}