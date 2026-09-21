# GoTraxx AI / Aida Console — Specifica di reimplementazione UI + funzionale

> **Obiettivo:** ricreare in clean-room l’interfaccia mostrata nei 4 screenshot forniti, mantenendo layout, gerarchia visiva, posizione delle icone, stati, interazioni e comportamento del Playground Aida. La documentazione ufficiale GoTraxx è usata per il contratto Aida; gli screenshot restano la fonte primaria per il rendering.
>
> **Target visuale:** desktop, light theme, viewport di riferimento ~2048 px di larghezza. Le misure riportate come “misurate” hanno tolleranza ±2–4 px perché ricavate dai raster forniti.
>
> **Importante:** barra del browser, cornice della finestra e riquadro webcam presenti in alcuni screenshot **non fanno parte dell’app** e non devono essere implementati.

---

## 0. Livelli di certezza della specifica

Questa specifica separa tre categorie:

- **[S] Screenshot-verificato**: elemento o comportamento direttamente visibile nei file forniti.
- **[D] Documentazione ufficiale**: comportamento confermato dalla documentazione GoTraxx.
- **[I] Implementazione inferita**: comportamento necessario per rendere il clone completo ma non documentato pubblicamente o non mostrato aperto negli screenshot.

Per una replica “uguale” lato utente, gli elementi [S] vanno trattati come vincoli rigidi. Gli elementi [D] vanno implementati secondo il contratto ufficiale. Gli elementi [I] devono imitare l’esperienza osservata senza inventare endpoint GoTraxx privati.

---

# 1. Architettura generale dell’app

## 1.1 Shell desktop [S]

La UI è composta da:

```text
┌──────────────────── Sidebar fissa ────────────────────┬──────────────────────── Main area ────────────────────────┐
│ logo + collapse                                      │ pagina / playground                                     │
│ Home                                                 │                                                         │
│ Playground                                           │                                                         │
│ Usage                                                │                                                         │
│ API Keys                                             │                                                         │
│ Documentation ↗                                     │                                                         │
│                                                      │                                                         │
│                                                      │                                                         │
│ account / organization                        ⌃      │                                                         │
└──────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

### Dimensioni di riferimento

| Token | Valore target | Note |
|---|---:|---|
| `--sidebar-width` | **342–344 px** | divider misurato a x≈341 su screenshot 2048 px; usare 344 px CSS come baseline |
| `--app-bg` | `#FFFFFF` | area principale |
| `--sidebar-bg` | `#FAFAFA` | campionamento screenshot ≈ RGB(250,250,250) |
| `--page-padding-x` | **44 px** | titolo Usage/API Keys circa 44 px a destra del divider |
| `--topbar-height` | **54–56 px** | Playground |
| `--nav-row-height` | **46–48 px** | sidebar |
| `--nav-radius` | **8 px** | voce selezionata |
| `--hairline` | `#E7E7E7` / 1 px | separatori |

La sidebar resta fissa; il main occupa `calc(100vw - var(--sidebar-width))`.

---

# 2. Design tokens

## 2.1 Colori [S]

```css
:root {
  --bg: #ffffff;
  --sidebar: #fafafa;
  --surface-muted: #f3f3f3;
  --surface-hover: #f0f0f0;
  --nav-active: #e8e8e8;
  --border: #e6e6e6;
  --border-soft: #eeeeee;

  --text: #111111;
  --text-2: #555555;
  --muted: #8a8a8a;
  --muted-2: #a4a4a4;

  --button-dark: #2e2e2e;
  --button-dark-hover: #1f1f1f;
  --button-text: #ffffff;

  --usage-blue: #78a0f0;   /* campionato dal grafico */
  --usage-green: #98c868;  /* campionato dal grafico */

  --success-bg: #e8fbdc;
  --success-text: #6a9844;

  --noul-true: #46b64f;
  --noul-false: #f39a2f;
  --link: #1259ff;
}
```

## 2.2 Tipografia [S/I]

La UI usa un sans neutro ad alta leggibilità e un mono per JSON/risultati.

Baseline consigliata per avvicinarsi al raster:

