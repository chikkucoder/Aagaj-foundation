// English to Hindi Devanagari Transliteration Utility for Names

const DICTIONARY = {
  // Common Titles & Suffixes
  "DEVI": "देवी",
  "KUMARI": "कुमारी",
  "KUMAR": "कुमार",
  "SHARMA": "शर्मा",
  "SINGH": "सिंह",
  "RAJAK": "रजक",
  "CHAUDHARY": "चौधरी",
  "CHOUDHARY": "चौधरी",
  "MAHTO": "महतो",
  "MAHATO": "महतो",
  "YADAV": "यादव",
  "PASWAN": "पासवान",
  "MANJHI": "मांझी",
  "GUPTA": "गुप्ता",
  "VERMA": "वर्मा",
  "PANDEY": "पांडेय",
  "MISHRA": "मिश्रा",
  "TIWARI": "तिवारी",
  "JHA": "झा",
  "JHAA": "झा",
  "THAKUR": "ठाकुर",
  "ROY": "राय",
  "RAI": "राय",
  "PRASAD": "प्रसाद",
  "PAL": "पाल",
  "SAH": "साह",
  "SAHU": "साहू",
  "DAS": "दास",
  "PANDIT": "पंडित",
  "MANDAL": "मंडल",
  "SAFI": "साफ़ी",
  "BAITHA": "बैठा",
  "RAM": "राम",
  "SHAH": "शाह",
  "ALAM": "आलम",
  "KHAN": "खान",

  // Common First Names (Female)
  "KHUSBOO": "खुशबू",
  "KHUSHBOO": "खुशबू",
  "POOJA": "पूजा",
  "PUJA": "पूजा",
  "RINKU": "रिंकू",
  "LALTI": "लालती",
  "INDU": "इंदु",
  "SANJU": "संंजू",
  "KAVITA": "कविता",
  "KHUSHI": "खुशी",
  "BABITA": "बबिता",
  "ANJALI": "अंजलि",
  "PRIYA": "प्रिया",
  "NEHA": "नेहा",
  "PINKI": "पिंकी",
  "PINKY": "पिंकी",
  "SUMAN": "सुमन",
  "REENA": "रीना",
  "RINA": "रीना",
  "SUNITA": "सुनीता",
  "GEETA": "गीता",
  "GITA": "गीता",
  "MONIKA": "मोनिका",
  "PRIYANKA": "प्रियंका",
  "SEEMA": "सीमा",
  "REKHA": "रेखा",
  "ANITA": "अनीता",
  "SITA": "सीता",
  "SARITA": "सरिता",
  "RADHA": "राधा",
  "MADHU": "मधु",
  "ARTI": "आरती",
  "AARTI": "आरती",
  "JYOTI": "ज्योति",
  "KAUSHALYA": "कौशल्या",
  "MANJU": "मंजू",
  "MAMTA": "ममता",
  "REETA": "रीता",
  "RITA": "रीता",
  "SANTOSH": "संतोष",
  "SAPNA": "सपना",
  "NIBHA": "निभा",
  "SUSHMA": "सुषमा",
  "SHOBHA": "शोभा",
  "CHANDA": "चंदा",
  "PRATIMA": "प्रतिमा",
  "USHA": "उषा",
  "NISHA": "निशा",
  "ASHA": "आशा",
  "RANJU": "रंजू",
  "KUSUM": "कुसुम",
  "NILAM": "नीलम",
  "NEELAM": "नीलम",
  "POONAM": "पूनम",
  "SAVITRI": "सावित्री",
  "SHANTI": "शांति",
  "MALTI": "मालती",
  "GAYATRI": "गायत्री",
  "PARVATI": "पार्वती",
  "DURGA": "दुर्गा",
  "VIMLA": "विमला",
  "SUMITRA": "सुमित्रा",
  "LAXMI": "लक्ष्मी",
  "LAKSHMI": "लक्ष्मी",
  "SARASWATI": "सरस्वती",
  "RADHIKA": "राधिका",
  "SHARDA": "शारदा",
  "KAMLA": "कमला",
  "SHEELA": "शीला",
  "CHAMPA": "चंपा",
  "LALITA": "ललिता",
  "BINDU": "बिंदु",
  "MEENA": "मीना",
  "SUDHA": "सुधा",
  "SANGEETA": "संगीता",
  "ANJU": "अंजू",
  "SAMPATTI": "संपत्ति",
  "SULEKHA": "सुलेखा",
  "BABY": "बेबी",
  "DOLLY": "डॉली",
  "SONI": "सोनी",
  "MONI": "मोनी",
  "ROSHNI": "रोशनी",
  "JUHI": "जूही",
  "KAJAL": "काजल",
  "PAYAL": "पायल",
  "SHALINI": "शालिनी",
  "SWATI": "स्वाति",
  "KIRAN": "किरण",
  "SMITA": "स्मिता",
  "SNEHA": "स्नेहा",
  "NIDHI": "निधि",
  "ANANYA": "अनन्या",
  "AANCHAL": "आंचल",
  "SHIKHA": "शिखा",
  "PREETI": "प्रीति",
  "PRITI": "प्रीति",
  "DIPTI": "दीप्ति",
  "DEEPTI": "दीप्ति",
  "ARCHANA": "अर्चना",
  "VANDANA": "वंदना",
  "SADHNA": "साधना",
  "ROOPAM": "रूपम",
  "SONAM": "सोनम",
  "RUPA": "रूपा",
  "ROOPA": "रूपा",
  "BELA": "बेला",
  "CHHOTI": "छोटी",

  // Common First Names (Male)
  "BABLU": "बबलू",
  "AJAY": "अजय",
  "KARU": "करू",
  "RAMESH": "रमेश",
  "RAHUL": "राहुल",
  "SUNIL": "सुनील",
  "ANKIT": "अंकित",
  "ALOK": "आलोक",
  "SATYENDRA": "सत्येंद्र",
  "VIKAS": "विकास",
  "VIKASH": "विकास",
  "AMIT": "अमित",
  "DEEPAK": "दीपक",
  "MOHAN": "मोहन",
  "SURAJ": "सूरज",
  "VIJAY": "विजय",
  "SANJAY": "संजय",
  "RAKESH": "राकेश",
  "DINESH": "दिनेश",
  "RAJESH": "राजेश",
  "SURESH": "सुरेश",
  "MUKESH": "मुकेश",
  "MANOJ": "मनोज",
  "ANIL": "अनिल",
  "PANKAJ": "पंकज",
  "PAWAN": "पवन",
  "RAVI": "रवि",
  "SHIV": "शिव",
  "SHYAM": "श्याम",
  "KRISHNA": "कृष्णा",
  "SATYAM": "सत्यम",
  "SHUBHAM": "शुभम",
  "SHIVAM": "शिवम",
  "VIVEK": "विवेक",
  "ABHISHEK": "अभिषेक",
  "SUMIT": "सुमित",
  "NITISH": "नीतीश",
  "SUJEET": "सुजीत",
  "RANJEET": "रणजीत",
  "UPENDRA": "उपेंद्र",
  "DHIRENDRA": "धीरेंद्र",
  "JITENDRA": "जितेंद्र",
  "NARENDRA": "नरेंद्र",
  "RABINDRA": "रवींद्र",
  "RAVINDRA": "रवींद्र",
  "MAHESH": "महेश",
  "GANESH": "गणेश",
  "SONU": "सोनू",
  "MONU": "मोनू",
  "PAPPU": "पप्पू",
  "GUDDU": "गुड्डू",
  "RAJU": "राजू",
  "CHHOTU": "छोटू",
  "BHOLA": "भोला",
  "CHANDAN": "चंदन",
  "KUNDAN": "कुंदन",
  "RAUSHAN": "रौशन",
  "ROSHAN": "रौशन",
  "SAURABH": "सौरभ",
  "GAURAV": "गौरव"
};

