export const COLORS = {
    // Base Colors
    background: '#0D0D0D', // Background Black
    card: '#1A1A1A',       // Card Dark Grey
    white: '#FFFFFF',      // Pure White

    // Neon Accents
    primary: '#6F00FF',    // Electric Indigo
    primaryBright: '#7B00FF', // Neon Indigo
    secondary: '#00E5FF',  // Neon Cyan
    accentDark: '#240952', // Royal Indigo
    accentMuted: '#3E285C', // Violet Indigo

    // Utility
    success: '#00FF85',    // Success Green
    error: '#FF4D4D',      // Alert Red
    muted: '#B3B3B3',      // Muted Grey

    // Semantic mappings for existing components
    text: '#FFFFFF',
    textDim: '#B3B3B3',
    input: '#1A1A1A',
    border: 'rgba(255,255,255,0.1)',
};

export const SIZES = {
    padding: 20,
    radius: 12,
    h1: 28,
    h2: 22,
    h3: 18,
    body: 14,
};

export const FONTS = {
    // We will use these keys after loading fonts
    h1: { fontFamily: 'Montserrat-Bold', fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontFamily: 'Montserrat-SemiBold', fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontFamily: 'Montserrat-SemiBold', fontSize: SIZES.h3, lineHeight: 22 },
    body: { fontFamily: 'Inter-Regular', fontSize: SIZES.body, lineHeight: 22 },
    bodyMedium: { fontFamily: 'Inter-Medium', fontSize: SIZES.body, lineHeight: 22 },
    small: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 20 },
};
