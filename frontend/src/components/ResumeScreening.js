import React, { useState, useEffect } from 'react';
import resumeService from '../api/resumeService';

const ResumeScreening = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [cutoffScore, setCutoffScore] = useState(0.5);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [autoEmail, setAutoEmail] = useState(false);

  useEffect(() => {
    const checkService = async () => {
      try {
        await resumeService.testService();
        setServiceAvailable(true);
      } catch (error) {
        setServiceAvailable(false);
        setError(
          'Resume screening service is not available. Please ensure the Flask service is running.'
        );
      }
    };
    checkService();
  }, []);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleAddMoreFiles = (e) => {
    setFiles([...files, ...e.target.files]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceAvailable) {
      setError(
        'Resume screening service is not available. Please ensure the Flask service is running.'
      );
      return;
    }

    if (!jobDescription.trim()) {
      setError('Job description is required');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one resume');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jd', jobDescription);
      formData.append('cutoff', cutoffScore.toString());
      formData.append('autoEmail', autoEmail ? 'true' : 'false');

      files.forEach((file) => {
        formData.append('resumes[]', file);
      });

      const response = await resumeService.screenResumes(formData);
      const responseResults = response.results || [];
      setResults(Array.isArray(responseResults) ? responseResults : []);
    } catch (error) {
      console.error('Error screening resumes:', error);
      setError('Failed to screen resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Resume Screening
      </h2>

      {!serviceAvailable && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-sm font-medium">
          Resume screening service is not available. Please ensure the Flask service is running.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      {results.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Screening Results
          </h3>
          <p className="mb-4 text-gray-700">
            Cutoff Score: <span className="font-bold">{cutoffScore}</span>
          </p>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">Candidate Name</th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">Email</th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">Score</th>
                  <th className="p-3 border border-gray-300 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-3 border border-gray-200">{result.name}</td>
                    <td className="p-3 border border-gray-200">{result.email}</td>
                    <td className="p-3 border border-gray-200">{result.score}</td>
                    <td className="p-3 border border-gray-200">
                      {result.status.includes('Shortlisted') ? (
                        <span className="text-green-600 font-medium">{result.status}</span>
                      ) : (
                        <span className="text-red-600 font-medium">{result.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setResults([])}
            className="mt-6 bg-[#1E3A8A] hover:bg-[#1a3578] text-white py-2 px-4 rounded-lg font-medium transition shadow-sm w-full"
          >
            Screen More Resumes
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Job Description:
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="6"
              placeholder="Paste job description here..."
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Upload Resumes:
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <input
                type="file"
                onChange={handleFileChange}
                className="mb-2"
                accept=".pdf,.doc,.docx"
                multiple
                required
              />

              {files.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {files.length} file(s) selected:
                  </p>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-white border rounded p-2 text-gray-800"
                      >
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3">
                    <input
                      type="file"
                      onChange={handleAddMoreFiles}
                      className="mt-1"
                      accept=".pdf,.doc,.docx"
                      multiple
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Cutoff Score:
            </label>
            <input
              type="number"
              value={cutoffScore}
              onChange={(e) => setCutoffScore(parseFloat(e.target.value))}
              className="w-full p-2 bg-gray-50 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              step="0.01"
              min="0"
              max="1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Candidates with similarity scores above this threshold will be shortlisted.
            </p>
            <label className="mt-3 inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
                className="mr-2"
              />
              Auto-send emails to shortlisted candidates
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !serviceAvailable}
            className={`w-full py-2 px-4 rounded-lg font-medium transition shadow-sm ${
              loading || !serviceAvailable
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#1E3A8A] hover:bg-[#1a3578] text-white'
            }`}
          >
            {loading ? 'Screening...' : 'Screen Resumes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResumeScreening;
