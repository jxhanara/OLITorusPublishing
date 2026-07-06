import { useState } from "react";
import { DraftEmailModal } from "./DraftEmailModal";
import { cn } from "./ui/utils";

interface AuthorCellProps {
  name: string;
  initials?: string;
  avatar?: string;
  email: string;
  triggerClassName?: string;
  /** Optional change context, so the draft email can reference what's being followed up on. */
  changeContext?: { page: string; description: string };
  /** Other authors who touched this page, offered as a "To:" autocomplete. */
  pageAuthors?: { name: string; email: string }[];
}

/**
 * Author cell, matching the "Created by" column: the name in accent blue with a
 * smaller grey email to its right. Clicking the email opens a Draft Email modal
 * (Torus DS) instead of a mailto: link, so the message can be reviewed and edited
 * before sending.
 */
export function AuthorHoverCard({ name, email, triggerClassName, changeContext, pageAuthors }: AuthorCellProps) {
  const [showEmailDraft, setShowEmailDraft] = useState(false);

  const subject = changeContext ? `Re: ${changeContext.page} update` : `Question for ${name}`;
  const body = changeContext
    ? `Hi {first_name},\n\nI wanted to follow up on your recent change to "${changeContext.page}": ${changeContext.description}\n\nLet me know if you have a moment to walk me through it, or feel free to reply here with any context.\n\nThanks!`
    : `Hi {first_name},\n\n`;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight", triggerClassName)}>
      <span className="text-left text-[15px] font-normal text-[var(--ol-link-strong)]">{name}</span>
      <button
        type="button"
        onClick={() => setShowEmailDraft(true)}
        className="text-left text-xs text-[var(--ol-text-muted)] underline-offset-2 hover:underline"
      >
        {email}
      </button>
      <DraftEmailModal
        open={showEmailDraft}
        onOpenChange={setShowEmailDraft}
        recipients={[email]}
        subject={subject}
        body={body}
        suggestedRecipients={pageAuthors}
      />
    </div>
  );
}
