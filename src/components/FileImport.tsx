import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { StockEntry } from "@/src/types";

interface FileImportProps {
  onImport: (entries: Omit<StockEntry, "id">[], replace: boolean) => void;
}

export default function FileImport({ onImport }: FileImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const processFile = async (file: File) => {
    setStatus({ type: "idle", message: "Processing..." });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Use header: 1 to get raw rows first to find the actual header row
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rawRows.length === 0) {
          throw new Error("The file appears to be empty.");
        }

        // Find the header row (the one that contains "symbol" or "stock")
        let headerRowIndex = rawRows.findIndex(row => 
          row.some(cell => /symbol|stock|ticker|name/i.test(String(cell)))
        );
        
        if (headerRowIndex === -1) headerRowIndex = 0;

        // Re-parse with the correct header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex }) as any[];

        const entries: Omit<StockEntry, "id">[] = [];
        const seenSymbols = new Set<string>();
        
        jsonData.forEach((row) => {
          const keys = Object.keys(row);
          const normalize = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
          
          // Heuristic search for columns using normalized keys
          const symbolKey = keys.find(k => /symbol|ticker|stock/i.test(normalize(k)));
          const amountKey = keys.find(k => /totalprice|totalvalue|invested|cost/i.test(normalize(k)));
          const priceKey = keys.find(k => /avgprice|purchaseprice|costper|avg/i.test(normalize(k)));
          const dateKey = keys.find(k => /holdingsince|date|time|period/i.test(normalize(k)));
          const quantityKey = keys.find(k => /qty|quantity|units/i.test(normalize(k)));

          if (symbolKey && (amountKey || (quantityKey && priceKey)) && priceKey) {
            const rawName = row[symbolKey];
            if (!rawName) return;

            const name = String(rawName).trim().toUpperCase();
            
            // Skip if name is empty, too long (likely a sentence/note), or a common total row
            if (!name || name.length > 10 || /TOTAL|SUM|SUBTOTAL|PORTFOLIO|CASH/i.test(name)) {
              return;
            }

            // Deduplicate within the same file to prevent "triple counting" if the file has duplicate rows
            if (seenSymbols.has(name)) return;

            const purchasePrice = parseFloat(String(row[priceKey]).replace(/[^0-9.-]+/g, ""));
            
            let amount = 0;
            if (amountKey) {
              const val = String(row[amountKey]).replace(/[^0-9.-]+/g, "");
              amount = parseFloat(val);
            } else if (quantityKey) {
              const qtyVal = String(row[quantityKey]).replace(/[^0-9.-]+/g, "");
              const qty = parseFloat(qtyVal);
              amount = qty * purchasePrice;
            }

            let date = dateKey ? String(row[dateKey]) : new Date().toISOString().split("T")[0];

            // Basic date validation/formatting
            if (dateKey && !isNaN(Date.parse(date))) {
              date = new Date(date).toISOString().split("T")[0];
            } else {
              date = new Date().toISOString().split("T")[0];
            }

            if (name && !isNaN(amount) && !isNaN(purchasePrice) && amount > 0 && purchasePrice > 0) {
              entries.push({ name, amount, purchasePrice, date });
              seenSymbols.add(name);
            }
          }
        });

        if (entries.length === 0) {
          throw new Error("Could find no valid stock data. Please check your column headers.");
        }

        onImport(entries, replaceExisting);
        setStatus({ type: "success", message: `Successfully imported ${entries.length} unique holdings!` });
        
        setTimeout(() => setStatus({ type: "idle", message: "" }), 3000);
      } catch (err: any) {
        setStatus({ type: "error", message: err.message || "Failed to parse file." });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv"))) {
      processFile(file);
    } else {
      setStatus({ type: "error", message: "Please upload an Excel (.xlsx, .xls) or CSV file." });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" />
          Import Holdings
        </h3>
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
          <input 
            type="checkbox" 
            checked={replaceExisting}
            onChange={(e) => setReplaceExisting(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Replace Existing Data
        </label>
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
        }`}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
        />
        
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <FileText className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-slate-400"}`} />
        </div>
        
        <p className="text-sm font-medium text-slate-700 text-center">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-slate-400 mt-1 text-center">
          Excel (.xlsx, .xls) or CSV holding reports
        </p>
      </div>

      {status.type !== "idle" && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
          status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.message}
        </div>
      )}
    </div>
  );
}
