import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Smartphone } from 'lucide-react'
import { Modal } from './ui'
import { remoteUrl, startHosting, useHost } from '../lib/remote'

export default function PairModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { code, connected, error, starting } = useHost()
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) startHosting().catch(() => {})
  }, [open])

  useEffect(() => {
    if (!code) return
    QRCode.toDataURL(remoteUrl(code), { margin: 1, width: 480, color: { dark: '#0b0b10', light: '#ffffff' } }).then(setQr)
  }, [code])

  const url = code ? remoteUrl(code) : ''

  return (
    <Modal open={open} onClose={onClose} title="Remote control">
      <p className="muted">
        Scan with a second phone to start, restart and dim this clock without touching it — perfect next to a
        sleeping baby or on a stage.
      </p>
      <div className="pair">
        <div className="qr">{qr ? <img src={qr} alt="QR code for the remote link" /> : <div className="qr-wait">{starting ? 'Opening channel…' : '…'}</div>}</div>
        <div className="pair-info">
          <div className="pair-code-label">Pairing code</div>
          <div className="pair-code">{code ? code.toUpperCase() : '·····'}</div>
          <div className={`pair-state ${connected ? 'ok' : ''}`}>
            <Smartphone size={16} />
            {error ? error : connected ? `${connected} remote${connected > 1 ? 's' : ''} connected` : 'Waiting for a remote…'}
          </div>
          {code && (
            <button
              className="btn ghost small"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                } catch {
                  /* ignore */
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy link'}
            </button>
          )}
        </div>
      </div>
      <p className="fineprint">Peer-to-peer over the internet. Nothing is stored. Both devices need a connection.</p>
    </Modal>
  )
}
