import { Metadata, NextPage } from "next";

import Markdown from "markdown-to-jsx";
import { HelpCenterBreadcrumbComponent } from "./elements/help-center-breadcrumb";

import { getSession } from "@/lib/auth/utils.ts";
import { getUserCookieService } from "core/services/cookie/user-session.service.ts";
import { HelpCenterTrackerComponent } from "../elements/help-center-tracker.component.tsx";
import { getHelpCenterArticlesData } from "./helpers/help-center.service.ts";

interface IHelpCenterSlugPage {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: IHelpCenterSlugPage): Promise<Metadata> => {
  const { slug } = await params;

  const { title } = await getHelpCenterArticlesData(slug);

  return {
    title: { absolute: `GetQR: ${title}` },
  };
};

const HelpCenterSlugPage: NextPage<Readonly<IHelpCenterSlugPage>> = async ({
  params,
}) => {
  const { sessionId } = await getUserCookieService();
  const authSession = await getSession();

  const { slug } = await params;

  const { title, content } = await getHelpCenterArticlesData(slug);

  return (
    <>
      <div className="mx-auto w-full">
        <HelpCenterBreadcrumbComponent breadCrumbLabel={title} />

        <h1 className="mb-6 mt-9 text-[26px] font-semibold leading-[1.15] lg:text-[40px]">
          {title}
        </h1>

        <Markdown className="prose w-full max-w-5xl text-inherit marker:text-inherit [&_ol:first-of-type_a]:text-inherit [&_ol_li]:list-decimal [&_ul_a]:text-blue-500 [&_ul_li]:list-disc">
          {content}
        </Markdown>

        <HelpCenterTrackerComponent
          isAuthorized={!!authSession?.user}
          sessionId={authSession?.user ? authSession?.user.id! : sessionId!}
        />
      </div>
    </>
  );
};

export default HelpCenterSlugPage;
