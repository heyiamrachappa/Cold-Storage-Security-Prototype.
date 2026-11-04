import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ShieldAlert, 
  Filter, 
  Search, 
  Download, 
  Trash2, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Radio, 
  DoorClosed, 
  Fan, 
  Wifi, 
  Repeat, 
  FileCheck2,
  Clock
} from 'lucide-react';
import { SecurityEvent, Severity } from '../../types';

export const SecurityEventsView: React.FC = () => {
  const { securityEvents } = useSimulation();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = useMemo(() => {
    return securityEvents.filter(event => {
      // Severity check
      if (severityFilter !== 'ALL' && event.severity !== severityFilter.toLowerCase()) {
        return false;
      }

      // Type check
      if (typeFilter !== 'ALL' && event.type !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.component.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [securityEvents, severityFilter, typeFilter, searchQuery]);

  const getEventIcon = (type: SecurityEvent['type'], severity: Severity) => {
    switch (type) {
      case 'TEMP_CHANGE':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'DOOR_STATE':
        return <DoorClosed className="w-4 h-4 text-emerald-400" />;
      case 'COOLING_STATE':
        return <Fan className="w-4 h-4 text-cyan-400" />;
      case 'SENSOR_ANOMALY':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'NETWORK_EVENT':
        return <Wifi className="w-4 h-4 text-blue-400" />;
      case 'CYBER_COMMAND':
        return <Repeat className="w-4 h-4 text-red-400" />;
      case 'EVIDENCE_INTEGRITY':
        return <FileCheck2 className="w-4 h-4 text-pink-400" />;
      default:
        return severity === 'critical' ? (
          <AlertOctagon className="w-4 h-4 text-red-400" />
        ) : (
          <Info className="w-4 h-4 text-cyan-400" />
        );
    }
  };

  const exportEventsCSV = () => {
    const headers = 'ID,Timestamp,Type,Severity,Title,Description,Component\n';
    const rows = filteredEvents
      .map(e => `"${e.id}","${e.timestamp}","${e.type}","${e.severity}","${e.title.replace(/"/g, '""')}","${e.description.replace(/"/g, '""')}","${e.component}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ColdTrace_Security_Timeline_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Incident Security Timeline & Telemetry Log</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b30] text-cyan-300 border border-[#1c2e52]">
                  {filteredEvents.length} RECORDED EVENTS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Chronological cyber-physical forensic trace across gateway, ESP32, and chamber sensors
              </p>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportEventsCSV}
            className="px-3 py-1.5 rounded-md bg-[#13223c] hover:bg-[#1a2d50] text-cyan-300 border border-[#1f365f] text-xs font-medium flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Log</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#162540]">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search timeline events, components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Severity selector */}
          <div className="sm:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="INFO">Info Only</option>
            </select>
          </div>

          {/* Event Type selector */}
          <div className="sm:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#0d1627] border border-[#1b2b49] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Event Types</option>
              <option value="TEMP_CHANGE">Temperature Events</option>
              <option value="DOOR_STATE">Door Access Events</option>
              <option value="COOLING_STATE">HVAC / Cooling Events</option>
              <option value="SENSOR_ANOMALY">Sensor Inconsistencies</option>
              <option value="CYBER_COMMAND">Cyber & Replay Attacks</option>
              <option value="NETWORK_EVENT">Gateway Network Events</option>
              <option value="EVIDENCE_INTEGRITY">Evidence Tamper Audits</option>
              <option value="DETECTION">ColdTrace-AI Detections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="rounded-xl border border-[#1b2b48] bg-[#080e1b] p-4 shadow-xl">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No events match the selected filters.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#152540]">
            {filteredEvents.map(event => {
              const isCritical = event.severity === 'critical';
              const isWarning = event.severity === 'warning';

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${
                    isCritical 
                      ? 'bg-red-950 border-red-500/80 glow-red' 
                      : isWarning 
                      ? 'bg-amber-950 border-amber-500/80 glow-amber' 
                      : 'bg-[#0f192b] border-cyan-500/50'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                  </div>

                  {/* Event Box */}
                  <div className={`p-3.5 rounded-lg border transition-all ${
                    isCritical 
                      ? 'bg-red-950/25 border-red-500/40 text-red-100' 
                      : isWarning 
                      ? 'bg-amber-950/20 border-amber-500/35 text-amber-100' 
                      : 'bg-[#0b1322] border-[#182845] text-slate-200 hover:border-[#223961]'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 mb-1 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type, event.severity)}
                        <h4 className="text-xs font-bold text-white tracking-wide">
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded uppercase font-semibold ${
                          isCritical 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                            : isWarning 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}>
                          {event.severity}
                        </span>

                        <span className="px-1.5 py-0.2 rounded bg-[#101b2d] text-slate-400 border border-[#1b2b46]">
                          {event.type}
                        </span>

                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{event.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {event.description}
                    </p>

                    <div className="mt-2 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Source Component: <strong className="text-cyan-300">{event.component}</strong></span>
                      <span>ID: {event.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

