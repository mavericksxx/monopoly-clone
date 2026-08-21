import type { MapId, RoomSettings } from '../../shared/types';

const MAP_OPTIONS: ReadonlyArray<{ id: MapId; label: string }> = [
  { id: 'classic', label: 'Classic' },
  { id: 'mr-worldwide', label: 'Mr. Worldwide' },
  { id: 'death-valley', label: 'Death Valley' },
  { id: 'lucky-wheel', label: 'Lucky Wheel' },
];

const TOGGLES: ReadonlyArray<{ key: keyof RoomSettings; label: string }> = [
  { key: 'evenBuild', label: 'Even build' },
  { key: 'randomizePlayerOrder', label: 'Randomize turn order' },
  { key: 'vacationCash', label: 'Vacation cash' },
  { key: 'noRentInPrison', label: 'No rent while in prison' },
  { key: 'unlimitedBuildings', label: 'Unlimited buildings' },
];

export function SettingsPanel({
  settings, editable, onChange,
}: {
  settings: RoomSettings;
  editable: boolean;
  onChange: (partial: Partial<RoomSettings>) => void;
}) {
  return (
    <div className="settings-panel">
      <h3 className="settings-panel__title">Settings</h3>

      <label className="settings-panel__field">
        <span>Map</span>
        <select
          value={settings.mapId}
          disabled={!editable}
          onChange={e => onChange({ mapId: e.target.value as MapId })}
        >
          {MAP_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </label>

      <label className="settings-panel__field">
        <span>Starting cash</span>
        <input
          type="number" min={0} step={100}
          value={settings.startingCash} disabled={!editable}
          onChange={e => onChange({ startingCash: Number(e.target.value) })}
        />
      </label>

      <label className="settings-panel__field">
        <span>Max players</span>
        <input
          type="number" min={2} max={8}
          value={settings.maxPlayers} disabled={!editable}
          onChange={e => onChange({ maxPlayers: Number(e.target.value) })}
        />
      </label>

      <label className="settings-panel__field">
        <span>Start salary</span>
        <input
          type="number" min={0} step={10}
          value={settings.startSalary} disabled={!editable}
          onChange={e => onChange({ startSalary: Number(e.target.value) })}
        />
      </label>

      <label className="settings-panel__field">
        <span>Prison fee</span>
        <input
          type="number" min={0} step={10}
          value={settings.jailFee} disabled={!editable}
          onChange={e => onChange({ jailFee: Number(e.target.value) })}
        />
      </label>

      {TOGGLES.map(({ key, label }) => (
        <label key={key} className="settings-panel__toggle">
          <input
            type="checkbox"
            checked={Boolean(settings[key])}
            disabled={!editable}
            onChange={e => onChange({ [key]: e.target.checked } as Partial<RoomSettings>)}
          />
          <span>{label}</span>
        </label>
      ))}

      {!editable && <p className="settings-panel__note">Only the host can change settings.</p>}
    </div>
  );
}
