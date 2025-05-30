import { mutatePrefix } from "@/lib/swr/mutate";
import useWorkspace from "@/lib/swr/use-workspace";
import { LinkProps } from "@/lib/types";
import { Button, Modal } from "@dub/ui";
import { getApexDomain, linkConstructor } from "@dub/utils";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

type DeleteLinkModalProps = {
  showDeleteLinkModal: boolean;
  setShowDeleteLinkModal: Dispatch<SetStateAction<boolean>>;
  props: LinkProps;
};

function DeleteLinkModal(props: DeleteLinkModalProps) {
  return (
    <Modal
      showModal={props.showDeleteLinkModal}
      setShowModal={props.setShowDeleteLinkModal}
      className="border-border-500"
    >
      <DeleteLinkModalInner {...props} />
    </Modal>
  );
}

function DeleteLinkModalInner({
  setShowDeleteLinkModal,
  props,
}: DeleteLinkModalProps) {
  const { id } = useWorkspace();
  const [deleting, setDeleting] = useState(false);
  const apexDomain = getApexDomain(props.url);

  const { key, domain } = props;

  const shortlink = useMemo(() => {
    return linkConstructor({
      key,
      domain,
      pretty: true,
    });
  }, [key, domain]);

  // const { isMobile } = useMediaQuery();

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-3 px-4 py-4 pt-8 text-center sm:px-16">
        {/*<LinkLogo apexDomain={apexDomain} />*/}
        <h3 className="text-lg font-medium">
          This QR code will be removed. <br /> Are you sure?
        </h3>
        {/*<p className="text-sm text-neutral-500">*/}
        {/*  Warning: Deleting this link will remove all of its analytics. This*/}
        {/*  action cannot be undone – proceed with caution.*/}
        {/*</p>*/}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setDeleting(true);
          fetch(`/api/links/${props.id}?workspaceId=${id}`, {
            method: "DELETE",
          }).then(async (res) => {
            if (res.status === 200) {
              await mutatePrefix("/api/links");
              setShowDeleteLinkModal(false);
              toast.success("Successfully deleted shortlink!");
            } else {
              const { error } = await res.json();
              toast.error(error.message);
            }
            setDeleting(false);
          });
        }}
        className="flex flex-col space-y-3 bg-neutral-50 px-4 py-8 text-left sm:px-16"
      >
        {/*<div>*/}
        {/*  <label*/}
        {/*    htmlFor="verification"*/}
        {/*    className="block text-sm text-neutral-700"*/}
        {/*  >*/}
        {/*    To verify, type <span className="font-semibold">{shortlink}</span>{" "}*/}
        {/*    below*/}
        {/*  </label>*/}
        {/*  <div className="relative mt-1 rounded-md shadow-sm">*/}
        {/*    <input*/}
        {/*      type="text"*/}
        {/*      name="verification"*/}
        {/*      id="verification"*/}
        {/*      pattern={shortlink}*/}
        {/*      required*/}
        {/*      autoFocus={!isMobile}*/}
        {/*      autoComplete="off"*/}
        {/*      className="border-border-500 text-neutral block w-full rounded-md placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-neutral-500 sm:text-sm"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}

        <Button
          variant="danger"
          text="Confirm delete"
          loading={deleting}
          className="border-border-500"
        />
      </form>
    </>
  );
}

export function useDeleteLinkModal({ props }: { props?: LinkProps }) {
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);

  const DeleteLinkModalCallback = useCallback(() => {
    return props ? (
      <DeleteLinkModal
        showDeleteLinkModal={showDeleteLinkModal}
        setShowDeleteLinkModal={setShowDeleteLinkModal}
        props={props}
      />
    ) : null;
  }, [showDeleteLinkModal, setShowDeleteLinkModal]);

  return useMemo(
    () => ({
      setShowDeleteLinkModal,
      DeleteLinkModal: DeleteLinkModalCallback,
    }),
    [setShowDeleteLinkModal, DeleteLinkModalCallback],
  );
}
