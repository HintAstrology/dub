import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_FEATURES } from "@/ui/plans/constants.ts";
import { Check } from "lucide-react";
import { FC } from "react";

export const PlansFeatures: FC = () => {
  return (
    <Card className="border-none shadow-none p-0">
      <CardHeader className="p-0 pb-3 ">
        <CardTitle className="text-lg">Plan Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {PLAN_FEATURES.map((feature, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "rgb(1, 103, 102)" }}
            >
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm leading-snug">{feature}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
