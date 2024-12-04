# HTML++ Editor

HTML++ is a markup language that extends HTML with extra features. The HTML++ editor allows real-time code writing and execution, supporting image uploads, custom tags, embedded media, tables, markdown, and more.

## Features

- **Image Upload**: Upload images with `<input type="file">`, automatically embedding them as `<img>` tags.
    ```html
    <img src="image-url" alt="Uploaded Image">
    ```

- **HTML++ Tags**:
    ```html
    <videoEmbed src="video-url" controls></videoEmbed> <!-- Embeds videos -->
    <fontStyle font="Arial" color="blue" size="16px">Text</fontStyle> <!-- Applies font styles -->
    <textStyle bold="true" italic="true" color="red">Styled Text</textStyle> <!-- Text styling -->
    <tableCreate rows="3" cols="3" border="1"></tableCreate> <!-- Creates tables -->
    <markdown>content="**Bold** and *Italic* Text"</markdown> <!-- Converts markdown -->
    <styleInject>body { background-color: #f0f0f0; }</styleInject> <!-- Injects CSS -->
    <embedContent type="youtube" url="video-url"></embedContent> <!-- Embeds external content -->
    <codeBlock language="html" content="<div>Code</div>"></codeBlock> <!-- Code syntax highlighting -->
    <formElement type="text" name="username" placeholder="Enter Username"></formElement> <!-- Form elements -->
    <tableCreate rows="2" cols="3" border="2"></tableCreate>
    <embedContent type="youtube" url="https://youtube.com/watch?v=dQw4w9WgXcQ"></embedContent>
    
    ```

## Usage

1. **Write Code**: Enter HTML++ or standard HTML.
2. **Upload Image**: Upload and embed images.
3. **Run Code**: Click "Run Code" to render the output.
