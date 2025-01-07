#!/usr/bin/env node

// ==============================================
// © 2025 Lukas Baumert
// Automat ver3.4637483 – "KMP + Yargs + ?-Wildcard Overkill – Mk II!"
// Jetzt mit Chalk/Highlighting, schickerer Ausgabe UND Opposite-Funktion!
// ==============================================

import chalk from 'chalk';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// ----------------------------------------------
// 0) Yargs-Konfiguration
// ----------------------------------------------
const argv = yargs(hideBin(process.argv))
  .option('function', {
    alias: 'f',
    type: 'string',
    description: 'Funktion / Substring, das wir in den Stacks per KMP suchen (z.B. Fi, NiT, etc.)',
  })
  .option('slot', {
    alias: 's',
    type: 'number',
    description: 'Welchen Slot (1..4) wollen wir filtern? 1=Primär, 2=Sekundär, 3=Tertiär, 4=Inferior',
  })
  .option('mbti', {
    alias: 'm',
    type: 'string',
    description: 'MBTI-Wildcard (z.B. E?T?, ?N, EN?, usw.). "?" steht für genau einen beliebigen Buchstaben.',
  })
  .option('opposite', {
    alias: 'o',
    type: 'string',
    description: 'Zeigt den gegenteiligen MBTI-Typ des angegebenen Typs an (z.B. INFP => ESTJ).',
  })
  .help()
  .argv;

// ----------------------------------------------
// 1) Deine MBTI-Daten + Tools
// ----------------------------------------------
const mbtiStacks = {
  INFP: "FiNeSiTe",
  INFJ: "NiFeTiSe",
  INTP: "TiNeSiFe",
  INTJ: "NiTeFiSe",
  ISFP: "FiSeNiTe",
  ISFJ: "SiFeTiNe",
  ISTP: "TiSeNiFe",
  ISTJ: "SiTeFiNe",
  ENFP: "NeFiTeSi",
  ENFJ: "FeNiSeTi",
  ENTP: "NeTiFeSi",
  ENTJ: "TeNiSeFi",
  ESFP: "SeFiTeNi",
  ESFJ: "FeSiNeTi",
  ESTP: "SeTiFeNi",
  ESTJ: "TeSiNeFi",
};

// ACHTUNG: Jetzt 1-basierte Slots!
const posLookup = {
  1: "Primär",
  2: "Sekundär",
  3: "Tertiär",
  4: "Inferior",
};

// ----------------------------------------------
// 1.5) Opposite-Mapping
// ----------------------------------------------
const flipMap = {
  I: 'E', E: 'I',
  N: 'S', S: 'N',
  F: 'T', T: 'F',
  P: 'J', J: 'P'
};

function getOppositeMBTI(mbti) {
  return mbti
    .split('')
    .map(char => flipMap[char] || '?')
    .join('');
}

