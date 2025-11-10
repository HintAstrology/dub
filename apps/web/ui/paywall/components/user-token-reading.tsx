"use client";

import { changePreSignupEmailAction } from "@/lib/actions/pre-checkout-flow/change-email";
import { LoadingSpinner } from "@dub/ui";
import {
  useGetUserProfileQuery,
  useUpdateUserMutation,
} from "core/api/user/user.hook";
import {
  initPeopleAnalytic,
  setPeopleAnalytic,
  setPeopleAnalyticOnce,
} from "core/integration/analytic";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useRouterStuff } from "node_modules/@dub/ui/src/hooks/use-router-stuff";
import { FC, useEffect } from "react";
import { toast } from "sonner";

interface IUserTokenReadingComponentProps {
  id: string;
  email: string;
  isPaidUser: boolean;
}

export const UserTokenReadingComponent: FC<
  Readonly<IUserTokenReadingComponentProps>
> = ({ id, email, isPaidUser }) => {
  const { queryParams } = useRouterStuff();

  const router = useRouter();
  const { data, isLoading } = useGetUserProfileQuery();
  const { trigger: triggerUpdateUserCookie } = useUpdateUserMutation();

  const { executeAsync } = useAction(changePreSignupEmailAction, {
    async onSuccess() {
      await triggerUpdateUserCookie({ isPaidUser, emailMarketing: true });

      initPeopleAnalytic(id);
      setPeopleAnalytic({ $email: email });
      setPeopleAnalyticOnce({ email_marketing: true });

      setTimeout(() => {
        queryParams({
          del: ["user_token"],
        });
      }, 1000);
    },
  });

  useEffect(() => {
    if (!isLoading && data?.success && data?.data?.currency?.currencyForPay) {
      const changeEmailSession = async () => {
        try {
          const result = await executeAsync({ email });

          if (result?.serverError) {
            const errorCodeMatch = result.serverError.match(/^\[(.*?)\]/);
            const errorCode = errorCodeMatch ? errorCodeMatch[1] : null;

            if (errorCode === "email-exists") {
              toast.error("Your email is already registered. Please log in.");
            }

            return router.push("/?login=true");
          }
        } catch (error) {
          console.error(error);

          return router.push("/?login=true");
        }
      };

      changeEmailSession();
    }
  }, [email, isLoading, data]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="text-medium mx-auto my-8 text-center font-bold leading-[1.17]">
        Almost finished...
      </h3>
      <LoadingSpinner className="m-auto h-5 w-5 text-neutral-400" />
    </div>
  );
};
