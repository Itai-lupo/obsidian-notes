const startString = input[0]
const endString = input[1]

/*
```dataviewjs
dv.view('/Bins/js/remove_html', ["# content\n", "\n## links\n"] )
```*/

/*
```dataviewjs
dv.view('/Bins/js/remove_html', ["# content
", "
## links
"] )
```*/

const toRemove = `\`\`\`dataviewjs \ndv.view('/Bins/js/remove_html',  ["${startString}",  "${endString}"] ) \n\`\`\``
const content = await dv.io.load(dv.current().file.path)
const contentToChangeStart = content.indexOf(startString)
const contentToChangeEnd = content.lastIndexOf(endString)

const res =
    content.substring(0, contentToChangeStart) +
    content.substring(contentToChangeStart, contentToChangeEnd).replaceAll("\<", "\\<").replaceAll("\>", "\\>").replace(toRemove, "") +
    content.substring(contentToChangeEnd);


const fs = require('fs');

fs.writeFile(app.vault.adapter.basePath + "/" + dv.current().file.path, res, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