```css
--font-ui: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

Taglie:

| Uso | Font size | Weight |
|---|---:|---:|
| nav sidebar | 20–22 px | 400 |
| page title piccolo (`Usage`, `API keys`, `Playground`) | 20–22 px | 400 |
| section title (`State`, `Questions`) | 18–20 px | 400 |
| large hero `Learn to GoTraxx` | 52–58 px | 400 |
| table header | 14–16 px | 400 |
| table cell | 17–19 px | 400 |
| editor | 17–19 px | 400 mono |
| result question | 17–19 px | 400 mono |

Non usare bold pesante salvo wordmark, titoli delle card e CTA.

---

# 3. Iconografia e posizionamento

Per una ricostruzione pulita si possono usare icone Lucide equivalenti, mantenendo `stroke-width` 1.6–1.9 e size 20–24 px. Se si dispone degli SVG originali GoTraxx autorizzati, sostituire le equivalenti Lucide mantenendo gli stessi bounding box.

## 3.1 Sidebar [S]

| Posizione | Icona visiva | Equivalente consigliato | Funzione |
|---|---|---|---|
| logo, alto sinistra | simbolo GoTraxx + `GOTRAXX AI` | asset brand | home/brand |
| alto destra sidebar | rettangolo/pannello con freccia | `PanelLeftClose` | comprime/espande sidebar [I] |
| Home | casa | `House` | route Home |
| Playground | beuta | `FlaskConical` | route Playground |
| Usage | grafico lineare | `ChartNoAxesColumnIncreasing` o `ChartLine` | route Usage |
| API Keys | chiave | `KeyRound` | route API Keys |
| Documentation | libro aperto | `BookOpen` | link documentazione |
| destra Documentation | freccia diagonale | `ExternalLink` | segnala apertura esterna |
| account footer | avatar tondo con iniziali | custom | menu account/organization |
| destra account | chevron su | `ChevronUp` | apre menu account |

### Posizione sidebar

- logo: ~24 px dal bordo sinistro, ~24–28 px dall’alto.
- collapse: allineato a destra, ~24 px dal divider.
- navigazione: inizia dopo il blocco logo; gap verticale quasi nullo, una voce per riga.
- voce selezionata: margine laterale ~12 px, background `#E8E8E8`, radius 8 px.
- footer account: pinned `bottom: 18–22px`.

---

# 4. Sidebar — comportamento esatto

## 4.1 Navigazione [S]

Ordine invariabile:

```text
Home
Playground
Usage
API Keys
Documentation ↗
```

La route attiva ha sfondo grigio chiaro pieno. Le altre restano trasparenti.

`Documentation` deve aprire `docs.gotraxx.ai` in una nuova tab; l’icona `ExternalLink` rimane a destra della riga.

## 4.2 Account footer [S/I]

Rendering:

```text
[ BM ]  Bernardo Mascellani      ⌃
        Bernardo's org
```

oppure, nell’altro screenshot:

```text
[ F ]   flavio@flaviocopes.com   ⌃
        flavio@flaviocopes.com
```

Il contenuto viene dai dati sessione. Clic su riga o chevron apre un menu account/organization [I].

---

# 5. Playground — struttura visiva

## 5.1 Route

`/playground`

## 5.2 Header principale [S]

Altezza 54–56 px, bordo inferiore 1 px.

Da sinistra verso destra:

```text
[Flask] Playground                     Clear   [link] Share   [layout A] [layout B]
```

### Comandi

**Playground label**
- icona beuta 20–22 px.
- testo muted/gray, peso regular.

**Clear** [S/I]
- resetta `state`, `questions`, errori di validazione e `response`.
- se non c’è nulla da cancellare appare grigio/disabilitato, come nello screenshot iniziale.

**Share** [S/I]
- icona `Link2` a sinistra del testo.
- genera un link condivisibile che ricostruisce state, questions e modelli selezionati.
- implementazione clone raccomandata: POST a `/api/shares`, salva payload JSON, ritorna id breve; URL `.../playground?share=<id>`.
- non inserire mai API key nel link.

**Due icone layout** [S]
- due pulsanti quadrati ~48×48 px.
- icone rappresentano due disposizione pannelli (split verticale / split orizzontale).
- nello screenshot il secondo è selezionato con background grigio.
- usare `Columns2` e `Rows2` / `PanelTop` mantenendo l’aspetto del raster.
- il comportamento da replicare è il cambio di layout dei pannelli dell’area Playground; il default deve coincidere con screenshot: input a sinistra e rail/response a destra, con State e Questions impilati nel pannello input.

---

# 6. Playground — pannello sinistro: State + Questions

Il pannello input occupa circa il 47–50% della larghezza utile; il pannello destro il resto. Il divider verticale è 1 px. La divisione può essere resa ridimensionabile ma il default deve riprodurre lo screenshot.

## 6.1 State [S/D]

Header:

```text
State                                         [structured] [</>]
```

- altezza ~52 px.
- bordo inferiore 1 px.
- `State` allineato a sinistra ~18 px dal bordo pannello.
- a destra due pulsanti: visualizzazione strutturata e raw JSON.
- bottone attivo con background grigio chiaro.

### Editor State

Aspetto:

```json
{
  "example_state": "Add context for GoTraxx to evaluate"
}
```

- gutter line number a sinistra, fondo leggermente più scuro.
- area codice `#F3F3F3` per la riga/selection mostrata.
- monospaced.
- scrollbar sottile.

**Contratto Aida [D]:** `state` può essere una stringa, oggetto JSON o array. Aida è text-only; non inviare direttamente immagini/audio/video.

## 6.2 Questions [S/D]

Header:

```text
Questions                                      Format   [! in circle] 0
```

