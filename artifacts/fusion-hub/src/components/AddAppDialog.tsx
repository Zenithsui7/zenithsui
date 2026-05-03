import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Image, Upload, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateApp } from "@/lib/useApps";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899"];
const DEFAULT_ICONS = ["🌐", "🔧", "📊", "📝", "🎯", "🚀", "💡", "🎨", "📱", "🔍"];

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().min(1, "URL is required").refine((v) => {
    try { new URL(v.startsWith("http") ? v : `https://${v}`); return true; } catch { return false; }
  }, "Must be a valid URL"),
  icon: z.string().default("🌐"),
  color: z.string().default("#f97316"),
});

type FormValues = z.infer<typeof schema>;
type ImageMode = "upload" | "url";

export default function AddAppDialog() {
  const [open, setOpen] = useState(false);
  const [iconTab, setIconTab] = useState<"emoji" | "image">("emoji");
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewOk, setImagePreviewOk] = useState(false);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createApp = useCreateApp();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", url: "", icon: "🌐", color: "#f97316" },
  });

  const resetImageState = () => {
    setImageUrl("");
    setImagePreviewOk(false);
    setUploadedDataUrl(null);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedDataUrl(dataUrl);
      form.setValue("icon", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImageUrlChange = (val: string) => {
    setImageUrl(val);
    setImagePreviewOk(false);
    if (val) form.setValue("icon", val);
  };

  const getResolvedIcon = () => {
    if (iconTab === "image") {
      if (imageMode === "upload" && uploadedDataUrl) return uploadedDataUrl;
      if (imageMode === "url" && imageUrl && imagePreviewOk) return imageUrl;
    }
    return form.getValues("icon") || "🌐";
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setSaveError("");
    const url = values.url.startsWith("http") ? values.url : `https://${values.url}`;
    const icon = getResolvedIcon();
    const result = await createApp({ ...values, url, icon });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? "Failed to save app.");
      return;
    }
    form.reset();
    resetImageState();
    setIconTab("emoji");
    setImageMode("upload");
    setSaveError("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { resetImageState(); setIconTab("emoji"); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-panel border-white/10">
        <DialogHeader>
          <DialogTitle>Add New App</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>App Name</FormLabel>
                <FormControl><Input placeholder="e.g. GitHub" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl><Input placeholder="e.g. github.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-2">
              <p className="text-sm font-medium leading-none">Icon</p>
              <Tabs value={iconTab} onValueChange={(v) => setIconTab(v as "emoji" | "image")}>
                <TabsList className="w-full">
                  <TabsTrigger value="emoji" className="flex-1">Emoji</TabsTrigger>
                  <TabsTrigger value="image" className="flex-1 gap-1.5">
                    <Image className="w-3.5 h-3.5" />Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emoji" className="mt-3">
                  <FormField control={form.control} name="icon" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          <Input maxLength={4} {...field} className="text-center text-xl" />
                          <div className="flex flex-wrap gap-1">
                            {DEFAULT_ICONS.map((emoji) => (
                              <button key={emoji} type="button" onClick={() => form.setValue("icon", emoji)}
                                className="w-8 h-8 text-lg rounded hover:bg-white/10 transition-colors flex items-center justify-center">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </TabsContent>

                <TabsContent value="image" className="mt-3 space-y-3">
                  <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                    <button type="button" onClick={() => { setImageMode("upload"); resetImageState(); }}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        imageMode === "upload" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
                      <Upload className="w-3.5 h-3.5" />Upload file
                    </button>
                    <button type="button" onClick={() => { setImageMode("url"); resetImageState(); }}
                      className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        imageMode === "url" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
                      <Link2 className="w-3.5 h-3.5" />Paste URL
                    </button>
                  </div>

                  {imageMode === "upload" && (
                    <div>
                      {uploadedDataUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <img src={uploadedDataUrl} alt="Uploaded icon" className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-400 font-medium">Image ready</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Click below to change</p>
                          </div>
                          <button type="button" onClick={() => { setUploadedDataUrl(null); form.setValue("icon", "🌐"); }}
                            className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={cn("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                            isDragging ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary/40 hover:bg-white/5")}>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drop an image here or <span className="text-primary">browse</span></p>
                          <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, SVG, WebP</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                      {uploadedDataUrl && (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground text-center transition-colors">
                          Choose a different file
                        </button>
                      )}
                    </div>
                  )}

                  {imageMode === "url" && (
                    <div className="space-y-3">
                      <Input placeholder="https://example.com/icon.png" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} />
                      {imageUrl && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={imageUrl} alt="Preview" className="w-10 h-10 object-contain rounded"
                              onLoad={() => setImagePreviewOk(true)} onError={() => setImagePreviewOk(false)} />
                          </div>
                          <p className={`text-xs ${imagePreviewOk ? "text-green-400" : "text-muted-foreground"}`}>
                            {imagePreviewOk ? "Image loaded successfully" : "Loading preview…"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Accent Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input type="color" {...field} className="h-9 w-14 p-1 cursor-pointer flex-shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {ACCENT_COLORS.map((color) => (
                        <button key={color} type="button" onClick={() => form.setValue("color", color)}
                          className="w-6 h-6 rounded-full border-2 transition-all"
                          style={{ backgroundColor: color, borderColor: field.value === color ? "white" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )} />

            {saveError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving} className="shadow-lg shadow-primary/20">
                {saving ? "Saving…" : "Add App"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
