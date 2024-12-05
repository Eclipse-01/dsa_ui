import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export interface AlertMessage {
  title: string
  description: string
  type: "warning" | "error"
}

interface VitalAlertsProps {
  alerts: AlertMessage[]
}

export const VitalAlerts = ({ alerts }: VitalAlertsProps) => (
  alerts.length > 0 && (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === "error" ? "destructive" : "default"}
          className={cn(
            "animate-in slide-in-from-top-2",
            alert.type === "error" ? "border-red-600 bg-red-600" : "border-yellow-600 bg-yellow-600"
          )}
        >
          <AlertTitle className="text-white">
            {alert.title}
          </AlertTitle>
          <AlertDescription className="text-white/90">
            {alert.description}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
)
