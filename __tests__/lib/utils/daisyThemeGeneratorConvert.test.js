import { jsonFromDaisyTheme } from '@/lib/utils'





describe('utils.daisyThemeGeneratorConverter', () => {

  const target= `{"primary":"#ff00ef","primary-content":"#160014","secondary":"#00c800","secondary-content":"#000f00","accent":"#0065ff","accent-content":"#d0e3ff","neutral":"#241d1e","neutral-content":"#cecccd","base-100":"#38252c","base-200":"#2f1f25","base-300":"#27191e","base-content":"#d4cfd0","info":"#00ceff","info-content":"#000f16","success":"#00a62d","success-content":"#000a01","warning":"#f4a000","warning-content":"#140900","error":"#ff004a","error-content":"#160002"}`

	it('Complete copied input can be parsed', () => {
    const fromClipboard = `module.exports = {
      daisyui: {
        themes: [
          {
            mytheme: {
              
    "primary": "#ff00ef",
              
    "primary-content": "#160014",
              
    "secondary": "#00c800",
              
    "secondary-content": "#000f00",
              
    "accent": "#0065ff",
              
    "accent-content": "#d0e3ff",
              
    "neutral": "#241d1e",
              
    "neutral-content": "#cecccd",
              
    "base-100": "#38252c",
              
    "base-200": "#2f1f25",
              
    "base-300": "#27191e",
              
    "base-content": "#d4cfd0",
              
    "info": "#00ceff",
              
    "info-content": "#000f16",
              
    "success": "#00a62d",
              
    "success-content": "#000a01",
              
    "warning": "#f4a000",
              
    "warning-content": "#140900",
              
    "error": "#ff004a",
              
    "error-content": "#160002",
              },
            },
          ],
        },
        plugins: [
          require('daisyui'),
        ],
        //...
      }`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted.primary).toEqual("#ff00ef");
	})

  it('Inner-Copied JSON works', () => {
    const fromClipboard = `{
          
"primary": "#ff00ef",
          
"primary-content": "#160014",
          
"secondary": "#00c800",
          
"secondary-content": "#000f00",
          
"accent": "#0065ff",
          
"accent-content": "#d0e3ff",
          
"neutral": "#241d1e",
          
"neutral-content": "#cecccd",
          
"base-100": "#38252c",
          
"base-200": "#2f1f25",
          
"base-300": "#27191e",
          
"base-content": "#d4cfd0",
          
"info": "#00ceff",
          
"info-content": "#000f16",
          
"success": "#00a62d",
          
"success-content": "#000a01",
          
"warning": "#f4a000",
          
"warning-content": "#140900",
          
"error": "#ff004a",
          
"error-content": "#160002",
          },`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted.warning).toEqual("#f4a000");
  })

  it('Dirty-Copy works', () => {
    const fromClipboard = `heme: {
          
"primary": "#ff00ef",
          
"primary-content": "#160014",
          
"secondary": "#00c800",
          
"secondary-content": "#000f00",
          
"accent": "#0065ff",
          
"accent-content": "#d0e3ff",
          
"neutral": "#241d1e",
          
"neutral-content": "#cecccd",
          
"base-100": "#38252c",
          
"base-200": "#2f1f25",
          
"base-300": "#27191e",
          
"base-content": "#d4cfd0",
          
"info": "#00ceff",
          
"info-content": "#000f16",
          
"success": "#00a62d",
          
"success-content": "#000a01",
          
"warning": "#f4a000",
          
"warning-content": "#140900",
          
"error": "#ff004a",
          
"error-content": "#160002",
          },
        },`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted.warning).toEqual("#f4a000");
  })

  it('Inner-Copied JSON works', () => {
    const fromClipboard = `{
          
"primary": "#ff00ef",
          
"primary-content": "#160014",
          
"secondary": "#00c800",
          
"secondary-content": "#000f00",
          
"accent": "#0065ff",
          
"accent-content": "#d0e3ff",
          
"neutral": "#241d1e",
          
"neutral-content": "#cecccd",
          
"base-100": "#38252c",
          
"base-200": "#2f1f25",
          
"base-300": "#27191e",
          
"base-content": "#d4cfd0",
          
"info": "#00ceff",
          
"info-content": "#000f16",
          
"success": "#00a62d",
          
"success-content": "#000a01",
          
"warning": "#f4a000",
          
"warning-content": "#140900",
          
"error": "#ff004a",
          
"error-content": "#160002",
          },`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted.warning).toEqual("#f4a000");
  })

  it('Non-json shall return null', () => {
    const fromClipboard = `{someKey: "no-json"}`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted).toEqual(null);
  })

  it('Non-DaisyUI json shall return the value as json', () => {
    const fromClipboard = `{"someKey": "is-json"}`;

    const extracted = jsonFromDaisyTheme(fromClipboard);

    expect(extracted.someKey).toEqual("is-json");
  })
})
