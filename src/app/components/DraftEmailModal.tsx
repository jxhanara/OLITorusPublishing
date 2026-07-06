import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { cn } from "./ui/utils";

interface RecipientOption {
  name: string;
  email: string;
}

interface DraftEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: string[];
  subject: string;
  body: string;
  /** Other authors who touched this page, offered as a "To:" autocomplete. */
  suggestedRecipients?: RecipientOption[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Draft-and-send email modal (Torus DS). Opens in place of a mailto: link so the
 * user can review/edit the message before sending, mirroring the "View changes"
 * diff modal pattern (same footprint: 92vh tall, up to 1680px wide). Recipients/
 * subject/body reset to the passed-in defaults each time it reopens rather than
 * persisting the previous edit session.
 */
export function DraftEmailModal({
  open,
  onOpenChange,
  recipients: initialRecipients,
  subject: initialSubject,
  body: initialBody,
  suggestedRecipients = [],
}: DraftEmailModalProps) {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setRecipients(initialRecipients);
      setSubject(initialSubject);
      setBody(initialBody);
      setQuery("");
      setShowSuggestions(false);
    }
    // Only reset when the modal opens (or its defaults change) — not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRecipients, initialSubject, initialBody]);

  const filteredSuggestions = suggestedRecipients.filter(
    (a) =>
      !recipients.includes(a.email) &&
      (a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase())),
  );

  const addRecipient = (email: string) => {
    setRecipients((prev) => (prev.includes(email) ? prev : [...prev, email]));
    setQuery("");
    inputRef.current?.focus();
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const handleQueryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addRecipient(filteredSuggestions[0].email);
      } else if (EMAIL_PATTERN.test(query.trim())) {
        addRecipient(query.trim());
      }
    } else if (e.key === "Backspace" && query === "" && recipients.length > 0) {
      removeRecipient(recipients[recipients.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSend = () => {
    toast.success(recipients.length > 0 ? `Email sent to ${recipients.join(", ")}` : "Email sent");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="flex h-[92vh] w-[96vw] !max-w-[min(96vw,1680px)] flex-col gap-0 overflow-hidden rounded-lg border border-[var(--ol-border)] bg-[var(--ol-card-bg)] p-6 text-[var(--ol-text)] shadow-2xl sm:max-w-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Draft Email</DialogTitle>
          <DialogDescription>Review and send an email to the selected recipients.</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 items-start justify-between gap-3">
          {/* Inline sizing: the global h2 rule in theme.css is non-layered and would
              otherwise override Tailwind's text-size/weight utilities (forcing 36px/600). */}
          <h2 className="text-[var(--ol-text)]" style={{ fontSize: "24px", fontWeight: 700, lineHeight: "32px" }}>
            Draft Email
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-md p-1 text-[var(--ol-text-muted)] outline-none transition-colors hover:text-[var(--ol-text)] focus-visible:ring-2 focus-visible:ring-[var(--ol-link-strong)]"
          >
            <X className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="mt-5 flex shrink-0 flex-col gap-1.5">
          <label className="text-sm text-[var(--ol-text-muted)]">To:</label>
          <div className="relative">
            <div
              className={cn(
                "flex min-h-[44px] flex-wrap items-center gap-2 rounded-md border bg-transparent p-2 transition-colors",
                showSuggestions ? "border-[var(--ol-link-strong)]" : "border-[var(--ol-border)]",
              )}
            >
              {recipients.map((email) => {
                const known = suggestedRecipients.find((a) => a.email === email);
                return (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ol-text)]/10 py-1 pl-2 pr-3 text-sm text-[var(--ol-text)]"
                  >
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      aria-label={`Remove ${email}`}
                      className="text-[var(--ol-text-muted)] hover:text-[var(--ol-text)]"
                    >
                      <X className="size-3.5" strokeWidth={2} aria-hidden />
                    </button>
                    {known ? `${known.name} <${email}>` : email}
                  </span>
                );
              })}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (blurTimeout.current) clearTimeout(blurTimeout.current);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  blurTimeout.current = setTimeout(() => setShowSuggestions(false), 120);
                }}
                onKeyDown={handleQueryKeyDown}
                placeholder={recipients.length === 0 ? "Add recipient by name or email..." : "Add another..."}
                className="min-w-[140px] flex-1 bg-transparent text-sm text-[var(--ol-text)] outline-none placeholder:text-[var(--ol-text-muted)]"
              />
            </div>
            {showSuggestions && filteredSuggestions.length > 0 ? (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-[var(--ol-border)] bg-[var(--ol-card-bg)] p-1 shadow-lg">
                {filteredSuggestions.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addRecipient(a.email)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--ol-nav-active)]"
                  >
                    <span className="font-medium text-[var(--ol-link-strong)]">{a.name}</span>
                    <span className="truncate text-xs text-[var(--ol-text-muted)]">{a.email}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex shrink-0 flex-col gap-1.5">
          <label htmlFor="draft-email-subject" className="text-sm text-[var(--ol-text-muted)]">
            Subject:
          </label>
          <Input
            id="draft-email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={cn(
              "h-auto rounded-md border-[var(--ol-border)] bg-transparent px-3 py-2 text-base text-[var(--ol-text)]",
              "focus-visible:border-[var(--ol-link-strong)] focus-visible:ring-1 focus-visible:ring-[var(--ol-link-strong)]",
            )}
          />
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-1.5">
          <label htmlFor="draft-email-body" className="text-sm text-[var(--ol-text-muted)]">
            Body:
          </label>
          <Textarea
            id="draft-email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn(
              "min-h-[220px] flex-1 resize-none rounded-md border-[var(--ol-border)] bg-transparent px-3 py-2.5 text-base leading-relaxed text-[var(--ol-text)]",
              "focus-visible:border-[var(--ol-link-strong)] focus-visible:ring-1 focus-visible:ring-[var(--ol-link-strong)]",
            )}
          />
        </div>

        <div className="mt-5 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--ol-text-muted)]">
            Fields contained in square brackets like {"{first_name}"} will be personalized automatically.
          </p>
          <Button
            type="button"
            onClick={handleSend}
            disabled={recipients.length === 0}
            className="h-auto shrink-0 gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-white shadow-[0px_2px_4px_0px_rgba(0,52,99,0.1)] hover:bg-[#0D70FF]"
          >
            Send
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