- `Format` applica pretty-print e normalizzazione del JSON [I].
- l’icona cerchiata con `0` rappresenta il numero di problemi/validation errors; deve diventare >0 quando lo schema non è valido.

### Stato vuoto [S]

L’editor mostra `{` e `}` e apre il picker centrale:

```text
Select primitive type to add a question

Noul    Evaluate how true something is                Docs
        Example: "Is `food` a sandwich?"

Score   Set up a rubric to grade with                  Docs
        Example: "How much did `subject` contribute?"

Choice  Ask a multiple choice question                 Docs
        Example: "What color is `object`?"
```

Dimensioni/resa:

- pannello bianco con bordo `#E5E5E5`.
- 3 righe da ~84–90 px.
- titolo primitiva nero; descrizione stessa riga.
- esempio muted/italic o mono-light.
- `Docs` blu allineato a destra.
- separatori 1 px tra le righe.

### Click Noul [D]

Inserisce uno skeleton equivalente:

```json
"question_id": {
  "type": "noul",
  "instructions": "",
  "criteria": {
    "true": "",
    "false": ""
  }
}
```

`criteria` è opzionale. Il picker/builder può ometterlo finché l’utente non aggiunge descrizioni.

### Click Choice [D]

```json
"question_id": {
  "type": "choice",
  "instructions": "",
  "criteria": {
    "option_a": "",
    "option_b": ""
  }
}
```

`criteria` è obbligatorio; fino a 255 opzioni.

### Click Score [D]

```json
"question_id": {
  "type": "score",
  "instructions": "",
  "criteria": [
    "Low",
    "Medium",
    "High"
  ]
}
```

`criteria` è ordinato dal livello più basso al più alto; minimo 2, massimo 10 livelli.

### Stato popolato [S]

Quando ci sono già domande, in basso compare un pill/button:

```text
Add Question  ˅
```

Click apre lo stesso menu Noul / Score / Choice.

---

# 7. Playground — footer operativo

Footer sticky del workspace [S]:

```text
+   [ aida-latest ]                                                 [ Run ]
```

- border-top 1 px.
- `+` a sinistra.
- chip/model selector `aida-latest` subito a destra.
- `Run` allineato in basso a destra.

## 7.1 Model selector [D/I]

Default: `aida-latest`.

La documentazione ufficiale attuale indica:

- `aida-latest` → stable alias.
- `aida-preview` → release più recente, anche preview.
- `aida-1.13.0` → id versione mostrato dalla documentazione al momento della stesura.

Il `+` può essere usato per aggiungere un secondo modello/alias a una comparazione [I]; se non si implementa multi-model, mantenerlo ma aprire il model picker anziché lasciarlo morto.

## 7.2 Run [S/D]

Stati:

- **disabled**: JSON invalido, nessuna question valida, richiesta incompleta.
- **enabled**: background quasi nero `#2E2E2E`, testo bianco.
- **loading**: disabled temporaneo + stato visuale non invasivo.

Chiamata ufficiale:

```http
POST https://api.gotraxx.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Payload:

```json
{
  "state": { "...": "..." },
  "model": "aida-latest",
  "questions": {
    "question_id": {
      "type": "noul",
      "instructions": "..."
    }
  }
}
```

La chiamata deve essere fatta server-side nel clone se si usa una chiave provider condivisa. Non esporre `GOTRAXX_API_KEY` nel bundle browser.

---

# 8. Playground — pannello destro iniziale “Learn to GoTraxx”

Quando non esiste una response, il rail destro mostra gli example requests [S].

## 8.1 Hero

Alto pannello:

```text
EXAMPLE REQUESTS                                                ×
Learn to GoTraxx
```

- `EXAMPLE REQUESTS`: uppercase, tracking ampio, muted.
- `Learn to GoTraxx`: 52–58 px.
- `×`: top-right con hit-area ~44 px.
- click `×` chiude il rail e lascia più spazio all’editor [I].

## 8.2 WALKTHROUGH LESSONS [S]

Tre card di uguale larghezza in riga:

1. **Noul**
   - badge nero `Noul` in alto a destra della card/immagine.
   - illustrazione hotdog.
   - titolo: `Is hotdog a sandwich?`
   - subtitle: `Settle the everlasting debate`

2. **Choice**
   - badge `Choice`.
   - illustrazione sole/nuvola.
   - titolo: `What color is the sky?`
   - subtitle: `Go beyond blue`

3. **Score**
   - badge `Score`.
   - illustrazione macchina fotografica.
   - titolo: `Can monkeys create art?`
   - subtitle: `A real-life court case`

Le card hanno separatori verticali; nessuna shadow.

Click card: carica il preset corrispondente in State + Questions [I]. Non eseguire automaticamente finché l’utente non preme `Run`, salvo verifica diversa del prodotto originale.

## 8.3 REAL-LIFE USE CASES [S]

Tre righe full-width:

```text
Resumé screening       Assess an engineering candidate
Support agent audit    Audit a customer support agent's chat session
Helpdesk ticket triage Route a ticket to the right team
```

La prima riga nello screenshot è hover/selected (`#F0F0F0`).

