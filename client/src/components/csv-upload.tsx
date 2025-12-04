import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert } from "./ui/alert";
import { Spinner } from "./ui/spinner";

interface CSVAnalysisResult {
  row: number;
  senderUpi: string;
  receiverUpi: string;
  amount: number;
  riskScore: number;
  isFraudulent: boolean;
  reasons: string[];
  status: string;
  transactionId?: string;
  error?: string;
}

interface CSVUploadResponse {
  fileName: string;
  totalRows: number;
  processedCount: number;
  errorCount: number;
  results: CSVAnalysisResult[];
  summary: {
    fraudulentCount: number;
    cleanCount: number;
    avgRiskScore: string;
  };
}

export function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CSVUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const csvContent = await selectedFile.text();
      const response = await fetch("/api/csv-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          fileName: selectedFile.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data: CSVUploadResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to process CSV");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return "text-green-600";
    if (score < 60) return "text-yellow-600";
    if (score < 80) return "text-orange-600";
    return "text-red-600";
  };

  const getRiskBgColor = (score: number) => {
    return "bg-white";
  };

  if (results) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">CSV Analysis Results</h3>
              <p className="text-sm text-gray-600 mt-1">{results.fileName}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setResults(null);
                setFile(null);
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="text-2xl font-bold text-blue-600">{results.totalRows}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Fraudulent</p>
              <p className="text-2xl font-bold text-red-600">{results.summary.fraudulentCount}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Clean</p>
              <p className="text-2xl font-bold text-green-600">{results.summary.cleanCount}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-black-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-purple-600">{results.summary.avgRiskScore}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white">
              <thead>
                <tr className="border-b bg-white">
                  <th className="px-4 py-2 text-left font-semibold text-black bg-white">Row</th>
                  <th className="px-4 py-2 text-left font-semibold text-black bg-white">Sender UPI</th>
                  <th className="px-4 py-2 text-left font-semibold text-black bg-white">Receiver UPI</th>
                  <th className="px-4 py-2 text-right font-semibold text-black bg-white">Amount</th>
                  <th className="px-4 py-2 text-right font-semibold text-black bg-white">Risk Score</th>
                  <th className="px-4 py-2 text-left font-semibold text-black bg-white">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-black bg-white">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result, idx) => (
                  <tr key={idx} className="border-b bg-white hover:bg-gray-100">
                    <td className="px-4 py-2 text-black bg-white">{result.row}</td>
                    <td className="px-4 py-2 text-xs truncate text-black bg-white">{result.senderUpi}</td>
                    <td className="px-4 py-2 text-xs truncate text-black bg-white">{result.receiverUpi}</td>
                    <td className="px-4 py-2 text-right text-black bg-white">₹{result.amount?.toLocaleString()}</td>
                    <td className={`px-4 py-2 text-right font-bold bg-white ${getRiskColor(result.riskScore || 0)}`}>
                      {result.riskScore?.toFixed(1) || "N/A"}
                    </td>
                    <td className="px-4 py-2 bg-white">
                      {result.status === "success" ? (
                        <div className="flex items-center gap-2">
                          {result.isFraudulent ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 font-semibold">Fraud</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-semibold">Clean</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-600">Error</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs bg-white">
                      {result.error ? (
                        <span className="text-red-600">{result.error}</span>
                      ) : (
                        <span className="text-black">{result.reasons?.slice(0, 2).join(", ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Upload CSV for Batch Analysis</h3>
          <p className="text-sm text-gray-600">
            Upload a CSV file with transaction data to analyze multiple transactions at once
          </p>
        </div>

        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="w-4 h-4" />
            {error}
          </Alert>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
            disabled={loading}
          />

          <div className="space-y-3" onClick={() => fileInputRef.current?.click()}>
            {loading ? (
              <>
                <Spinner className="w-12 h-12 mx-auto text-blue-500" />
                <p className="text-gray-600">Processing your CSV...</p>
              </>
            ) : file ? (
              <>
                <FileText className="w-12 h-12 mx-auto text-green-500" />
                <p className="font-semibold text-gray-700">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-700">
                    Drop CSV here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    CSV must include: senderUpi, receiverUpi, amount
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>CSV Format:</strong> Your file should have columns: senderUpi, receiverUpi, amount
            (required). Optional columns: timestamp, description, merchantName, city
          </p>
        </div>

        {file && !loading && (
          <Button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            variant="outline"
            className="w-full"
          >
            Change File
          </Button>
        )}
      </div>
    </Card>
  );
}
