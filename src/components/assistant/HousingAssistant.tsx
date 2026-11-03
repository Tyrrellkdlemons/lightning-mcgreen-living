'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type Source = { id: string; title: string; url: string; detailUrl: string; date: string; evidence: string; area: string };
type Answer = { mode: 'gemini' | 'sources-only'; message?: string; helpUrl?: string; blocks?: { text: string; sourceIds: string[] }[]; sources: Source[]; corpusAsOf: string; note: string };
const EXAMPLES = ['Where can I find rental assistance?', 'What should I ask before applying for an apartment?', 'Where can I find help with an eviction notice?'];

export function HousingAssistant() {
  const [state, setState] = useState<'CA' | 'AZ'>('CA');
  const [city, setCity] = useState('');
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const control = new AbortController();
    fetch('/api/assistant', { cache: 'no-store', signal: control.signal }).then(r => r.ok ? r.json() : null).then(value => setConfigured(value?.configured === true)).catch(() => { if (!control.signal.aborted) setConfigured(false); });
    return () => { control.abort(); pending.current?.abort(); };
  }, []);
  useEffect(() => { if (answer || error) result.current?.focus(); }, [answer, error]);
  function clear() { pending.current?.abort(); pending.current = null; setBusy(false); setAnswer(null); setError(''); setQuestion(''); setConsent(false); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !consent || question.trim().length < 5) return;
    const control = new AbortController(); pending.current = control;
    setBusy(true); setAnswer(null); setError('');
    const timer = window.setTimeout(() => control.abort(), 40000);
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, state, city, consent }), signal: control.signal, cache: 'no-store' });
      const data = await response.json();
      if (pending.current !== control) return;
      if ((data.mode === 'gemini' || data.mode === 'sources-only') && Array.isArray(data.sources)) setAnswer(data as Answer);
      else setError(typeof data.error === 'string' ? data.error : 'The assistant is unavailable. Try the source directory below.');
    } catch { if (pending.current === control) setError('The request could not finish. Your question was not saved here. Try again or browse the source directory.'); }
    finally { window.clearTimeout(timer); if (pending.current === control) { pending.current = null; setBusy(false); } }
  }
  return <div className="mx-auto max-w-5xl pb-8">
    <header className="mt-6 max-w-3xl">
      <p className="eyebrow">A clearer next step</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900 sm:text-5xl">Ask about housing</h1>
      <p className="mt-4 text-base leading-relaxed text-chocolate-700">Explore California and Arizona housing resources with a short, sourced answer from Gemini. Questions use our dated public directory and historical workbook records.</p>
      <p className="mt-3 rounded-xl border border-gingerbread-300 bg-frosting-100 p-4 text-sm leading-relaxed text-chocolate-700">This is research guidance. It cannot check live vacancies, confirm funding or eligibility, calculate legal deadlines, or submit an application.</p>
    </header>
    <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="explore-card min-w-0 p-5 sm:p-7" aria-labelledby="ask-heading">
        <h2 id="ask-heading" className="section-heading">What would you like to find?</h2>
        {configured === false && <p role="status" className="mt-3 rounded-xl bg-frosting-100 p-3 text-sm text-chocolate-700">Gemini is unavailable in this environment. You can still request matching directory sources.</p>}
        <form onSubmit={submit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-chocolate-800">State<select value={state} onChange={e => setState(e.target.value as 'CA' | 'AZ')} className="mt-2 min-h-11 w-full rounded-xl border border-gingerbread-300 bg-white px-3"><option value="CA">California</option><option value="AZ">Arizona</option></select></label>
            <label className="block text-sm font-bold text-chocolate-800">City <span className="font-normal">(optional)</span><input value={city} onChange={e => setCity(e.target.value)} maxLength={80} autoComplete="off" placeholder="For example, Tucson" className="mt-2 min-h-11 w-full rounded-xl border border-gingerbread-300 bg-white px-3" /></label>
          </div>
          <label className="block text-sm font-bold text-chocolate-800">Your general housing question<textarea value={question} onChange={e => setQuestion(e.target.value)} required minLength={5} maxLength={800} rows={5} autoComplete="off" aria-describedby="question-privacy" placeholder="Where can I find housing counseling in my area?" className="mt-2 w-full resize-y rounded-xl border border-gingerbread-300 bg-white p-3 font-normal leading-relaxed" /></label>
          <p id="question-privacy" className="text-xs leading-relaxed text-chocolate-700">Use general questions only. Leave out names, phone numbers, email addresses, account or identity numbers, passwords and document contents. Questions are limited to 800 characters.</p>
          <label className="flex items-start gap-3 rounded-xl bg-frosting-100 p-4 text-sm leading-relaxed text-chocolate-800"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-1 h-5 w-5 shrink-0 accent-amber-600" /><span>I understand that submitting sends my question to this site and, when available, Gemini through Netlify. This site does not save a chat history. Netlify and Google process submitted text under their own policies; do not include personal information. <Link href="/privacy" className="font-bold underline">Privacy details</Link></span></label>
          <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={busy || !consent || question.trim().length < 5} className="bolt-btn min-h-11 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Finding your next step...' : configured === false ? 'Find directory sources' : 'Ask with sources'}</button><button type="button" onClick={clear} className="cinnamon-btn min-h-11">Clear question &amp; answer</button></div>
          <p role="status" aria-live="polite" className="min-h-5 text-xs text-chocolate-600">{busy ? 'This can take up to 30 seconds. You can clear the page to cancel.' : 'A small shared request limit keeps the assistant available within its budget.'}</p>
        </form>
      </section>
      <aside className="min-w-0 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-5">
        <h2 className="font-display text-xl font-bold text-chocolate-900">Start with a question</h2>
        <div className="mt-4 space-y-3">{EXAMPLES.map(example => <button key={example} type="button" onClick={() => setQuestion(example)} className="min-h-11 w-full rounded-xl border border-gingerbread-300 bg-white p-3 text-left text-sm leading-relaxed text-chocolate-800 hover:border-chocolate-500">{example}</button>)}</div>
        <p className="mt-6 text-sm leading-relaxed text-chocolate-700">Need a direct route? You can use these tools without asking Gemini.</p>
        <nav aria-label="Housing research tools" className="mt-3 flex flex-col gap-3 text-sm font-bold text-chocolate-800"><Link href={`/resources?state=${state}`} className="underline">Browse source directory</Link><Link href={`/assistance#${state === 'AZ' ? 'arizona' : 'california'}`} className="underline">State assistance contacts</Link><Link href="/help" className="underline">Step-by-step help navigator</Link><Link href="/properties" className="underline">Historical property workbook</Link></nav>
      </aside>
    </div>
    <div ref={result} tabIndex={-1} className="mt-6 min-w-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-600" aria-label="Question result">
      {error && <div role="alert" className="rounded-2xl border border-gingerbread-300 bg-frosting-100 p-5 text-sm text-chocolate-800">{error}</div>}
      {answer && <section className="explore-card min-w-0 p-5 sm:p-7" aria-labelledby="answer-heading">
        <p className="eyebrow">{answer.mode === 'gemini' ? 'Gemini response with recorded sources' : 'Directory matches — no AI answer'}</p>
        <h2 id="answer-heading" className="mt-2 section-heading">{answer.mode === 'gemini' ? 'Here is a place to start' : 'Explore these recorded sources'}</h2>
        {answer.message && <p className="mt-4 text-sm leading-relaxed text-chocolate-800">{answer.message}</p>}{answer.helpUrl && <Link href={answer.helpUrl} className="mt-3 inline-block font-bold text-chocolate-800 underline">Open state assistance contacts</Link>}
        {answer.blocks?.map((block, index) => <div key={index} className="mt-4"><p className="whitespace-pre-wrap break-words leading-relaxed text-chocolate-800">{block.text}</p><div className="mt-2 flex flex-wrap gap-2">{block.sourceIds.map(id => { const source = answer.sources.find(s => s.id === id); return source ? <a key={id} href={`#assistant-source-${id}`} className="rounded-md bg-frosting-100 px-2 py-1 text-xs font-bold text-chocolate-700 underline">{source.title}</a> : null; })}</div></div>)}
        <p className="mt-5 rounded-xl bg-frosting-100 p-4 text-sm leading-relaxed text-chocolate-700">{answer.note} AI answers can be mistaken; check the linked records before acting.</p>
        <h3 className="mt-6 font-display text-xl font-bold text-chocolate-900">Sources you can inspect</h3>
        <ul className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">{answer.sources.map(source => <li id={`assistant-source-${source.id}`} key={source.id} className="min-w-0 scroll-mt-24 rounded-xl border border-gingerbread-300 p-4"><a href={source.url} target={source.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="break-words font-bold text-chocolate-900 underline">{source.title}</a><p className="mt-2 text-xs leading-relaxed text-chocolate-700">{source.area}. {source.evidence}. Recorded date: {source.date || 'not recorded'}.</p>{source.detailUrl !== source.url && <Link href={source.detailUrl} className="mt-3 inline-block text-xs font-bold text-chocolate-700 underline">Read provenance and next steps</Link>}</li>)}</ul>
        {!answer.sources.length && <p className="mt-3 text-sm text-chocolate-700">Try removing the city, or browse the state assistance contacts above.</p>}
      </section>}
    </div>
  </div>;
}