Click: carica il relativo preset nel builder [I].

---

# 9. Playground — pannello Response

Dopo `Run`, il rail destro diventa una response table [S].

## 9.1 Header response

```text
Response · Ran just now                                  [list] [</>] [panel]
```

- `Response` regular.
- punto separatore centrale.
- timestamp relativo `Ran just now`; poi `Ran 1m ago`, ecc.
- a destra:
  - icona lista: structured/pretty response, attiva nello screenshot;
  - `</>`: raw JSON response;
  - icona pannello orizzontale: layout/docking response [I].

## 9.2 Header tabella risultati [S]

```text
⌃/⌄   Key & instructions                  aida-latest 74ms + 194ms      Primitive type ?
```

- la prima micro-colonna ospita chevron expand/collapse.
- `Key & instructions` a sinistra.
- colonna modello/latency centrale.
- `Primitive type` a destra + `CircleHelp`.

Nel clone, mantenere il formato visuale `<model> <n>ms + <n>ms`. L’esatto significato dei due tempi non è documentato pubblicamente. Implementazione clean-room raccomandata: `providerLatencyMs + client/networkOverheadMs`; se si dispone di `Server-Timing`, usare il dato server reale.

## 9.3 Righe Noul [S/D]

Esempi visibili:

```text
⌄ Is the Monday launch materially                 88% true                    [Noul]
  at risk?                                        ─────◆────

⌄ Is there an unresolved issue aff                85% true                    [Noul]
  ecting a core business process?                 ─────◆────
```

Una riga espansa con valore basso mostra:

```text
⌃ Has the system been adequately t                8% true                     [Noul]
  ested end-to-end?                               ─◆────────
                                                  92% false

  True   The complete relevant workflow has been sufficiently tested from beginning to end.
  False  Important components have only been tested separately or end-to-end testing is missing.
```

### Regole rendering Noul

- `noul = p`, `0 <= p <= 1` [D].
- percentuale true: `round(p * 100)`.
- percentuale false: `round((1-p) * 100)`.
- linea probabilità orizzontale, marker a rombo.
- marker verde quando il lato prevalente è true; arancio quando prevale false.
- in stato espanso mostra entrambi i valori e le descrizioni `criteria.true` / `criteria.false` quando presenti.
- badge `Noul` a destra: fondo grigio molto chiaro, testo mono grigio.

## 9.4 Righe Choice [D/I]

Il contratto ufficiale restituisce:

```json
{
  "type": "choice",
  "choice": "technical",
  "probabilities": {
    "billing": 0.15,
    "technical": 0.85,
    "sales": 0.0
  },
  "confidence": 0.78
}
```

Rendering clone coerente con Response:

- collapsed: selected choice + percentuale top probability/confidence.
- expanded: una riga/barra per ogni option, ordinate come input; percentuale a destra; selected option enfatizzata.
- badge `Choice` nella colonna `Primitive type`.
- mostra `confidence` come metrica secondaria, non confonderla con `probabilities`.

## 9.5 Righe Score [D/I]

Il contratto ufficiale restituisce:

```json
{
  "type": "score",
  "score": 1.43,
  "legend": {
    "0": "...",
    "1": "...",
    "2": "..."
  },
  "probabilities": {
    "0": 0.0,
    "1": 0.57,
    "2": 0.43
  },
  "confidence": 0.35
}
```

Rendering clone:

- collapsed: `score` con max range implicito `0..n-1` + confidence.
- expanded: legend, probability per level, marker/position sul continuum.
- badge `Score`.

**Nota [D]:** `score` è una media ponderata delle probabilità sui livelli e può essere frazionario; non è un semplice indice discreto.

---

# 10. View structured vs raw JSON

## 10.1 Request editor [S/I]

L’icona “lista/structured” mostra il builder visuale. L’icona `</>` mostra la struttura raw.

Raw consigliato:

```json
{
  "state": { ... },
  "questions": { ... },
  "model": "aida-latest"
}
```

Modifiche nelle due viste devono essere bidirezionali e sincronizzate.

## 10.2 Response [S]

Structured = tabella espandibile.

Raw = JSON esatto restituito dall’API, pretty printed a 2 spazi, read-only.

---

# 11. Pagina Usage

## 11.1 Route

`/usage`

## 11.2 Layout [S]

Main page senza card container; tutto su sfondo bianco.

Titolo alto sinistra:

```text
[chart icon] Usage
```

Controlli top-right, nell’ordine:

```text
All traffic ˅     Last 30 days ˅     Daily ˅     [download]
```

Icone/dropdown hanno molto whitespace e nessun bordo evidente nello screenshot.

### Posizioni su viewport 2048 px [S]

- divider sidebar: x≈341.
- content start: x≈386 (padding ≈44 px).
- filtri occupano l’area destra della prima riga.
- download icon circa 28–32 px dal bordo destro.

