import React from 'react';
import { ISSUE_TYPES, SEVERITY_LEVELS, STATUS_OPTIONS } from '../data/reports';

function FilterPanel({ filters, onFilterChange, onReset }) {
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">
          <span className="filter-icon">🔍</span>
          Filters
        </h3>
        <button className="filter-reset" onClick={onReset}>Reset</button>
      </div>

      <div className="filter-group">
        <label className="filter-label">Search Blocks</label>
        <input
          type="text"
          className="filter-input"
          placeholder="Type block name..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Issue Type</label>
        <div className="filter-checkboxes">
          {ISSUE_TYPES.map(type => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...filters.types, type]
                    : filters.types.filter(t => t !== type);
                  onFilterChange('types', newTypes);
                }}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Severity</label>
        <div className="filter-checkboxes">
          {SEVERITY_LEVELS.map(severity => (
            <label key={severity} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.severities.includes(severity)}
                onChange={(e) => {
                  const newSeverities = e.target.checked
                    ? [...filters.severities, severity]
                    : filters.severities.filter(s => s !== severity);
                  onFilterChange('severities', newSeverities);
                }}
              />
              <span>{severity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Status</label>
        <div className="filter-checkboxes">
          {STATUS_OPTIONS.map(status => (
            <label key={status} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={(e) => {
                  const newStatuses = e.target.checked
                    ? [...filters.statuses, status]
                    : filters.statuses.filter(s => s !== status);
                  onFilterChange('statuses', newStatuses);
                }}
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Date Range</label>
        <div className="filter-date-inputs">
          <input
            type="date"
            className="filter-date-input"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
          />
          <span className="filter-date-separator">to</span>
          <input
            type="date"
            className="filter-date-input"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.showZeroReports}
            onChange={(e) => onFilterChange('showZeroReports', e.target.checked)}
          />
          <span>Show blocks with zero reports</span>
        </label>
      </div>
    </div>
  );
}

export default FilterPanel;