// ----------------------------------------------
// 2) KMP-Basics
// ----------------------------------------------
function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let length = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[length]) {
      length++;
      lps[i] = length;
      i++;
    } else {
      if (length !== 0) {
        length = lps[length - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  return lps;
}

function kmpSearch(text, pattern) {
  const lps = buildLPS(pattern);
  const matches = [];
  let i = 0; // Index im Text
  let j = 0; // Index im Pattern

  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        matches.push(i - j);
        j = lps[j - 1];
      }
    } else {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  return matches;
}

function kmpSearchCaseInsensitive(text, pattern) {
  return kmpSearch(text.toUpperCase(), pattern.toUpperCase());
}

function getSlotFunctions(stack) {
  // z.B. "FiNeSiTe" => ["Fi","Ne","Si","Te"]
  const result = [];
  for (let i = 0; i < 8; i += 2) {
    result.push(stack.slice(i, i + 2));
  }
  return result;
}

function computeSlotRange(startIndex, patternLength) {
  const lastIndex = startIndex + patternLength - 1;
  const slotStart = Math.floor(startIndex / 2) + 1;
  const slotEnd   = Math.floor(lastIndex  / 2) + 1;

  const slots = [];
  for (let s = slotStart; s <= slotEnd; s++) {
    slots.push(s);
  }
  return slots;
}

/**
 * findMbtiByFunctionKmpDetailedSlots: Sucht 'pattern' in allen MBTI-Stacks
 * und liefert { mbti, stack, matches: [ ... ] } inkl. Slot-Infos.
 */
function findMbtiByFunctionKmpDetailedSlots(pattern) {
  const results = [];
  for (const [mbti, stack] of Object.entries(mbtiStacks)) {
    const positions = kmpSearchCaseInsensitive(stack, pattern);
    if (positions.length > 0) {
      const slotFuncs = getSlotFunctions(stack);
      let matchDetails = positions.map((startIndex) => {
        const slotRange = computeSlotRange(startIndex, pattern.length);
        const slotNames = slotRange.map(slotIndex => {
          const humanName = posLookup[slotIndex] || `Slot${slotIndex}`;
          // slotIndex=1 => slotFuncs[0]
          const funcName = slotFuncs[slotIndex - 1];
          return `${humanName} (${funcName})`;
        });
        return {
          startIndex,
          coveredSlots: slotRange,
          slotNames
        };
      });

      // Sortiere intern
      matchDetails.sort((a,b) =>
        Math.min(...a.coveredSlots) - Math.min(...b.coveredSlots)
      );

      results.push({ mbti, stack, matches: matchDetails });
    }
  }
  // Sortiere global nach kleinstem Slot
  results.sort((a,b) => {
    const aMin = Math.min(...a.matches.flatMap(m => m.coveredSlots));
    const bMin = Math.min(...b.matches.flatMap(m => m.coveredSlots));
    return aMin - bMin;
  });
  return results;
}

// ----------------------------------------------
// 3) Filter & MBTI-Wildcards
// ----------------------------------------------
function filterBySlot(results, slotIndex) {
  return results
    .map(r => {
      const newMatches = r.matches.filter(m => m.coveredSlots.includes(slotIndex));
      return { ...r, matches: newMatches };
    })
    .filter(r => r.matches.length > 0);
}

function matchesMbtiQuestionPattern(pattern, mbtiType) {
  if (pattern.length > 4) return false; // maximal 4
  const patU = pattern.toUpperCase();
  const mbtiU = mbtiType.toUpperCase();
  for (let i = 0; i < patU.length; i++) {
    const pc = patU[i];
    const mc = mbtiU[i];
    if (pc === '?') continue;    // wildcard
    if (pc !== mc) return false; // mismatch
  }
  return true;
}

function findMbtiWildcard(pattern) {
  return Object.keys(mbtiStacks)
    .filter(mbti => matchesMbtiQuestionPattern(pattern, mbti));
}

// ----------------------------------------------
// 4) Chalk/Highlight-Funktionen
// ----------------------------------------------
import { createRequire } from 'module'; // Nur, wenn du es brauchst
// (Für die meisten Umgebungen sollte das nicht nötig sein, 
//  aber falls du z.B. ES Modules mit CommonJS mischst.)

function highlightAll(haystack, needle, colorFn = chalk.red) {
  if (!needle) return haystack;
  const needleEscaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Regex-Escaping
  const regex = new RegExp(needleEscaped, 'gi');
  return haystack.replace(regex, (match) => colorFn(match));
}

function printKmpResults(results, pattern) {
  console.log(chalk.bold(`\nTreffer für '${chalk.yellowBright(pattern)}':\n`));
  results.forEach((res) => {
    // MBTI
    const mbtiStyled = chalk.black.bgYellow(res.mbti);
    // Stack
    const stackStyled = chalk.underline.yellow(
      highlightAll(res.stack, pattern, chalk.bold.red)
    );

    console.log(chalk.bold(`\tMBTI.: ${mbtiStyled}\n\tStack: ${stackStyled}\n\t${chalk.dim("│")}`));
    res.matches.forEach((m) => {
      const covered = chalk.magenta(m.coveredSlots.join(", "));
      const slotNames = chalk.green(m.slotNames.join(", "));
      console.log(
        `\t${chalk.dim('└─ Kognitive Funktion(en):')}\n\t   Position ${covered} - ${slotNames}`
      );
    });
    console.log("");
  });
}

// ----------------------------------------------
// 5) Haupt-Logik (Kombination Yargs + alter Flow + Opposite-Ausgabe)
// ----------------------------------------------
(function main() {
  // 1) Prüfen, ob jemand --opposite eingegeben hat
  if (argv.opposite) {
    const original = argv.opposite.toUpperCase();
    if (!mbtiStacks[original]) {
      console.log(chalk.red(`Unbekannter MBTI-Typ bei --opposite: '${argv.opposite}'.`));
      process.exit(1);
    }
    const opposite = getOppositeMBTI(original);
    if (!mbtiStacks[opposite]) {
      console.log(chalk.yellow(`Wir haben zwar einen Flip-Typ (${opposite}), aber ihn nicht in unserer Datenbank. Möglicherweise untypischer Flip?`));
    }

    console.log(chalk.bold.magenta("\nOpposite-Funktion aktiv!"));
    console.log(chalk.cyan(`Eingegebener Typ: ${chalk.bgYellow.black(original)} → Stack: ${mbtiStacks[original]}`));
    console.log(chalk.cyan(`Opposite Typ....: ${chalk.bgYellow.black(opposite)} → Stack: ${mbtiStacks[opposite] || "???"}`));
    console.log(chalk.dim("----------------------------------------------------------------\n"));
    // Danach endet das Programm (oder du lässt es weiterlaufen; 
    // hier brechen wir ab, weil user nur Opposite wollte).
    return;
  }

  // 2) Checken, ob yargs-Optionen (funktion, slot, mbti) benutzt wurden
  const hasYargsInput = (argv.mbti || argv.function || typeof argv.slot !== 'undefined');

  if (hasYargsInput) {
    // ------------------------------------------
    // NEUER MODUS (Yargs): Kaskadierte Filter
    // ------------------------------------------
    let candidateMbtis = Object.keys(mbtiStacks);

    // (A) MBTI-Wildcard
    if (argv.mbti) {
      const matched = findMbtiWildcard(argv.mbti);
      candidateMbtis = matched;
      console.log(chalk.blueBright(`MBTI-Wildcard '${argv.mbti}' =>`), matched);
      if (matched.length === 0) {
        console.log(chalk.red("Keine MBTI-Typen matchen die Wildcard."));
      }
    }

    // (B) function-Suche
    if (argv.function) {
      let results = findMbtiByFunctionKmpDetailedSlots(argv.function);
      // Nur MBTIs behalten, die obiges Wildcard-Filtern überstanden
      results = results.filter(r => candidateMbtis.includes(r.mbti));

      // (C) Slot-Filter
      if (typeof argv.slot === 'number') {
        results = filterBySlot(results, argv.slot);
      }

      if (results.length === 0) {
        console.log(chalk.red(`Keine Treffer für function='${argv.function}'` +
          (argv.slot!==undefined?` + slot=${argv.slot}`:'')));
      } else {
        console.log(chalk.bold(`Treffer (nach evtl. MBTI-Wildcard + Funktions-Suche${argv.slot!==undefined?` + Position = ${argv.slot}`:''}):`));
        printKmpResults(results, argv.function);
      }
    } else {
      // Nur --mbti=... ohne --function
      if (argv.mbti) {
        console.log(chalk.blueBright("Endgültige MBTI-Liste nach Wildcard:"), candidateMbtis);
      }
      // Falls nur --slot=3 ohne function => meckern
      if (!argv.mbti && typeof argv.slot === 'number') {
        console.log(chalk.yellow("Hinweis: --slot ohne --function hat keine Wirkung (keine Funktionssuche)."));
      }
    }

  } else {
    // -----------------------------------
    // ALTER MODUS: argv._[0]
    // -----------------------------------
    const input = argv._[0];
    if (!input) {
      console.log(chalk.gray("Bitte ein Argument angeben (z.B. 'INFP') oder yargs-Optionen verwenden (--function=Fi). Siehe --help."));
      return;
    }
    const mbtiKey = input.toUpperCase();
    if (mbtiStacks[mbtiKey]) {
      // Eindeutig MBTI
      console.log(chalk.greenBright(`Input ist ein MBTI-Typ.`));
      console.log(
        chalk.bold(
          `\n\tMBTI.: ${chalk.black.bgYellow(mbtiKey)}\n\tStack: ${chalk.underline.yellow(mbtiStacks[mbtiKey])}`
        )
      );
    } else {
      // Pattern-Suche
      const results = findMbtiByFunctionKmpDetailedSlots(input);
      if (results.length > 0) {
        console.log(chalk.bold(`Input '${chalk.yellow(input)}' wurde als Kognitive Funktion interpretiert. Ergebnisse:`));
        printKmpResults(results, input);
      } else {
        console.log(chalk.red(`Weder MBTI-Typ noch Pattern gefunden für '${input}' – sorry!`));
      }
    }
  }
})();