## 11.3 Chart 1 — Tokens [S/I]

Titolo:

```text
Tokens                                                     17,177
```

Grafico a barre stacked, giornaliero.

- asse Y visibile: `0`, `2K`, `4K`, `6K`, `8K`, `10K`, `12K` circa.
- griglie orizzontali sottilissime `#F0F0F0`.
- blu `#78A0F0`.
- verde `#98C868`.
- niente bordo esterno.

Interpretazione clean-room consigliata [I]:

- blu = input tokens.
- verde = output tokens.

La documentazione ufficiale restituisce `usage.input_tokens` e `usage.output_tokens`; quindi questo mapping è naturale, anche se la legenda non è visibile nello screenshot.

## 11.4 Chart 2 — Requests [S]

Titolo:

```text
Requests                                                        23
```

Bar chart blu singolo.

Aggregare `count(request)` per giorno/intervallo selezionato.

## 11.5 Chart 3 — Spend* [S/D]

Titolo:

```text
Spend*                                                      <$0.01
```

Bar chart monetario.

Per Aida 1.13 la documentazione ufficiale indica costo input attuale `$0.042 / Mtok` e output gratuito. Nel clone:

```ts
spendUsd = inputTokens * 0.042 / 1_000_000
```

Non hardcodare il prezzo per sempre: leggere da config/versioned pricing.

## 11.6 Filtri [S/I]

**All traffic**
- `All traffic`
- opzionale: `Playground`, `API`, `SDK`, o sorgenti equivalenti se registrate dal clone.

**Last 30 days**
- almeno 24h / 7d / 30d / custom.

**Daily**
- Hourly / Daily / Weekly compatibilmente col range.

**Download icon**
- `Download` Lucide.
- implementare export CSV del dataset correntemente filtrato [I].

Formato CSV suggerito:

```csv
date,traffic,input_tokens,output_tokens,requests,spend_usd
2026-09-18,playground,10000,1200,16,0.00042
```

---

# 12. Pagina API Keys

## 12.1 Route

`/api-keys` oppure route interna equivalente. L’URL esatto non è visibile negli screenshot; mantenere il label di navigazione `API Keys`.

## 12.2 Header [S]

Titolo alto sinistra:

```text
[key icon] API keys
```

CTA alto destra:

```text
+ Create key
```

- background `#2E2E2E`.
- testo bianco.
- altezza ~42–44 px.
- radius minimo, quasi rettangolare.

## 12.3 Search [S]

Input sotto il titolo, larghezza ~340 px, altezza ~48 px:

```text
Search keys...
```

Bordo 1 px grigio medio, background bianco.

Filtra per nome/prefisso/creator in client o server.

## 12.4 Tabella [S]

Colonne esatte:

```text
Name          Status          Secret key              Created by                 Created            ⋯
```

Header con micro-chevron sort accanto a Name/Status/Secret key/Created by/Created.

Riga screenshot:

```text
Production    Active          apikey_280c...b7b1      Bernardo Mascellani         18 set 2026        ⋯
```

### Status chip

- pill verde chiaro.
- testo `Active` verde.

### Secret key

Mostrare solo prefisso e ultimi caratteri:

```text
apikey_280c...b7b1
```

Mai mostrare il secret completo dopo la creazione.

## 12.5 `+ Create key` flow [I]

Poiché gli endpoint di gestione account/chiavi GoTraxx non sono documentati pubblicamente, il clone deve implementare un proprio key store invece di fingere chiamate a endpoint privati.

Flow consigliato, coerente con lo screenshot:

1. click `+ Create key`.
2. modal centrata: nome key, es. `Production`.
3. submit.
4. backend genera secret con prefisso `apikey_`.
5. mostra secret **una sola volta** con Copy.
6. DB salva solo hash + prefix + last4 + metadata.
7. chiusa la modal, la tabella mostra forma mascherata.

Schema DB:

```sql
api_keys (
  id uuid primary key,
  org_id uuid not null,
  name text not null,
  key_hash text not null,
  key_prefix text not null,
  key_last4 text not null,
  status text not null,          -- active | revoked
  created_by uuid not null,
  created_at timestamptz not null,
  revoked_at timestamptz null
)
```

## 12.6 Menu `⋯` [S/I]

L’icona è `MoreHorizontal` / 3 puntini.

Il menu non è aperto negli screenshot, quindi le voci originali non sono verificabili. Il clone deve almeno supportare:

- Deactivate/Revoke key.
- Delete key record o Remove, se previsto dal prodotto clone.

Non implementare “Reveal secret”: contraddice la sicurezza attesa.

## 12.7 Nota bottom [S]

Testo esatto visibile:

> API keys are organization-scoped and remain active even after the creator is removed.

Posizionarlo bottom-left del main, a ~44 px dal divider e ~18–24 px dal fondo viewport.

---

