import { useState } from 'react';

/** The share link is the whole distribution model, so it stays visible in-game. */
export function ShareLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused; the URL is on screen to copy by hand.
    }
  }

  return (
    <div className="panel share">
      <div className="panel__title">Share this game</div>
      <div className="share__row">
        <span className="share__url" title={url}>{url}</span>
        <button className="btn btn--small" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
    </div>
  );
}
