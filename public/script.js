document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "processed.srt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("File processing failed.");
    }
  });
