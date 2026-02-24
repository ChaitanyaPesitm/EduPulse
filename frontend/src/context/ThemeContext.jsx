import { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('edupulse_theme')
        return saved ? saved === 'dark' : true // default dark
    })

    useEffect(() => {
        const html = document.documentElement
        if (isDark) {
            html.classList.remove('light')
        } else {
            html.classList.add('light')
        }
        localStorage.setItem('edupulse_theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
