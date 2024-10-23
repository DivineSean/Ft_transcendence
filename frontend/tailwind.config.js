/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
		extend: {
			backgroundImage: {
				'hero-pattern': "url('/images/background.png')",
			},
			colors: {
				'green': '#31E78B',
				'black': '#08090D',
				'gray': '#D4D4D8',
				'white': '#FFFFFF',
				'red': '#EA242D',
				'left-gradient-p': 'rgba(36,36,36,0.4)',
				'right-gradient-p': 'rgba(36,36,36,0.2))',
				'left-gradient-s': 'rgba(80,80,80,0.4)',
				'right-gradient-s': 'rgba(80,80,80,0.2))',
				'logout-bg': 'rgba(255, 0, 0, 0.2)',
				'stroke-pr': '#313131',
				'stroke-sc': '#5B5B5B'
			},
			fontSize: {
				// text
				'txt-xs':		'0.75rem',	// 12px
				'txt-sm':		'0.875rem',	// 14px
				'txt-md':		'1rem',			// 16px
				'txt-lg':		'1.125rem',	// 18px
				'txt-xl':		'1.25rem',	// 20px
				'txt-2xl':	'1.5rem',		// 24px
				'txt-3xl':	'1.875rem',	// 30px
				'txt-4xl':	'2.25rem',	// 36px
				'txt-5xl':	'3rem',			// 48px
				'txt-6xl':	'3.75rem',	// 60px

				// large heading screen
				'h-lg-xs':	'0.875rem',	// 14px
				'h-lg-sm':	'1rem',			// 16px
				'h-lg-md':	'1.25rem',	// 20px
				'h-lg-lg':	'1.875rem',	// 30px
				'h-lg-xl':	'2.25rem',	// 36px
				'h-lg-2xl':	'3rem',			// 48px
				'h-lg-3xl':	'3.75rem',	// 60px
				'h-lg-4xl':	'4.5rem',		// 72px

				// small heading screen
				'h-sm-xs':	'0.875rem',	// 14px
				'h-sm-sm':	'1rem',			// 16px
				'h-sm-md':	'1.25rem',	// 20px
				'h-sm-lg':	'1.5rem',		// 24px
				'h-sm-xl':	'1.875rem',	// 30px
				'h-sm-2xl':	'2.25rem',	// 36px
				'h-sm-3xl':	'3rem',			// 48px
				'h-sm-4xl':	'3.75rem',	// 60px
			},
			spacing: {
				'2': '0.124rem',
				'3': '0.1875rem',
				'4': '0.25rem',
				'8': '0.5rem',
				'10': '0.625rem',
				'12': '0.75rem',
				'16': '1rem',
				'22': '1.375rem',
				'24': '1.5rem',
				'32': '2rem',
				'40': '2.5rem',
				'48': '3rem',
				'56': '3.5rem',
				'64': '4rem',
			},
			lineHeight: {
				'2': '0.124rem',
				'3': '0.1875rem',
				'4': '0.25rem',
				'8': '0.5rem',
				'10': '0.625rem',
				'12': '0.75rem',
				'16': '1rem',
				'22': '1.375rem',
				'24': '1.5rem',
				'32': '2rem',
				'40': '2.5rem',
				'48': '3rem',
				'56': '3.5rem',
				'64': '4rem',
			},
			screens: {
				'lg': '1100px'
			}
		},
  },
  plugins: [],
}

