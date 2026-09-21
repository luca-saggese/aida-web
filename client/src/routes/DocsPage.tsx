import { BookOpen, KeyRound, Terminal, Braces } from 'lucide-react';
import './DocsPage.css';

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="doc-code">
      <div className="doc-code-head">
        <span>{title}</span>
        <button
          className="doc-copy"
          onClick={() => navigator.clipboard.writeText(code)}
          aria-label={`Copy ${title}`}
        >
          Copy
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const CURL_EXAMPLE = `curl -X POST https://api.gotraxx.ai/api/v1/systemone \\
  -H "Authorization: Bearer apikey_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "aida-latest",
    "state": {
      "message": "A hotdog placed between two slices of bread."
    },
    "questions": {
      "is_sandwich": {
        "type": "noul",
        "instructions": "Is the subject a sandwich?",
        "criteria": { "true": "Yes", "false": "No" }
      }
    }
  }'`;

const PYTHON_EXAMPLE = `import requests

resp = requests.post(
    "https://api.gotraxx.ai/api/v1/systemone",
    headers={
        "Authorization": "Bearer apikey_xxxxxxxxxxxxxxxx",
        "Content-Type": "application/json",
    },
    json={
        "model": "aida-latest",
        "state": {"message": "A hotdog placed between two slices of bread."},
        "questions": {
            "is_sandwich": {
                "type": "noul",
                "instructions": "Is the subject a sandwich?",
                "criteria": {"true": "Yes", "false": "No"},
            }
        },
    },
)
print(resp.json())`;

const NODE_EXAMPLE = `const res = await fetch("https://api.gotraxx.ai/api/v1/systemone", {
  method: "POST",
  headers: {
    Authorization: "Bearer apikey_xxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "aida-latest",
    state: { message: "A hotdog placed between two slices of bread." },
    questions: {
      is_sandwich: {
        type: "noul",
        instructions: "Is the subject a sandwich?",
        criteria: { true: "Yes", false: "No" },
      },
    },
  }),
});
const data = await res.json();
console.log(data);`;

const RESPONSE_EXAMPLE = `{
  "model": "aida-latest",
  "answers": {
    "is_sandwich": {
      "type": "noul",
      "noul": 0.87
    }
  },
  "usage": {
    "input_tokens": 42,
    "output_tokens": 18
  }
}`;

export function DocsPage() {
  return (
    <div className="docs-page">
      <div className="docs-header">
        <div className="docs-title">
          <BookOpen size={22} strokeWidth={1.7} />
          <span>API Documentation</span>
        </div>
        <p className="docs-subtitle">
          Run structured inference against Aida using a simple, OpenAI-compatible HTTP API.
        </p>
      </div>

      <section className="docs-section">
        <h2 className="docs-h2">
          <KeyRound size={18} strokeWidth={1.7} />
          Authentication
        </h2>
        <p>
          Every request must include an API key in the <code>Authorization</code> header using the
          Bearer scheme. Create a key from the <a href="/api-keys">API Keys</a> page.
        </p>
        <CodeBlock title="Header" code={'Authorization: Bearer apikey_xxxxxxxxxxxxxxxx'} />
        <p>
          Keys are scoped to your organization. Requests without a valid key return
          <code>401 Unauthorized</code>.
        </p>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">
          <Terminal size={18} strokeWidth={1.7} />
          Endpoint
        </h2>
        <div className="doc-endpoint">
          <span className="doc-method">POST</span>
          <code>/api/v1/systemone</code>
        </div>
        <p>
          Sends a <em>state</em> (the content to analyze) together with a set of structured
          <em>questions</em>. Aida evaluates each question against the state and returns typed answers.
        </p>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">
          <Braces size={18} strokeWidth={1.7} />
          Request body
        </h2>
        <table className="docs-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>model</code></td>
              <td>string</td>
              <td>no</td>
              <td>Model to use. Defaults to <code>aida-latest</code>.</td>
            </tr>
            <tr>
              <td><code>state</code></td>
              <td>object</td>
              <td>no</td>
              <td>The content to analyze. Use <code>message</code> for free text.</td>
            </tr>
            <tr>
              <td><code>questions</code></td>
              <td>object</td>
              <td>yes</td>
              <td>Map of question key to a question definition (see below).</td>
            </tr>
          </tbody>
        </table>

        <h3 className="docs-h3">Question types</h3>
        <table className="docs-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Answer</th>
              <th>Criteria</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>noul</code></td>
              <td>boolean probability <code>noul</code></td>
              <td><code>{'{'} true, false {'}'}</code> descriptions</td>
            </tr>
            <tr>
              <td><code>choice</code></td>
              <td>selected <code>choice</code> + probabilities</td>
              <td>map of option key to label</td>
            </tr>
            <tr>
              <td><code>score</code></td>
              <td>numeric <code>score</code> + legend</td>
              <td>ordered array of levels</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">
          <Terminal size={18} strokeWidth={1.7} />
          Examples
        </h2>
        <CodeBlock title="cURL" code={CURL_EXAMPLE} />
        <CodeBlock title="Python" code={PYTHON_EXAMPLE} />
        <CodeBlock title="Node.js" code={NODE_EXAMPLE} />
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">
          <Braces size={18} strokeWidth={1.7} />
          Response
        </h2>
        <CodeBlock title="200 OK" code={RESPONSE_EXAMPLE} />
        <p>
          Each answer is keyed by the question key you sent. The <code>usage</code> object reports
          token consumption, which is what your usage dashboard is billed on.
        </p>
      </section>
    </div>
  );
}