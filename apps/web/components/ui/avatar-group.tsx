import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { default as man } from "../assets/avatars/man.png";
import { default as woman } from "../assets/avatars/woman.png";

const usersWithAvatar = [
  {
    name: "John",
    avatar: { src: "https://randomuser.me/api/portraits/women/44.jpg" },
  },
  {
    name: "Anna",
    avatar: woman,
  },
  {
    name: "S",
  },
  {
    name: "Lane",
    avatar: { src: "https://randomuser.me/api/portraits/women/42.jpg" },
  },
  {
    name: "Sarah",
    avatar: man,
  },
];

export const AvatarGroup = () => {
  return (
    <div className="flex -space-x-3">
      {usersWithAvatar?.map((user, index) => (
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
