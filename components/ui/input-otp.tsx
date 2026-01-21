import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & {
    containerClassName?: string;
  }
>(({ className, containerClassName, inputMode, pattern, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex w-full items-center justify-between gap-3",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    inputMode={inputMode ?? "numeric"}
    pattern={pattern ?? "[0-9]*"}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 items-center justify-between", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext.slots[index];
  if (!slot) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center border-y border-r border-zinc-200 bg-white text-lg font-semibold text-zinc-900 shadow-sm transition-all first:rounded-l-2xl first:border-l last:rounded-r-2xl sm:h-14 sm:w-14",
        slot.isActive && "z-10 ring-4 ring-emerald-500/15",
        className,
      )}
      {...props}
    >
      {slot.char}
      {slot.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-caret-blink bg-zinc-900" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("px-1", className)} {...props}>
    <Dot className="h-5 w-5 text-zinc-400" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

