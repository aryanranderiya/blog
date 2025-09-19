import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  RedditShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  RedditIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  size?: number;
}

export default function ShareButtons({
  url,
  title,
  description,
  hashtags = [],
  size = 40,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <TwitterShareButton
        url={url}
        title={title}
        hashtags={hashtags}
        className="hover:opacity-80 transition-opacity"
      >
        <TwitterIcon size={size} round />
      </TwitterShareButton>

      <FacebookShareButton
        url={url}
        hashtag={hashtags[0] ? `#${hashtags[0]}` : undefined}
        className="hover:opacity-80 transition-opacity"
      >
        <FacebookIcon size={size} round />
      </FacebookShareButton>

      <LinkedinShareButton
        url={url}
        title={title}
        summary={description}
        className="hover:opacity-80 transition-opacity"
      >
        <LinkedinIcon size={size} round />
      </LinkedinShareButton>

      <RedditShareButton
        url={url}
        title={title}
        className="hover:opacity-80 transition-opacity"
      >
        <RedditIcon size={size} round />
      </RedditShareButton>

      <WhatsappShareButton
        url={url}
        title={`${title} ${url}`}
        className="hover:opacity-80 transition-opacity"
      >
        <WhatsappIcon size={size} round />
      </WhatsappShareButton>

      <EmailShareButton
        url={url}
        subject={title}
        body={description ? `${description}\n\n${url}` : url}
        className="hover:opacity-80 transition-opacity"
      >
        <EmailIcon size={size} round />
      </EmailShareButton>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="hover:opacity-80 transition-opacity relative cursor-pointer"
        title={copied ? "Copied!" : "Copy link"}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: copied ? "#22c55e" : "#6b7280",
          }}
        >
          {copied ? (
            <svg
              width={size * 0.5}
              height={size * 0.5}
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          ) : (
            <svg
              width={size * 0.5}
              height={size * 0.5}
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}
