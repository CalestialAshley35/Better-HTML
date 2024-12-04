const imageUpload = document.getElementById("imageUpload");
const fileDetails = document.getElementById("fileDetails");
const outputDiv = document.getElementById("output");
const runButton = document.getElementById("runCode");
const secretIcon = document.createElement("i");

// Initialize CodeMirror for syntax highlighting in the textarea
const codeArea = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "htmlmixed",
  lineNumbers: true,
  matchBrackets: true,
  theme: "dracula",
  lineWrapping: true,
});

// Load custom tags, modules, and secrets from localStorage
const customTags = JSON.parse(localStorage.getItem("customTags")) || {};
const eshModules = JSON.parse(localStorage.getItem("eshModules")) || {};
const secrets = JSON.parse(localStorage.getItem("secrets")) || {};

// Save custom tags to localStorage
function saveCustomTags() {
  localStorage.setItem("customTags", JSON.stringify(customTags));
}

// Save eshModules to localStorage
function saveEshModules() {
  localStorage.setItem("eshModules", JSON.stringify(eshModules));
}

// Save secrets to localStorage
function saveSecrets() {
  localStorage.setItem("secrets", JSON.stringify(secrets));
}

// Add secrets icon
secretIcon.className = "fa-solid fa-key";
secretIcon.title = "Add Secret";
document.body.appendChild(secretIcon); // Add the icon to the body (can customize location)

// Handle Secrets Storage
secretIcon.addEventListener("click", () => {
  const secretName = prompt("Enter a secret name:");
  if (secretName) {
    const secretValue = prompt(`Enter the value for "${secretName}":`);
    if (secretValue) {
      secrets[secretName] = secretValue;
      saveSecrets();
      alert(`Secret "${secretName}" has been saved!`);
    } else {
      alert("No value provided. Secret not saved.");
    }
  } else {
    alert("No name provided. Secret not saved.");
  }
});

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

  // Commands Parsing

  // <lazyload>
  htmlCode = htmlCode.replace(/<lazyload>(.*?)<\/lazyload>/g, (match, src) => {
    return `<img src="${src}" loading="lazy" alt="Lazy Loaded Image">`;
  });

  // <highlight>
  htmlCode = htmlCode.replace(
    /<highlight language="(.*?)">(.*?)<\/highlight>/gs,
    (match, language, code) => {
      const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    }
  );

  // <create> (Custom Tag Creation)
  htmlCode = htmlCode.replace(
    /<create>name="(.*?)" js:(.*?)<\/create>/gs,
    (match, tagName, realHTML) => {
      customTags[tagName] = realHTML;
      saveCustomTags();
      return `<p>Custom tag <strong>${tagName}</strong> created!</p>`;
    }
  );

  // <import> (Custom Tag Usage)
  htmlCode = htmlCode.replace(/<import>(.*?)<\/import>/g, (match, tagName) => {
    return customTags[tagName] || `<p>Error: Custom tag <strong>${tagName}</strong> not found!</p>`;
  });

  // New Command: esh create
  htmlCode = htmlCode.replace(
    /esh create (\w+)\s*html:(.*?)$/gm,
    (match, moduleName, moduleHTML) => {
      eshModules[moduleName] = moduleHTML.trim();
      saveEshModules();
      return `<p>Module <strong>${moduleName}</strong> created! Use by <code>esh install ${moduleName}</code>.</p>`;
    }
  );

  // New Command: esh install
  htmlCode = htmlCode.replace(
    /esh install (\w+)/g,
    (match, moduleName) => {
      return (
        eshModules[moduleName] ||
        `<p>Error: Module <strong>${moduleName}</strong> not found!</p>`
      );
    }
  );

  // <videoEmbed>
  htmlCode = htmlCode.replace(
    /<videoEmbed src="(.*?)"(.*?)><\/videoEmbed>/g,
    (match, src, attributes) => {
      return `<video src="${src}" ${attributes.trim()}></video>`;
    }
  );

  // <fontStyle>
  htmlCode = htmlCode.replace(
    /<fontStyle font="(.*?)" color="(.*?)" size="(.*?)">(.*?)<\/fontStyle>/g,
    (match, font, color, size, content) => {
      return `<span style="font-family: ${font}; color: ${color}; font-size: ${size};">${content}</span>`;
    }
  );

  // <textStyle>
  htmlCode = htmlCode.replace(
    /<textStyle bold="(.*?)" italic="(.*?)" color="(.*?)">(.*?)<\/textStyle>/g,
    (match, bold, italic, color, content) => {
      const fontWeight = bold === "true" ? "bold" : "normal";
      const fontStyle = italic === "true" ? "italic" : "normal";
      return `<span style="font-weight: ${fontWeight}; font-style: ${fontStyle}; color: ${color};">${content}</span>`;
    }
  );

  // <tableCreate>
  htmlCode = htmlCode.replace(
    /<tableCreate rows="(\d+)" cols="(\d+)" border="(.*?)"><\/tableCreate>/g,
    (match, rows, cols, border) => {
      let table = `<table border="${border}">`;
      for (let i = 0; i < rows; i++) {
        table += "<tr>";
        for (let j = 0; j < cols; j++) {
          table += "<td></td>";
        }
        table += "</tr>";
      }
      table += "</table>";
      return table;
    }
  );

  // <markdown>
  htmlCode = htmlCode.replace(
    /<markdown>content="(.*?)"<\/markdown>/g,
    (match, content) => {
      const converted = content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      return converted;
    }
  );

  // <styleInject>
  htmlCode = htmlCode.replace(
    /<styleInject>(.*?)<\/styleInject>/gs,
    (match, css) => {
      return `<style>${css}</style>`;
    }
  );

  // <embedContent>
  htmlCode = htmlCode.replace(
    /<embedContent type="(.*?)" url="(.*?)"><\/embedContent>/g,
    (match, type, url) => {
      if (type === "youtube") {
        return `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
      }
      return `<p>Unknown content type: ${type}</p>`;
    }
  );

  // <codeBlock>
  htmlCode = htmlCode.replace(
    /<codeBlock language="(.*?)" content="(.*?)"><\/codeBlock>/g,
    (match, language, content) => {
      const escapedCode = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    }
  );

  // <formElement>
  htmlCode = htmlCode.replace(
    /<formElement type="(.*?)" name="(.*?)" placeholder="(.*?)"><\/formElement>/g,
    (match, type, name, placeholder) => {
      return `<input type="${type}" name="${name}" placeholder="${placeholder}">`;
    }
  );

  // Render the Parsed HTML
  outputDiv.innerHTML = htmlCode;

  // Re-highlight the syntax in the output using Prism.js
  Prism.highlightAll();
});
