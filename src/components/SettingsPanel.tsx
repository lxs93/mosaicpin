import type { SafetySettings } from '../types'

type Props = {
  settings: SafetySettings
  onChange: (s: SafetySettings) => void
  onClose: () => void
}

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  const update = (patch: Partial<SafetySettings>) => onChange({ ...settings, ...patch })

  return (
    <div
      className="settings-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Safety settings"
    >
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Safety Settings</h2>
          <button onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <label className="settings-row">
          <span>Blur sensitive content</span>
          <input
            type="checkbox"
            checked={settings.blurSensitive}
            onChange={e => update({ blurSensitive: e.target.checked })}
          />
        </label>

        <label className="settings-row">
          <span>Strict mode — hide sensitive content entirely</span>
          <input
            type="checkbox"
            checked={settings.strictMode}
            onChange={e => update({ strictMode: e.target.checked })}
          />
        </label>

        <label className="settings-row">
          <span>Hide posts without alt text</span>
          <input
            type="checkbox"
            checked={settings.hideNoAlt}
            onChange={e => update({ hideNoAlt: e.target.checked })}
          />
        </label>

        <div className="settings-section">
          <label htmlFor="muted-tags" className="settings-label">
            Muted tags (comma-separated)
          </label>
          <input
            id="muted-tags"
            type="text"
            value={settings.mutedTags.join(', ')}
            onChange={e => update({
              mutedTags: e.target.value
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean),
            })}
            placeholder="e.g. nsfw, gore, politics"
            className="mute-input"
          />
        </div>

        <p className="settings-note">
          Settings are saved locally to your browser.
        </p>
      </div>
    </div>
  )
}
