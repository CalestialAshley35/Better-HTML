const imageUpload = document.getElementById("imageUpload");
const fileDetails = document.getElementById("fileDetails");
const outputDiv = document.getElementById("output");
const runButton = document.getElementById("runCode");

let uploadedFileURL = "";

// Initialize CodeMirror for syntax highlighting in the textarea
const codeArea = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "htmlmixed",        // Use 'htmlmixed' mode for HTML, CSS, JS highlighting
  lineNumbers: true,       // Show line numbers
  matchBrackets: true,     // Highlight matching brackets
  theme: "dracula",        // Optional: Apply the 'dracula' theme (or choose another)
  lineWrapping: true       // Enable line wrapping
});

// Handle Image Upload
imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    uploadedFileURL = fileURL;
    const fileExtension = file.name.split('.').pop();
    fileDetails.textContent = `File: ${file.name} (Extension: ${fileExtension})`;

    // Add HTML++ Syntax Example in Editor
    codeArea.setValue(codeArea.getValue() + `<img>${fileExtension} src="${fileURL}" alt="Uploaded Image"</img>\n`);
  } else {
    fileDetails.textContent = "No file selected.";
  }
});

// Parse and Run HTML++ Code
runButton.addEventListener("click", () => {
  let htmlCode = codeArea.getValue();

  // Command Parsing: Replace Custom Tags with Standard HTML
  htmlCode = htmlCode.replace(/<img>(.*?)<\/img>/g, (match, attributes) => {
    return `<img ${attributes}></img>`;
  });

  htmlCode = htmlCode.replace(/<videoEmbed>(.*?)<\/videoEmbed>/g, (match, attributes) => {
    return `<video ${attributes}></video>`;
  });

  htmlCode = htmlCode.replace(/<fontStyle>(.*?)<\/fontStyle>/g, (match, styles) => {
    const styleAttributes = styles.split(' ').map(attr => {
      const [key, value] = attr.split('=');
      if (key === "font") return `font-family: ${value};`;
      if (key === "color") return `color: ${value};`;
      if (key === "size") return `font-size: ${value};`;
      return "";
    }).join(" ");
    return `<span style="${styleAttributes}">`;
  });

  htmlCode = htmlCode.replace(/<textStyle>(.*?)<\/textStyle>/g, (match, styles) => {
    const styleAttributes = styles.split(' ').map(attr => {
      const [key, value] = attr.split('=');
      if (key === "bold" && value === "true") return "font-weight: bold;";
      if (key === "italic" && value === "true") return "font-style: italic;";
      if (key === "color") return `color: ${value};`;
      return "";
    }).join(" ");
    return `<span style="${styleAttributes}">`;
  });

  htmlCode = htmlCode.replace(/<tableCreate>(.*?)<\/tableCreate>/g, (match, attributes) => {
    const [rows, cols, border] = attributes.match(/rows="(\d+)"|cols="(\d+)"|border="(\d+)"/g) || [];
    const rowCount = rows ? rows.split('=')[1].replace(/"/g, '') : 3;
    const colCount = cols ? cols.split('=')[1].replace(/"/g, '') : 3;
    const borderWidth = border ? border.split('=')[1].replace(/"/g, '') : 1;

    let tableHTML = `<table border="${borderWidth}">`;
    for (let i = 0; i < rowCount; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < colCount; j++) {
        tableHTML += "<td>Cell</td>";
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</table>";
    return tableHTML;
  });

  htmlCode = htmlCode.replace(/<markdown>content="(.*?)"<\/markdown>/g, (match, markdown) => {
    return markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
  });

  htmlCode = htmlCode.replace(/<styleInject>(.*?)<\/styleInject>/g, (match, styles) => {
    return `<style>${styles}</style>`;
  });

  htmlCode = htmlCode.replace(/<embedContent>type="(.*?)" url="(.*?)"<\/embedContent>/g, (match, type, url) => {
    if (type === "youtube") {
      return `<iframe width="560" height="315" src="${url}" frameborder="0" allowfullscreen></iframe>`;
    }
    return "";
  });

  htmlCode = htmlCode.replace(/<codeBlock>language="(.*?)" content="(.*?)"<\/codeBlock>/g, (match, language, code) => {
    return `<pre><code>${code}</code></pre>`;
  });

  htmlCode = htmlCode.replace(/<formElement>(.*?)<\/formElement>/g, (match, attributes) => {
    return `<input ${attributes}>`;
  });

  // Render the Parsed HTML
  outputDiv.innerHTML = htmlCode;
});
