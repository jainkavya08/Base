import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] border font-sans font-medium whitespace-nowrap transition-transform duration-100 outline-none select-none focus-visible:outline-2 focus-visible:outline-[#FFE14D] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[3px_3px_0px_0px_#FF4D00] hover:shadow-[4px_4px_0px_0px_#FFE14D] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A1A1A]",
        cta:
          "bg-[#FF4D00] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:shadow-[5px_5px_0px_0px_#1A1A1A] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A1A1A]",
        secondary:
          "bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[5px_5px_0px_0px_#1A1A1A] hover:shadow-[7px_7px_0px_0px_#1A1A1A] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1A1A1A]",
        yellow:
          "bg-[#FFE14D] text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A1A1A]",
        outline:
          "bg-[#FDFAF4] text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1A1A1A]",
        ghost:
          "bg-transparent text-[#1A1A1A] border-transparent hover:bg-[#EDE8DC] hover:border-[#1A1A1A]",
        destructive:
          "bg-[#FF4D00] text-white border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:shadow-[4px_4px_0px_0px_#1A1A1A]",
        link: "border-transparent text-[#FF4D00] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[38px] gap-2 px-4 text-sm",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[32px] gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[44px] gap-2 px-5 text-sm font-medium",
        xl: "h-[50px] gap-2.5 px-7 text-base font-medium",
        icon: "size-[38px]",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[32px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
