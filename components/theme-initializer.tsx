"use client"

import { useEffect } from "react"

export function ThemeInitializer() {
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const { colorScheme } = JSON.parse(savedSettings)
      if (colorScheme !== 'default') {
        document.documentElement.classList.add(`theme-${colorScheme}`)
      }
    }
  }, [])

  return null
}
