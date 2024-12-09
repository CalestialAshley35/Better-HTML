const imageUpload = document.getElementById("imageUpload");
const fileDetails = document.getElementById("fileDetails");
const outputDiv = document.getElementById("output");
const runButton = document.getElementById("runCode");

// Initialize CodeMirror for syntax highlighting in the textarea
const codeArea = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "htmlmixed",
  lineNumbers: true,
  matchBrackets: true,
  theme: "dracula",
  lineWrapping: true,
});

// Load custom tags, modules, and stored data from localStorage
const customTags = JSON.parse(localStorage.getItem("customTags")) || {};
const eshModules = JSON.parse(localStorage.getItem("eshModules")) || {};
let storedData = JSON.parse(localStorage.getItem("storedData")) || {};

// Save custom tags to localStorage
function saveCustomTags() {
  localStorage.setItem("customTags", JSON.stringify(customTags));
}

// Save eshModules to localStorage
function saveEshModules() {
  localStorage.setItem("eshModules", JSON.stringify(eshModules));
}

// Save stored data to localStorage
function saveStoredData() {
  localStorage.setItem("storedData", JSON.stringify(storedData));
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
    /esh create (\w+)\s*html:(.*?)/gs,
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

  // <storage>
  htmlCode = htmlCode.replace(
    /<storage>store="(.*?)"<\/storage>/g,
    (match, data) => {
      const key = `store_${Object.keys(storedData).length + 1}`;
      storedData[key] = data;
      saveStoredData();
      return `<p>Data stored with key: <strong>${key}</strong></p>`;
    }
  );

  // <dataload>
  htmlCode = htmlCode.replace(
    /<dataload><\/dataload>/g,
    () => {
      const storedItems = Object.entries(storedData)
        .map(([key, value]) => `<p><strong>${key}</strong>: ${value}</p>`)
        .join("");
      return storedItems || `<p>No stored data found.</p>`;
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
