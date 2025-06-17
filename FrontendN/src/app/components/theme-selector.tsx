"use client"

import { useMemo } from "react"
import { useThemeConfig } from "@/components/ui/active-theme"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select"

const THEMES = {
  default: [
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Amber", value: "amber" },
  ],
  scaled: [
    { name: "Default Scaled", value: "default-scaled" },
    { name: "Blue Scaled", value: "blue-scaled" },
  ],
  mono: [
    { name: "Mono Scaled", value: "mono-scaled" },
  ],
}

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  // Get current theme name for display
  const currentThemeName = useMemo(() => {
    const allThemes = [
      ...THEMES.default,
      ...THEMES.scaled,
      ...THEMES.mono
    ];
    return allThemes.find(t => t.value === activeTheme)?.name || 'Select a theme';
  }, [activeTheme]);

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          size="sm"
          className="w-[180px] justify-start"
        >
          <span className="truncate">{currentThemeName}</span>
        </SelectTrigger>
        <SelectContent align="end" className="w-[200px]">
          <SelectGroup>
            <SelectLabel>Default</SelectLabel>
            {THEMES.default.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Scaled</SelectLabel>
            {THEMES.scaled.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Monospaced</SelectLabel>
            {THEMES.mono.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
