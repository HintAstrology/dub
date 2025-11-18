import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@dub/utils/src";
import { CheckIcon, ChevronRightIcon, LucideIcon } from "lucide-react";
import { Fragment } from "react";

type TStep = {
  number: number;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

interface IStepperProps {
  steps: TStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  disabled?: boolean;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
}: IStepperProps) {
  return (
    <nav aria-label="QR Builder Steps" className="w-full">
      <ol className="flex items-center justify-between gap-x-2 gap-y-4 md:flex-row md:items-center items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = index === steps.length - 1;
          const isClickable =
            !disabled &&
            onStepClick &&
            (isCompleted || step.number === currentStep + 1);

          return (
            <Fragment key={step.number}>
              <li>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-auto flex-shrink-0 gap-2 rounded !bg-transparent p-0 transition-all disabled:opacity-100",
                    "flex-col items-center md:flex-row md:items-center",
                    "focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    isActive && "cursor-pointer hover:scale-105",
                    !isClickable && "cursor-default",
                  )}
                  onClick={(e) => {
                    if (isClickable) {
                      onStepClick(step.number);
                    }
                  }}
                  disabled={!isClickable}
                >
                  <Avatar className="size-10">
                    <AvatarFallback
                      className={cn("transition-colors", {
                        "!bg-primary !text-white shadow-sm":
                          isActive && step.number === 3,
                        "bg-white border border-primary/10 text-primary":
                          !isActive && step.number === 3 && isClickable,
                        "!bg-primary !text-primary-foreground shadow-sm":
                          isActive && step.number !== 3,
                        "bg-muted text-muted-foreground opacity-50":
                          !isActive && step.number === 1,
                        "bg-white border border-secondary/20 text-muted-foreground opacity-50":
                          !isActive && (step.number === 2 || (step.number === 3 && !isClickable)),
                      })}
                    >
                      {isCompleted ? (
                        <CheckIcon className="size-4.5" strokeWidth={2.5} />
                      ) : step.icon ? (
                        <step.icon className="size-4.5" strokeWidth={2} />
                      ) : (
                        <span className="text-sm font-semibold">
                          {step.number}
                        </span>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center md:items-start">
                    <span
                      className={cn("text-xs font-medium md:hidden", {
                        "text-foreground": isActive,
                        "text-muted-foreground opacity-50": !isActive,
                      })}
                    >
                      {step.label}
                    </span>
                    <div className="hidden flex-col items-start md:flex">
                      <span
                        className={cn("text-sm font-medium", {
                          "text-foreground": isActive || step.number === 3,
                          "text-muted-foreground opacity-50": !isActive && step.number !== 3,
                        })}
                      >
                        Step {step.number}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {step.label}
                      </span>
                    </div>
                  </div>
                </Button>
              </li>
              {!isLast && (
                <li>
                  <ChevronRightIcon
                    className="size-4 text-muted-foreground/50 transition-colors"
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
