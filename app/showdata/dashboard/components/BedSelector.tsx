import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BedSelectorProps {
  selectedBed: string
  onBedChange: (value: string) => void
}

export const BedSelector = ({ selectedBed, onBedChange }: BedSelectorProps) => (
  <Select value={selectedBed} onValueChange={onBedChange}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="选择床位" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="所有床位">所有床位</SelectItem>
      {Array.from({ length: 5 }, (_, i) => (
        <SelectItem key={i} value={`${i + 1}号床`}>
          {`${i + 1}号床`}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
