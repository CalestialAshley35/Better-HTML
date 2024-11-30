const imageUpload = document.getElementById("imageUpload");
const fileDetails = document.getElementById("fileDetails");
const outputDiv = document.getElementById("output");
const runButton = document.getElementById("runCode");

// Initialize CodeMirror for syntax highlighting in the textarea
const codeArea = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "htmlmixed", // Use 'htmlmixed' mode for HTML, CSS, JS highlighting
  lineNumbers: true, // Show line numbers
  matchBrackets: true, // Highlight matching brackets
  theme: "dracula", // Optional: Apply the 'dracula' theme (or choose another)
  lineWrapping: true, // Enable line wrapping
});

// Load custom tags from localStorage
const customTags = JSON.parse(localStorage.getItem("customTags")) || {};

// Save custom tags to localStorage
function saveCustomTags() {
  localStorage.setItem("customTags", JSON.stringify(customTags));
}

// Handle Image Upload
imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    const fileExtension = file.name.split('.').pop();
    fileDetails.textContent = `File: ${file.name} (Extension: ${fileExtension})`;

    // Add HTML++ Syntax Example in Editor
    codeArea.setValue(codeArea.getValue() + `<lazyload>${fileURL}</lazyload>\n`);
  } else {
    fileDetails.textContent = "No file selected.";
  }
});

// Parse and Run HTML++ Code
runButton.addEventListener("click", () => {
  let htmlCode = codeArea.getValue();

  // Command Parsing: Replace <lazyload>
  htmlCode = htmlCode.replace(/<lazyload>(.*?)<\/lazyload>/g, (match, src) => {
    return `<img src="${src}" loading="lazy" alt="Lazy Loaded Image">`;
  });

  // Command Parsing: Replace <highlight>
  htmlCode = htmlCode.replace(
    /<highlight language="(.*?)">(.*?)<\/highlight>/gs,
    (match, language, code) => {
      const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    }
  );

  // Command Parsing: Create Custom Tag
  htmlCode = htmlCode.replace(
    /<create>name="(.*?)" js:(.*?)<\/create>/gs,
    (match, tagName, realHTML) => {
      customTags[tagName] = realHTML;
      saveCustomTags();
      return `<p>Custom tag <strong>${tagName}</strong> created!</p>`;
    }
  );

  // Command Parsing: Import Custom Tag
  htmlCode = htmlCode.replace(/<import>(.*?)<\/import>/g, (match, tagName) => {
    return customTags[tagName] || `<p>Error: Custom tag <strong>${tagName}</strong> not found!</p>`;
  });

  // Render the Parsed HTML
  outputDiv.innerHTML = htmlCode;

  // Re-highlight the syntax in the output using Prism.js
  Prism.highlightAll();
});
