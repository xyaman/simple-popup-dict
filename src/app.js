const { getTokenizer } = require('./kuromoji-wrapper.js');

// Get all the web elements
let wordtitle = document.getElementById('word-title');
let wordmeaning = document.getElementById('word-meaning');

// Load jmdict
const jmdict = require('../public/jmdict.json');
const tokenizer = getTokenizer("dict/");

/**
  * Get the definition for a word and modify the Card
  * @param {string} word - The word to get the definition for, needs to be in the non-conjugated form
  * @returns {void}
**/
function getDefinitionForWord(word) {
  wordtitle = document.getElementById('word-title');
  wordmeaning = document.getElementById('word-meaning');

  // kanji can be empty
  let result = jmdict.words.filter(w => {
    let isvalid = false;
    if (w.kanji.length > 0) {
      isvalid = isvalid || w.kanji[0].text === word;
    }

    return isvalid || w.kana[0].text === word;
  });

  if (result.length === 0) {
    wordtitle.innerText = word;
    wordmeaning.innerText = "No definition found";
    return;
  }

  wordtitle.innerText = word;
  let parsedmeaning = "";

  for (let i = 0; i < result[0].sense[0].gloss.length; i++) {
    parsedmeaning += "> " + result[0].sense[0].gloss[i].text + '\n';
  }

  wordmeaning.innerText = parsedmeaning;
}


/**
  * Get the non-conjugated form of a word under the cursor, this function calls getDefinitionForWord
  * @param {MouseEvent} event - The mouse event to get the word under
    * @returns {void}
**/
function getWordUnderCursor(event) {
  let mouseElement = document.elementFromPoint(event.clientX, event.clientY);
  // get current word under the cursor
  let text = mouseElement.innerText;
  if (!text) return;

  tokenizer.then(tokenizer => {
    const entries = tokenizer.tokenize(text);
    if (entries.length === 0) return;

    const surfaceFormWords = entries.map(e => e.surface_form);

    const original_element = mouseElement.cloneNode(true);
    let output_html = "";

    // wrap every word in text with a span following words array
    let word_index = 0;
    let last_valid_start = 0;
    for (var i = 0; i < text.length; i++) {

      // just in case
      if (word_index >= surfaceFormWords.length) {
        break;
      }

      // let currentWord = original_element.innerHTML[last_valid_start + i];
      let currentWord = text.substring(last_valid_start, i + 1);

      if (currentWord === surfaceFormWords[word_index]) {
        // wrap the word
        let word = surfaceFormWords[word_index];

        //if (word_index === 73 || word_index === 74) {
        //  console.log("word:", word);
        //}

        let replacement = `<word index=${word_index}>${word}</word>`;
        output_html += replacement;

        // mouseElement.innerHTML = mouseElement.innerHTML.replace(word, replacement);

        word_index += 1;
        last_valid_start = i + 1;
      }
    }

    // we replace the original element with the new one
    mouseElement.innerHTML = output_html;

    let selected_word = document.elementFromPoint(event.clientX, event.clientY).getAttribute("index");
    mouseElement.replaceWith(original_element);

    if (!selected_word || !entries[selected_word]) return;

    // get the definition for the selected word (this modifies the DOM)
    getDefinitionForWord(entries[selected_word].basic_form);
  });
}

let shouldParse = false;
let currentX = 0;
let currentY = 0;

// only when alt is pressed we should lookfor the word
document.addEventListener('keydown', function(event) {
  if (event.key === 'Alt') {
    // document.mousemove = getWordUnderCursor();
    shouldParse = true;
    document.getElementById('key-indicator').innerText = "Dictionary is on";
  }
});

document.addEventListener('keyup', function(event) {
  // Pressing any key will stop the parsing
  shouldParse = false;
  document.getElementById('key-indicator').innerText = "Dictionary is off";
});

document.addEventListener('mousemove', function(event) {

  if (!shouldParse) return;
  // add some offset
  if (Math.abs(currentX - event.clientX) < 10 && Math.abs(currentY - event.clientY) < 10) return;
  currentX = event.clientX;
  currentY = event.clientY;

  getWordUnderCursor(event);
});
