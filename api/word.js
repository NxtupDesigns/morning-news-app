const fallbackDictionary = {
  climate: { meaning: "the usual weather in a place over a long time", translation: "Klima" },
  summit: { meaning: "an important meeting between leaders", translation: "Gipfeltreffen" },
  cooperation: { meaning: "working together with other people", translation: "Zusammenarbeit" },
  energy: { meaning: "power used for heat, light, or movement", translation: "Energie" },
  economy: { meaning: "the money and business system of a country", translation: "Wirtschaft" },
  support: { meaning: "help that is given to someone", translation: "Unterstützung" },
  government: { meaning: "the people who run a country", translation: "Regierung" },
  income: { meaning: "money that a person earns", translation: "Einkommen" },
  president: { meaning: "the leader of a country in some systems", translation: "Präsident" },
  crisis: { meaning: "a very difficult or dangerous situation", translation: "Krise" },
  war: { meaning: "fighting between countries or large groups", translation: "Krieg" },
  attack: { meaning: "a violent act against someone or something", translation: "Angriff" }
};

function cleanWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/[^a-z'-]/g, "")
    .trim();
}

export default async function handler(req, res) {
  const rawWord = Array.isArray(req.query.word) ? req.query.word[0] : req.query.word;
  const word = cleanWord(rawWord);

  if (!word) {
    return res.status(400).json({ error: "Missing word" });
  }

  let meaning =
    fallbackDictionary[word]?.meaning ||
    `No short explanation found for "${word}".`;
  let translation =
    fallbackDictionary[word]?.translation ||
    "Keine Übersetzung gefunden";
  let partOfSpeech = "";

  try {
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (dictRes.ok) {
      const dictData = await dictRes.json();
      const firstEntry = Array.isArray(dictData) ? dictData[0] : null;
      const firstMeaning = firstEntry?.meanings?.[0];
      const firstDefinition = firstMeaning?.definitions?.[0]?.definition;

      if (firstDefinition) meaning = firstDefinition;
      if (firstMeaning?.partOfSpeech) partOfSpeech = firstMeaning.partOfSpeech;
    }
  } catch (error) {
    console.error("Dictionary lookup failed:", error);
  }

  try {
    const translationRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|de`
    );

    if (translationRes.ok) {
      const translationData = await translationRes.json();

      const translatedText = translationData?.responseData?.translatedText;
      const bestMatch = translationData?.matches?.find(
        (item) =>
          item?.translation &&
          item.translation.toLowerCase() !== word.toLowerCase()
      );

      if (
        translatedText &&
        translatedText.toLowerCase() !== word.toLowerCase()
      ) {
        translation = translatedText;
      } else if (bestMatch?.translation) {
        translation = bestMatch.translation;
      }
    }
  } catch (error) {
    console.error("Translation lookup failed:", error);
  }

  return res.status(200).json({
    word,
    meaning,
    translation,
    partOfSpeech
  });
}
