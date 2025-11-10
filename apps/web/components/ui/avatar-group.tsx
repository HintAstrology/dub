import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersWithAvatar } from "@/ui/modals/trial-offer-with-qr-preview/components/avatars.component";

export const AvatarGroup = () => {
  return (
    <div className="flex -space-x-3">
      {usersWithAvatar.map((user, index) => (
        <Avatar
          key={index}
          className="ring-offset-background h-8 w-8 ring-2 ring-gray-300 ring-offset-2"
        >
          <AvatarImage src={user?.avatar?.src ?? ""} alt={user.name} />
          <AvatarFallback className="bg-gray-200 text-sm">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};
