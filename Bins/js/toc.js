// Set this to 1 if you want to include level 1 headers,
// or set it to 2 if you want to ignore level 1 headers

const startAtLevel = input
const content = await dv.io.load(dv.current().file.path)
const toc = content.match(new RegExp(`^#{${startAtLevel},} [^\n]{0,}`, 'gm'))
  .map(heading => {
    const [_, level, text] = heading.match(/^(#+) (.+)$/)
    const link = '#' + text.trim()

    return '\t'.repeat(level.length - startAtLevel) + `- [[${link}|${text.trim()}]]`
  })

dv.paragraph(toc.join('\n').trim())

