
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { getCSVTemplate } from "@/utils/csvHelpers";

interface TemplateControlsProps {
  isUploading: boolean;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TemplateControls = ({ isUploading, handleFileUpload }: TemplateControlsProps) => {
  const downloadTemplate = () => {
    const blob = new Blob([getCSVTemplate()], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={downloadTemplate}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download Template
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="default"
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </div>
    </div>
  );
};

export default TemplateControls;
