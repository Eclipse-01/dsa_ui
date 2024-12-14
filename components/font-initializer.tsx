"use client"

import { useEffect } from "react"

export function FontInitializer() {
  useEffect(() => {
    const applyFont = (fontFamily: string) => {
      document.documentElement.style.setProperty('--font-family', fontFamily)
      document.body.style.fontFamily = fontFamily
    }

    // 加载保存的字体设置
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.fontFamily) {
        applyFont(settings.fontFamily)
      }
    }

    // 监听字体设置变化
    const handleFontChange = (event: CustomEvent) => {
      const { fontFamily } = event.detail
      if (fontFamily) {
        applyFont(fontFamily)
      }
    }

    window.addEventListener('fontChanged', handleFontChange as EventListener)
    return () => {
      window.removeEventListener('fontChanged', handleFontChange as EventListener)
    }
  }, [])

  return null
}
