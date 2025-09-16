import BlogEditor from "./BlogEditor";

export default function EditorWrapper() {
  const handleSave = async (content: string, frontmatter: any) => {
    try {
      const response = await fetch("/api/save-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          frontmatter,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.filename) {
          alert(`Blog post saved as ${result.filename}`);
        } else {
          alert(result.message);
        }
        // Optionally redirect to the posts page
        window.location.href = "/posts";
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("Error saving blog post");
    }
  };

  return <BlogEditor onSave={handleSave} />;
}
