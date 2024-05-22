document.getElementById("file").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const content = event.target.result;
    const processedContent = processSrt(content, []); // Pass an empty array for exceptions since there's no backend to send exceptions to

    // Download the processed file
    const blob = new Blob([processedContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "processed.srt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  reader.readAsText(file);
});