# 13. API Aida — contratto da implementare

## 13.1 Endpoint ufficiale [D]

```http
POST https://api.gotraxx.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Top-level request:

```ts
type SystemOneRequest = {
  state: string | object | unknown[];
  model: string;
  questions: Record<string, Question>;
};
```

## 13.2 Questions [D]

```ts
type NoulQuestion = {
  type: "noul";
  instructions: string | object | unknown[];
  criteria?: {
    true?: string | object | unknown[];
    false?: string | object | unknown[];
  };
};

type ChoiceQuestion = {
  type: "choice";
  instructions: string | object | unknown[];
  criteria: Record<string, string | object | unknown[] | null>;
};

type ScoreQuestion = {
  type: "score";
  instructions: string | object | unknown[];
  criteria: Array<string | object | unknown[]>;
};
```

## 13.3 Responses [D]

```ts
type NoulAnswer = {
  type: "noul";
  noul: number; // 0..1
};

type ChoiceAnswer = {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};

type ScoreAnswer = {
  type: "score";
  score: number;
  legend: Record<string, unknown>;
  probabilities: Record<string, number>;
  confidence: number;
};

type SystemOneResponse = {
  model: string; // normalmente versione risolta, es. aida-1.13.0
  answers: Record<string, NoulAnswer | ChoiceAnswer | ScoreAnswer>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};
```

## 13.4 Validazioni client [D]

Prima di abilitare Run:

- `state` presente e JSON valido se in modalità JSON.
- almeno 1 question.
- `type ∈ {noul, choice, score}`.
- `instructions` presente.
- Choice: criteria non vuoto, max 255 opzioni.
- Score: `2 <= criteria.length <= 10`.
- Noul: `criteria` opzionale, se presente accetta true/false.

---

# 14. Backend del clone

## 14.1 Regola importante

Il solo endpoint Aida pubblico è sufficiente per rendere il Playground realmente funzionante. Non risultano documentati pubblicamente endpoint GoTraxx per riprodurre il loro pannello interno Usage/API Keys.

Quindi:

```text
Playground → proxy server clone → api.gotraxx.ai/v1/systemone       [reale]
Usage      → telemetry DB del clone                                 [clone]
API Keys   → key management del clone                               [clone]
```

Non hardcodare, sniffare o dipendere da API interne private della console GoTraxx.

## 14.2 Proxy evaluate

```ts
POST /api/evaluate
```

Server:

1. autentica utente clone.
2. valida request.
3. seleziona provider key server-side.
4. timestamp start.
5. POST GoTraxx.
6. timestamp end.
7. salva telemetry.
8. ritorna response Aida + metadata UI (`roundTripMs`, ecc.).

Esempio risposta clone:

```json
{
  "provider": {
    "model": "aida-1.13.0",
    "answers": {},
    "usage": {
      "input_tokens": 392,
      "output_tokens": 65
    }
  },
  "meta": {
    "requestedModel": "aida-latest",
    "roundTripMs": 268,
    "providerMs": 74,
    "overheadMs": 194,
    "runAt": "2026-09-21T12:15:00.000Z"
  }
}
```

`providerMs` va valorizzato solo se ricavabile da header/telemetria reale; altrimenti non fingere una precisione inesistente.

## 14.3 Telemetry

```sql
aida_runs (
  id uuid primary key,
  org_id uuid not null,
  user_id uuid not null,
  traffic_source text not null,   -- playground | api
  requested_model text not null,
  resolved_model text null,
  input_tokens integer not null,
  output_tokens integer not null,
  spend_usd numeric not null,
  latency_ms integer not null,
  created_at timestamptz not null
)
```

Serve per Usage.

---

# 15. State management frontend

Consigliato un unico store Playground:

```ts
type PlaygroundState = {
  stateValue: unknown;
  stateText: string;
  questionsValue: Record<string, Question>;
  questionsText: string;

  requestView: "structured" | "json";
  responseView: "structured" | "json";
  workspaceLayout: "default" | "alternate";

  selectedModels: string[];
  validationIssues: ValidationIssue[];

  runStatus: "idle" | "running" | "success" | "error";
  response: SystemOneResponse | null;
  runMeta: RunMeta | null;

  examplesOpen: boolean;
  expandedAnswerIds: Set<string>;
};
```

Sincronizzazione editor:

```text
structured edit
   ↓ serialize
raw JSON
   ↓ parse + validate
structured model
```

Se raw JSON non parseable, non distruggere l’ultimo AST valido; mostra issue count e disabilita Run.

---

# 16. Component tree suggerito

```text
<AppShell>
  <Sidebar />
  <Main>
    <Route />
  </Main>
</AppShell>

