import { IoPersonCircleOutline } from "react-icons/io5";

type UserCardProps = {
  className?: string;
};

export const UserCard = ({ className = "" }: UserCardProps) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <IoPersonCircleOutline size={32} className="shrink-0 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">Username</p>
        <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary">
          Hobby
        </span>
      </div>
    </div>
  );
};
