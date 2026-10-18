import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[4px] border border-[#1A1A1A] bg-[#FDFAF4] px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#FFE14D] focus-visible:shadow-[2px_2px_0px_0px_#1A1A1A] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
