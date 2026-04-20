import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";
import { cn } from "./ui/utils";

interface AuthorHoverCardProps {
  name: string;
  initials: string;
  avatar?: string;
  email: string;
  role: string;
  triggerClassName?: string;
}

export function AuthorHoverCard({ name, initials, avatar, email, role, triggerClassName }: AuthorHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn("flex items-center gap-2 transition-opacity hover:opacity-80", triggerClassName)}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-left text-foreground">{name}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden" side="top">
        <div className="bg-primary p-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-primary-foreground/20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-3xl bg-destructive-foreground text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold text-primary-foreground mb-1">{name}</h3>
          <p className="text-primary-foreground/90">{role}</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            View profile
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
