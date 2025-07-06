import React, { useState } from 'react';

interface ExportDataProps {
  className?: string;
}

const ExportData: React.FC<ExportDataProps> = ({ className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    type: 'transactions',
    startDate: '',
    endDate: ''
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams();
      Object.entries(exportOptions).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the filename from the content-disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'finance-data';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`export-data ${className}`}>
      <h3>Export Data</h3>
      
      <div className="export-options">
        <div className="export-option-group">
          <label htmlFor="export-format">Format:</label>
          <select
            id="export-format"
            name="format"
            value={exportOptions.format}
            onChange={handleOptionChange}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="export-option-group">
          <label htmlFor="export-type">Data Type:</label>
          <select
            id="export-type"
            name="type"
            value={exportOptions.type}
            onChange={handleOptionChange}
          >
            <option value="transactions">Transactions Only</option>
            <option value="budgets">Budgets Only</option>
            <option value="all">All Data</option>
          </select>
        </div>

        <div className="export-option-group">
          <label htmlFor="export-start-date">Start Date (optional):</label>
          <input
            type="date"
            id="export-start-date"
            name="startDate"
            value={exportOptions.startDate}
            onChange={handleOptionChange}
          />
        </div>

        <div className="export-option-group">
          <label htmlFor="export-end-date">End Date (optional):</label>
          <input
            type="date"
            id="export-end-date"
            name="endDate"
            value={exportOptions.endDate}
            onChange={handleOptionChange}
          />
        </div>
      </div>

      <button
        className="export-btn"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : `Export as ${exportOptions.format.toUpperCase()}`}
      </button>

      <div className="export-info">
        <p className="export-description">
          Export your financial data for backup or analysis in other tools. 
          {exportOptions.format === 'csv' 
            ? ' CSV format is perfect for Excel or Google Sheets.' 
            : ' JSON format preserves all data structure.'}
        </p>
        
        {(exportOptions.startDate || exportOptions.endDate) && (
          <p className="date-range-info">
            Date range: {exportOptions.startDate || 'All time'} to {exportOptions.endDate || 'Now'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportData;
