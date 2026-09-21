import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import { useMemo } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  invalid?: boolean;
}

export function JsonEditor({ value, onChange, readOnly = false, invalid = false }: JsonEditorProps) {
  const extensions = useMemo(() => {
    const base = [
      json(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-content': { fontFamily: 'var(--font-mono)', fontSize: '17px' },
        '.cm-gutters': { backgroundColor: '#f7f7f7' },
      }),
    ];
    if (readOnly) {
      base.push(EditorView.editable.of(false));
    }
    return base;
  }, [readOnly]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: true,
        bracketMatching: true,
        autocompletion: false,
        tabSize: 2,
      }}
      className={invalid ? 'invalid' : ''}
    />
  );
}