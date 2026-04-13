import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CyberBackground from "@/components/CyberBackground";
import CyberCard from "@/components/CyberCard";
import DetectionResult from "@/components/DetectionResult";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, LogOut, Upload, Link as LinkIcon, Image, Video,
  ScanSearch, Loader2
} from "lucide-react";

interface DetectionResponse {
  verdict: "REAL" | "FAKE" | "SUSPICIOUS";
  confidence: number;
  analysis: string;
  indicators: string[];
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAnalyze = async () => {
    if (inputMethod === "upload" && !file) {
      toast.error("Please select a file to analyze");
      return;
    }
    if (inputMethod === "url" && !url.trim()) {
      toast.error("Please enter a URL to analyze");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let payload: Record<string, string> = { mediaType };

      if (inputMethod === "url") {
        payload.url = url.trim();
      } else if (file) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        payload.base64 = base64;
        payload.filename = file.name;
        payload.mimeType = file.type;
      }

      const { data, error } = await supabase.functions.invoke("detect-deepfake", {
        body: payload,
      });

      if (error) throw error;
      setResult(data as DetectionResponse);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setUrl("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen">
      <CyberBackground />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-heading text-lg tracking-wider text-foreground text-glow-green">
              DEEPFAKE SENTINEL
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground tracking-wider hidden sm:block">
              {user?.email}
            </span>
            <Button variant="neon-outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-3 h-3 mr-1" /> LOGOUT
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-8 space-y-8">
        {/* Title section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wider text-foreground text-glow-cyan animate-flicker">
            MEDIA ANALYSIS CONSOLE
          </h1>
          <p className="text-muted-foreground tracking-wide text-sm">
            Upload or provide a URL to scan media for deepfake manipulation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <CyberCard glowColor="cyan" className="space-y-6">
            <h2 className="font-heading text-sm tracking-widest text-neon-cyan text-glow-cyan">
              // INPUT PARAMETERS
            </h2>

            {/* Media type */}
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                Media Type
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={mediaType === "image" ? "neon" : "neon-outline"}
                  size="sm"
                  onClick={() => { setMediaType("image"); reset(); }}
                >
                  <Image className="w-3 h-3 mr-1" /> IMAGE
                </Button>
                <Button
                  variant={mediaType === "video" ? "neon" : "neon-outline"}
                  size="sm"
                  onClick={() => { setMediaType("video"); reset(); }}
                >
                  <Video className="w-3 h-3 mr-1" /> VIDEO
                </Button>
              </div>
            </div>

            {/* Input method */}
            <Tabs value={inputMethod} onValueChange={(v) => { setInputMethod(v as "upload" | "url"); reset(); }}>
              <TabsList className="bg-secondary/50 border border-border">
                <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-heading text-xs tracking-wider">
                  <Upload className="w-3 h-3 mr-1" /> UPLOAD
                </TabsTrigger>
                <TabsTrigger value="url" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-heading text-xs tracking-wider">
                  <LinkIcon className="w-3 h-3 mr-1" /> URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div
                  className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-all hover:bg-primary/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : `Click to select ${mediaType}`}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {mediaType === "image" ? "JPG, PNG, WEBP" : "MP4, WEBM, MOV"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={mediaType === "image" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                    {mediaType} URL
                  </Label>
                  <Input
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setResult(null); }}
                    className="bg-secondary/50 border-border focus:border-primary"
                    placeholder={`https://example.com/${mediaType === "image" ? "photo.jpg" : "video.mp4"}`}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview */}
            {preview && mediaType === "image" && (
              <div className="border border-border rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-secondary/30" />
              </div>
            )}
            {preview && mediaType === "video" && (
              <div className="border border-border rounded-lg overflow-hidden">
                <video src={preview} controls className="w-full max-h-64 bg-secondary/30" />
              </div>
            )}

            {/* Analyze button */}
            <Button
              variant="neon"
              className="w-full"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> SCANNING...
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4 mr-2" /> INITIATE SCAN
                </>
              )}
            </Button>
          </CyberCard>

          {/* Result Panel */}
          <DetectionResult result={result} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
