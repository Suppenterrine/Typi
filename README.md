# Typologe

> Typologe – Eine leistungsstarke und flexible App zur Analyse und Suche von MBTI-Typen und kognitiven Funktionen. Unterstützt Mustererkennung, Wildcards, Gegentyp-Finder und detaillierte Filter für Stacks und Positionen. Ideal für Typologie-Enthusiasten, Studierende und Entwickler.

Saßt du schonmal mit deinem Caipi am Strand und hattest das dringende Bedürfnis schnell herauszufinden wie die Kognitiven Funktionen deines MBTI-Typen aussehen? Oder was der gegenteilige Typ zu deinem ist?
Und stell dir bloß vor, du könntest mal schnell filtern, welche Typen, welche Funktionen teilen...
Hast du ein Glück **Typologe** gefunden zu haben. Genau für diese Momente ist es konzipiert.

Für wen ist die App? Alle. Jeden der Spaß an Typologie hat oder gerne eine schnelle Alternative hat, statt sich durch Millionen-Websites zu wühlen.

## Was und Warum?
Gute Frage. <br>
**Was**: Kleine fixe Konsolen-App um sich schnell durch alle MBTI-Typen zu arbeiten, Zusammenhänge zu finden, oder sich einen Überblick zu verschaffen. <br>
**Warum**: Aus persönlichem Bedarf. Und weil es ein spaßiges Projekt war eine relativ simple Anforderung völlig zu überkomplexisisieren und etwas über Schnelligkeit und interessante Algorithmen zu lernen.<br>

---

## 🚀 **Features**
- **Wildcard-Power**: Durchsuche MBTI-Typen mit `?` (z.B. `?N??` für alle intuitiven Typen).
- **Blitzschnelle Suche**: Finde kognitive Funktionen in jedem MBTI-Stack. (Unnötig overengineered mit KMP-Algorithmus)
- **Slot-Fokus**: Filtere Funktionen nach ihrer Position (Primär, Sekundär, etc.).
- **Opposite-Finder**: Finde den Gegentyp eines jeden MBTI-Typs (z.B. `INFP` → `ESTJ`).
- **Farbige, strukturierte Ausgabe**: Weil deshalb. Muss ja nicht immer alles schlimm aussehen.

---

## 🛠️ **Installation**
### 1. Mit **npm**
```powershell
npm install -g typologe
```

### 2. Ausführen mit **npx** (ohne Installation)
```powershell
npx typologe
```

### 3. Lokale Nutzung
Falls du den Code selbst klonen willst:
```powershell
git clone https://github.com/Suppenterrine/Typi.git
cd typologe
npm install (oder `bun install`)
node main.js
```

---

## 💡 **Wie benutzen?**
**Typologe** macht es dir einfach, genau das zu finden, was du suchst. Hier sind ein paar Beispiele:

### **1. MBTI-Typ anzeigen**
```powershell
typologe INFP
```
Ausgabe:
```plaintext
MBTI-Typ: INFP
Stack: FiNeSiTe
```

### **2. Gegentyp finden**
```powershell
typologe -o INFP
```
Ausgabe:
```plaintext
Gegenteiliger MBTI-Typ: ESTJ
Stack: TeSiNeFi
```

### **3. Funktionen durchsuchen**
Finde MBTI-Typen, die eine bestimmte Funktion oder ein Muster enthalten:
```powershell
typologe -f Fi
```

### **4. Slot-spezifische Suche**
Suchst du eine Funktion in einem bestimmten Slot? Kein Problem:
```powershell
typologe -f Fi -s 2
```
➡️ Zeigt alle Typen, bei denen `Fi` in Slot 2 (Sekundär) vorkommt.

### **5. Wildcard-MBTI-Typen**
Benutze `?`, um nach bestimmten Buchstabenkombinationen zu filtern:
```powershell
typologe -m ?N??
```
➡️ Findet alle MBTI-Typen, die mit einem beliebigen Buchstaben starten und `N` an zweiter Stelle haben.

### **6. Kombinierte Filter**
Du kannst Optionen kombinieren, um deine Suche zu verfeinern:
```powershell
typologe -m ?ST? -f Fi -s 3
```
➡️ Zeigt alle `?ST?`-Typen, bei denen `Fi` in Slot 3 (Tertiär) vorkommt.

---

## 📖 **Options**
| Option           | Beschreibung                                                                                       | Beispiel                                 |
|-------------------|---------------------------------------------------------------------------------------------------|-----------------------------------------|
| `-f`, `--function` | Suche nach einer Funktion oder einem Substring in den Stacks                                      | `typologe -f Fi`                            |
| `-s`, `--slot`    | Filtere nach Slot-Position (1=Primär, 2=Sekundär, 3=Tertiär, 4=Inferior)                           | `typologe -f Fi -s 3`                       |
| `-m`, `--mbti`    | Suche mit Wildcards (`?` ersetzt genau einen Buchstaben)                                           | `typologe -m ?N??`                          |
| `-o`, `--opposite`| Finde den gegenteiligen MBTI-Typ                                                                  | `typologe -o INFP`                          |
| `--help`          | Zeigt die Hilfe an                                                                                | `typologe --help`                           |

---

## 🖌️ **Farbige Ausgabe**
Dank **[chalk](https://www.npmjs.com/package/chalk)** hebt **Typologe** wichtige Informationen hervor.

---

## ❤️ **Lizenz**
Typologe ist unter der **Creative Commons BY-NC 4.0** lizenziert. Das heißt:  
- Private und educational Nutzung ist erlaubt.  
- Verkauf und kommerzielle Nutzung sind nicht gestattet.  

### Todos
- [ ] Add GPT Prompts with filter concept
- [ ] Add explanations for cognitive functions

--- 


<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/Suppenterrine/Typi">Typologe</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/Suppenterrine">Lukas Baumert</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt=""></a></p>