PlaygroundPage
├─ PlaygroundTopbar
│  ├─ ClearButton
│  ├─ ShareButton
│  └─ LayoutToggle
├─ PlaygroundWorkspace
│  ├─ RequestPane
│  │  ├─ StatePanel
│  │  │  ├─ PanelHeader
│  │  │  ├─ StructuredStateEditor
│  │  │  └─ JsonEditor
│  │  ├─ QuestionsPanel
│  │  │  ├─ PanelHeader
│  │  │  ├─ QuestionBuilder
│  │  │  └─ PrimitivePicker
│  │  └─ PlaygroundFooter
│  │     ├─ AddModelButton
│  │     ├─ ModelSelect
│  │     └─ RunButton
│  └─ RightRail
│     ├─ ExampleRequestsPanel | ResponsePanel
│     └─ CloseButton

UsagePage
├─ UsageToolbar
├─ TokensChart
├─ RequestsChart
└─ SpendChart

ApiKeysPage
├─ ApiKeysHeader
├─ SearchInput
├─ ApiKeysTable
├─ CreateKeyDialog
└─ ApiKeySecretOnceDialog
```

---

# 17. Librerie consigliate

L’implementazione non dipende da queste librerie, ma permettono un risultato pixel-consistent:

```text
Next.js / React
Tailwind CSS o CSS Modules
Lucide React             -> icone
CodeMirror 6             -> JSON editor con gutter
Recharts                 -> grafici Usage
Radix UI                  -> dropdown, dialog, tooltip
Zod                       -> validazione request schema
TanStack Table            -> API Keys table (se necessario)
Postgres                  -> telemetry + local key metadata
```

Evitare component library con padding/radius troppo “opinionated”: la UI GoTraxx è molto piatta, hairline-heavy, con shadow quasi assenti.

---

# 18. CSS layout baseline

```css
.app-shell {
  display: grid;
  grid-template-columns: 344px minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

.sidebar {
  height: 100vh;
  background: #fafafa;
  border-right: 1px solid #e7e7e7;
  display: flex;
  flex-direction: column;
}

.page-main {
  min-width: 0;
  min-height: 0;
  background: #fff;
  overflow: auto;
}

.playground-page {
  height: 100vh;
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr);
}

.playground-workspace {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(560px, 48%) minmax(0, 52%);
}

.request-pane {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) 52px;
  border-right: 1px solid #e7e7e7;
}

.panel-header {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  border-bottom: 1px solid #e7e7e7;
}

.icon-button {
  width: 48px;
  height: 48px;
  display: inline-grid;
  place-items: center;
  border: 0;
  background: transparent;
}

