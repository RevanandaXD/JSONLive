"use client";

import { useSession, signOut } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";

type UserCardProps = {
  className?: string;
};

export const UserCard = ({ className = "" }: UserCardProps) => {

  const { data, isPending } = useSession();
  const router = useRouter()

  if (isPending) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <a
          href="/login"
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background transition-colors hover:bg-primary-hover"
        >
          Log in
        </a>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        }
      }
    })
  }

  const user = data.user;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <IoPersonCircleOutline size={32} className="shrink-0 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">{user.name || user.email.split("@")[0]}</p>
        <span className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-medium text-primary">
          Hobby
        </span>
      </div>
      <button
        onClick={handleLogout}
        title="Logout"
        className="ml-2 flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
      >
        <IoLogOutOutline size={15} />
        <span>Logout</span>
      </button>
    </div>
  );
};