// Fallback Rule-Based Transliteration Function
const fallbackPhoneticTransliterate = (word) => {
  if (!word) return "";
  let str = word.toLowerCase();

  // Multi-character consonant patterns
  const consonantMap = [
    ["ksha", "क्ष"], ["gya", "ज्ञ"], ["dya", "द्य"], ["tra", "त्र"],
    ["chh", "छ"], ["shh", "ष"], ["kh", "ख"], ["gh", "घ"], ["ch", "च"],
    ["jh", "झ"], ["th", "थ"], ["dh", "ध"], ["ph", "फ"], ["bh", "भ"],
    ["sh", "श"], ["wh", "व"], ["rh", "ढ़"],
    ["k", "क"], ["g", "ग"], ["j", "ज"], ["t", "त"], ["d", "द"],
    ["n", "न"], ["p", "प"], ["f", "फ"], ["b", "ब"], ["m", "म"],
    ["y", "य"], ["r", "र"], ["l", "ल"], ["v", "व"], ["w", "व"],
    ["s", "स"], ["h", "ह"], ["z", "ज़"]
  ];

  const vowelMap = [
    ["ai", "ै"], ["au", "ौ"], ["ou", "ौ"], ["ee", "ी"], ["oo", "ू"],
    ["aa", "ा"], ["ae", "े"], ["ea", "ी"], ["ie", "ी"], ["ei", "ी"],
    ["a", "ा"], ["i", "ि"], ["u", "ु"], ["e", "े"], ["o", "ो"]
  ];

  let result = "";
  let i = 0;
  while (i < str.length) {
    let matched = false;

    // Check consonants
    for (const [eng, hin] of consonantMap) {
      if (str.startsWith(eng, i)) {
        result += hin;
        i += eng.length;

        // Check following vowel
        let vowelMatched = false;
        for (const [vEng, vHin] of vowelMap) {
          if (str.startsWith(vEng, i)) {
            // Add vowel sign
            result += vHin;
            i += vEng.length;
            vowelMatched = true;
            break;
          }
        }

        matched = true;
        break;
      }
    }

    if (!matched) {
      // Check starting vowel (independent vowel)
      const indVowels = [
        ["aa", "आ"], ["ai", "ऐ"], ["au", "औ"], ["ee", "ई"], ["oo", "ऊ"],
        ["a", "अ"], ["i", "इ"], ["u", "उ"], ["e", "ए"], ["o", "ओ"]
      ];
      for (const [vEng, vHin] of indVowels) {
        if (str.startsWith(vEng, i)) {
          result += vHin;
          i += vEng.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // If character is punctuation, space, or number, copy as is
      result += str[i];
      i++;
    }
  }

  return result;
};

/**
 * Transliterates an English name string into Hindi Devanagari Script.
 * Example: "KHUSBOO DEVI" -> "खुशबू देवी"
 */
export const transliterateToHindi = (englishName) => {
  if (!englishName || typeof englishName !== "string") return "";

  // Check if string already contains Hindi Devanagari characters
  if (/[\u0900-\u097F]/.test(englishName)) {
    return englishName.trim();
  }

  const words = englishName.trim().toUpperCase().split(/\s+/);
  const hindiWords = words.map(w => {
    if (DICTIONARY[w]) {
      return DICTIONARY[w];
    }
    // Check dictionary with stripped trailing punctuation or suffixes
    const cleanWord = w.replace(/[^A-Z]/g, "");
    if (DICTIONARY[cleanWord]) {
      return DICTIONARY[cleanWord];
    }
    return fallbackPhoneticTransliterate(w);
  });

  return hindiWords.join(" ");
};
