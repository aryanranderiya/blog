import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return (tree, { data }) => {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    // Add both the reading time text and minutes as numbers
    data.astro.frontmatter.minutesRead = readingTime.text;
    data.astro.frontmatter.readingTimeMinutes = readingTime.minutes;
    data.astro.frontmatter.readingTimeWords = readingTime.words;
  };
}