.icon-button[data-active="true"] {
  background: #ededed;
}
```

Il layout deve essere rifinito con screenshot-diff, non considerare questi valori “finali” finché non si verifica il raster.

---

# 19. Stati UX da implementare

| Area | Stato | Rendering |
|---|---|---|
| Playground | empty | Learn to GoTraxx visibile; Run disabled |
| Playground | editing valid | Run enabled |
| Playground | JSON invalid | issue count >0; Run disabled |
| Playground | running | blocca Run; conserva input |
| Playground | success | Response rail sostituisce examples |
| Playground | API error | errore inline nel response rail; input invariato |
| Response | collapsed row | summary |
| Response | expanded row | full probabilities/criteria |
| API Keys | empty | tabella vuota + Create key |
| API Keys | active | status pill verde |
| API Keys | revoked | status muted/red a scelta del clone |
| Usage | no data | assi e totale zero, niente fake bars |

---

# 20. Keyboard / accessibility

Pur replicando il visual, mantenere semantics corrette:

- `button` reali per Clear/Share/Run/layout/icon buttons.
- `aria-label` per tutte le icon-only controls.
- focus ring sottile ma visibile.
- `Enter` / `Space` per card/picker.
- `Cmd/Ctrl + Enter` può lanciare Run [I].
- editor JSON deve permettere tab/focus senza intrappolare il tastierista.
- probabilità non devono essere comunicate solo tramite colore: mostrare sempre percentuali numeriche.

---

# 21. Criteri di accettazione visuale

## 21.1 Shell

- sidebar width entro ±2 px dal riferimento a 2048 px.
- divider sidebar esattamente 1 px.
- selected nav background e radius coerenti.
- account footer resta allineato al fondo con viewport alta.

## 21.2 Playground initial

- topbar altezza ±2 px.
- State/Questions headers allineati.
- `Learn to GoTraxx` occupa la stessa gerarchia e baseline.
- 3 walkthrough cards di uguale larghezza.
- real-life rows separati da hairline.
- model selector/Run aderenti al footer.

## 21.3 Playground response

- colonne Response allineate come screenshot.
- Noul marker posizionato a `p * trackWidth`.
- row expansion non sposta colonne.
- badge primitive sempre nella colonna destra.

## 21.4 Usage

- grafici senza card/background decorativo.
- barre blu/verdi entro ±5 RGB dai token indicati.
- totals allineati a destra.
- filtri nella stessa riga del titolo pagina.

## 21.5 API Keys

- search input 340±4 px.
- CTA Create key top-right.
- tabella quasi full width con header e una hairline per riga.
- note org-scope pinned in basso.

---

# 22. Testing pixel-perfect

Usare Playwright a viewport fissa:

```ts
await page.setViewportSize({ width: 2048, height: 1044 });
```

Testare almeno:

```text
/api-keys       2048x1009
/usage          2048x1044
/playground     2000x1276 (browser content crop escluso)
/playground     2048x1050 response state
```

Workflow:

1. acquisire screenshot del clone.
2. ritagliare browser chrome se presente.
3. confrontare con reference usando pixel diff.
4. correggere prima macro-layout, poi typography, poi spacing, poi colori.
5. target ragionevole: SSIM > 0.985 sulle aree statiche; tollerare differenze solo su dati dinamici/date/avatar.

---

# 23. Cosa NON va inventato

Per una replica seria:

- non inventare endpoint GoTraxx per creare/revocare chiavi: non sono nella documentazione pubblica usata qui.
- non presentare il chart Usage clone come “GoTraxx billing ufficiale” se i dati vengono dal proprio DB.
- non esporre la GoTraxx provider key nel browser.
- non trattare Noul come “confidence”: è P(true); Noul non ha un campo `confidence` separato.
- non trattare Score come label discreta: è una posizione ponderata sulla scala.
- non inserire la barra browser o il riquadro webcam nella UI.

---

# 24. Differenze tra “clone visuale” e “clone console GoTraxx completo”

## Modalità A — raccomandata

**Clone visuale + Playground Aida reale + dashboard locale.**

- UI uguale agli screenshot.
- richieste Playground reali a Aida.
- Usage calcolato dai log del clone.
- API Keys gestite dal clone.
- nessuna dipendenza da API GoTraxx private.

Questa modalità è implementabile interamente con interfacce pubbliche.

## Modalità B — vera console account GoTraxx

Per creare le *stesse* chiavi GoTraxx e mostrare il *billing ufficiale dell’account GoTraxx*, servirebbero endpoint/account APIs non documentati pubblicamente. Non vanno dedotti o hardcodati. Se GoTraxx fornisce in seguito Management API ufficiali, sostituire i moduli locali con tali endpoint senza cambiare la UI.

---

# 25. Fonti tecniche verificate

Documentazione ufficiale GoTraxx consultata il **21 settembre 2026**:

- Introduction: `https://docs.gotraxx.ai/introduction`
- Quick start: `https://docs.gotraxx.ai/introduction/quickstart`
- Primitives: `https://docs.gotraxx.ai/primitives`
- Noul: `https://docs.gotraxx.ai/primitives/noul`
- Choice: `https://docs.gotraxx.ai/primitives/choice`
- Score: `https://docs.gotraxx.ai/primitives/score`
- Confidence: `https://docs.gotraxx.ai/confidence`
- Models: `https://docs.gotraxx.ai/models`
- API reference: `https://docs.gotraxx.ai/api`

Principi confermati dalle fonti ufficiali:

- un’unica request può contenere più questions, valutate in parallelo e indipendentemente.
- Choice restituisce `choice`, `probabilities`, `confidence`.
- Score restituisce `score`, `legend`, `probabilities`, `confidence`.
- Noul restituisce `noul` tra 0 e 1 e non ha confidence separata.
- endpoint: `POST https://api.gotraxx.ai/v1/systemone`.
- `aida-latest` è l’alias stabile usato dagli esempi ufficiali.
- `state` supporta string/object/array text-based.
- Choice supporta fino a 255 opzioni.
- Score accetta 2–10 livelli.

---

# 26. Checklist finale per l’implementatore

```text
[ ] Sidebar 344 px, light gray, divider 1 px
[ ] Logo + 5 voci nav + external link docs + footer account
[ ] Playground topbar con Clear / Share / 2 layout icons
[ ] State header + structured/raw toggle
[ ] Questions header + Format + issue counter
[ ] Primitive picker Noul/Score/Choice identico
[ ] Add Question dropdown
[ ] Bottom model selector + Run
[ ] Learn to GoTraxx rail con 3 lessons + 3 real-life use cases
[ ] Response structured/raw
[ ] Noul probability track + expansion criteria
[ ] Choice probabilities + confidence
[ ] Score legend + probabilities + confidence
[ ] Real POST a /v1/systemone via backend proxy
[ ] Usage: Tokens / Requests / Spend + 4 controls top-right
[ ] API Keys: search, create, status, masked key, creator/date, menu
[ ] Telemetry DB per Usage
[ ] Key secrets hash-only, shown once
[ ] Screenshot diff su 4 reference viewport
```

---

## Decisione implementativa consigliata

Per ottenere il risultato più fedele, costruire prima una **replica statica pixel-perfect** delle quattro schermate usando dati mock corrispondenti agli screenshot; solo quando il diff visivo è stabile, collegare `Run`, telemetria e key management. Separare così visual fidelity e logica evita che la UI si sposti continuamente durante l’integrazione del backend.
