
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Mic, Play, Square, Upload, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type VoiceSettings = {
  id?: string;
  pitch: number;
  speed: number;
  clarity: number;
  voice_name?: string;
  sample_url?: string;
};

const VoiceSetup = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    pitch: 50,
    speed: 50,
    clarity: 75,
  });
  
  // Fetch user's voice settings
  useEffect(() => {
    const fetchVoiceSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('voice_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setVoiceSettings({
            id: data.id,
            pitch: data.pitch || 50,
            speed: data.speed || 50,
            clarity: 75, // Default value if not in DB
            voice_name: data.voice_name,
            sample_url: data.sample_url
          });
        }
      } catch (error) {
        console.error("Error fetching voice settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVoiceSettings();
  }, [user]);
  
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAudioFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeAudioFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const startRecording = () => {
    toast({
      title: "Recording started",
      description: "Speak clearly into your microphone.",
    });
    setRecording(true);
    // In a real implementation, we would start the actual audio recording here
  };
  
  const stopRecording = () => {
    setRecording(false);
    toast({
      title: "Recording stopped",
      description: "Your voice sample has been saved.",
    });
    // Simulate adding a recorded file
    const mockFile = new File([""], "voice-recording-" + Date.now() + ".mp3", { type: "audio/mpeg" });
    setAudioFiles(prev => [...prev, mockFile]);
  };
  
  const uploadAudio = async () => {
    if (audioFiles.length === 0) {
      toast({
        title: "No audio samples",
        description: "Please record or upload at least one audio sample.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save voice settings.",
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
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      // In a real app, we would upload the audio files to storage here
      // For now, we'll just simulate that and update the database
      
      // Wait for simulation to complete
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // Generate a sample URL (in a real app this would be the processed voice model URL)
      const sampleUrl = `https://example.com/voice-sample-${Date.now()}.mp3`;
      
      // Create or update voice settings in the database
      if (voiceSettings.id) {
        // Update existing record
        const { error } = await supabase
          .from('voice_settings')
          .update({
            pitch: voiceSettings.pitch,
            speed: voiceSettings.speed,
            voice_name: `${user.name}'s Voice`,
            sample_url: sampleUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', voiceSettings.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('voice_settings')
          .insert({
            user_id: user.id,
            pitch: voiceSettings.pitch,
            speed: voiceSettings.speed,
            voice_name: `${user.name}'s Voice`,
            sample_url: sampleUrl
          })
          .select();
        
        if (error) throw error;
        
        if (data && data[0]) {
          setVoiceSettings(prev => ({
            ...prev,
            id: data[0].id,
            sample_url: sampleUrl,
            voice_name: `${user.name}'s Voice`
          }));
        }
      }
      
      toast({
        title: "Voice model created",
        description: "Your AI voice has been successfully refined.",
      });
      
      // Clear audio files after processing
      setAudioFiles([]);
      
    } catch (error) {
      console.error("Error saving voice settings:", error);
      toast({
        title: "Error",
        description: "Failed to save voice settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const saveVoiceSettings = async () => {
    if (!user || !voiceSettings.id) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('voice_settings')
        .update({
          pitch: voiceSettings.pitch,
          speed: voiceSettings.speed,
          updated_at: new Date().toISOString()
        })
        .eq('id', voiceSettings.id);
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your voice settings have been updated.",
      });
    } catch (error) {
      console.error("Error updating voice settings:", error);
      toast({
        title: "Error",
        description: "Failed to save voice settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Voice Refinement</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Loading your voice settings...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Refinement</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Upload audio samples or record your voice to create your AI voice model
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => document.getElementById('audio-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              multiple
              onChange={handleAudioFileChange}
            />
          </Button>
          
          {recording ? (
            <Button variant="destructive" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          ) : (
            <Button onClick={startRecording}>
              <Mic className="h-4 w-4 mr-2" />
              Record Voice
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Voice Samples</CardTitle>
            <CardDescription>
              We recommend at least 10 minutes of clear audio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {voiceSettings.sample_url && !audioFiles.length && (
              <div className="text-center py-4 mb-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">Voice model already created</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You can upload new samples to refine it
                </p>
              </div>
            )}
            
            {audioFiles.length > 0 ? (
              <div className="space-y-3">
                {audioFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                        <Play className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      </div>
                      <p className="font-medium truncate max-w-[150px]">{file.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeAudioFile(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : !voiceSettings.sample_url ? (
              <div className="text-center py-8">
                <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No audio samples yet</p>
                <p className="text-sm text-gray-400">Record or upload audio samples</p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={audioFiles.length === 0 || uploading}
              onClick={uploadAudio}
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `${voiceSettings.sample_url ? "Refine" : "Generate"} Voice Model`
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              Customize how your AI voice sounds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {voiceSettings.voice_name && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <h4 className="font-medium">{voiceSettings.voice_name}</h4>
                {voiceSettings.sample_url && (
                  <div className="flex items-center mt-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Play className="h-3 w-3 mr-1" /> Play Sample
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="pitch">Pitch</Label>
                <span className="text-sm">{voiceSettings.pitch}%</span>
              </div>
              <Slider 
                id="pitch"
                min={0} 
                max={100} 
                step={1}
                value={[voiceSettings.pitch]}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, pitch: value[0] }))}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">Speaking Speed</Label>
                <span className="text-sm">{voiceSettings.speed}%</span>
              </div>
              <Slider 
                id="speed"
                min={0} 
                max={100} 
                step={1}
                value={[voiceSettings.speed]}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, speed: value[0] }))}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="clarity">Clarity</Label>
                <span className="text-sm">{voiceSettings.clarity}%</span>
              </div>
              <Slider 
                id="clarity"
                min={0} 
                max={100} 
                step={1}
                value={[voiceSettings.clarity]}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, clarity: value[0] }))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              className="w-full" 
              variant={voiceSettings.sample_url ? "default" : "outline"}
              disabled={isLoading || !voiceSettings.id}
              onClick={saveVoiceSettings}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Processing Voice Model</Label>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We're analyzing your voice samples and creating your AI voice model. This may take a few minutes.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceSetup;
