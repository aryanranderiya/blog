import { WebIcon, TwitterIcon, GitHubIcon, LinkedinIcon } from "./icons/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  variant?: "navbar" | "footer";
  className?: string;
  iconSize?: number;
  spacing?: "compact" | "normal" | "loose";
}

const socialLinks = [
  {
    href: "https://aryanranderiya.com",
    label: "Visit Aryan's website",
    tooltip: "Website",
    icon: WebIcon,
  },
  {
    href: "https://twitter.com/aryanranderiya",
    label: "Follow Aryan on Twitter",
    tooltip: "Twitter",
    icon: TwitterIcon,
  },
  {
    href: "https://linkedin.com/in/aryanranderiya",
    label: "Follow Aryan on LinkedIn",
    tooltip: "LinkedIn",
    icon: LinkedinIcon,
  },
  {
    href: "https://github.com/aryanranderiya/blog",
    label: "Go to blog's GitHub repo",
    tooltip: "GitHub",
    icon: GitHubIcon,
  },
];

export default function SocialLinksWithTooltip({
  variant = "navbar",
  className = "",
  iconSize,
  spacing = "normal",
}: Props) {
  const size = iconSize || (variant === "footer" ? 24 : 20);
  const spacingClasses = {
    compact: "space-x-2",
    normal: variant === "footer" ? "space-x-6" : "space-x-4",
    loose: "space-x-8",
  };
  const baseLinkClasses =
    "text-muted-foreground hover:text-foreground transition-colors";
  const linkClasses =
    variant === "footer" ? `${baseLinkClasses} duration-200` : baseLinkClasses;
  const iconClasses = variant === "footer" ? "w-6 h-6" : "w-5 h-5";

  return (
    <nav
      className={`flex items-center ${spacingClasses[spacing]} ${className}`}
      aria-label="Social media links"
    >
      {socialLinks.map(({ href, label, tooltip, icon: Icon }) => (
        <Tooltip key={href}>
          <TooltipTrigger asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClasses}
              aria-label={label}
            >
              <span className="sr-only">{label}</span>
              <Icon size={size} className={iconClasses} />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
