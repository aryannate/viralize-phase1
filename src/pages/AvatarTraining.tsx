
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, RefreshCw, Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const AvatarTraining = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const uploadFiles = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one video to upload for training.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Training started",
            description: "Your videos have been uploaded and AI avatar training has begun.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/dashboard" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">AI Avatar Training</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Upload videos of yourself to train your AI avatar model
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Video Training Guidelines</CardTitle>
            <CardDescription>
              Follow these guidelines for best results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Recommended Video Content</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                    5-10 minutes of speaking directly to camera
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                    Good lighting with face clearly visible
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✓</span>
                    Various facial expressions and emotions
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Content to Avoid</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✕</span>
                    Videos with multiple people
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✕</span>
                    Poor lighting or face partially covered
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs mt-0.5">✕</span>
                    Extremely fast movements
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Upload Training Videos</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Select high-quality videos for better training results
              </p>
            </div>
            <Button variant="outline" onClick={() => document.getElementById('video-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Add Videos
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
            </Button>
          </div>
          
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Videos</CardTitle>
                <CardDescription>
                  These videos will be used to train your AI avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                          <Play className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setFiles([])}>
                  Clear All
                </Button>
                <Button onClick={uploadFiles} disabled={uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Start Training"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Upload Progress</Label>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {files.length === 0 && !uploading && (
            <Card className="border-dashed border-2 py-16">
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Videos Selected</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Upload videos of yourself to train your AI avatar.<br />
                  We recommend at least 5 minutes of video content.
                </p>
                <Button onClick={() => document.getElementById('video-upload')?.click()}>
                  Select Videos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarTraining;
