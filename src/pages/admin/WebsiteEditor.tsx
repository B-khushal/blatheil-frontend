import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, MoveVertical, Plus, Trash2, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";

// Import the actual Website Component exactly as it is for the Live Preview
import IndexPreview from "../Index";

// Define Sortable Item Component for Collections
function SortableCollectionItem({ id, item, updateItem, removeItem }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-4 items-center bg-card border border-border p-4 rounded-md mb-3">
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0">
        <MoveVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <input 
          type="text" 
          value={item.title} 
          onChange={(e) => updateItem(id, "title", e.target.value)} 
          className="w-full bg-background border border-input rounded-sm px-3 py-1.5 text-sm" 
          placeholder="Collection Title" 
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-muted-foreground">Image</label>
          <div className="bg-background border border-border p-2 rounded-sm border-dashed">
             <ImageUpload
               onImagesUploaded={(urls) => updateItem(id, "image", urls[0])}
               onError={(e) => toast.error(e)}
               multiple={false}
               maxImages={1}
               existingImages={item.image ? [item.image] : []}
             />
          </div>
          <input 
            type="text" 
            value={item.redirectLink} 
            onChange={(e) => updateItem(id, "redirectLink", e.target.value)} 
            className="w-full bg-background border border-input rounded-sm px-3 py-1.5 text-sm" 
            placeholder="Link (e.g., /shop)" 
          />
        </div>
      </div>
      <button onClick={() => removeItem(id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors shrink-0">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

const WebsiteEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>({
    heroSection: {},
    collectionsSection: [],
    nextDropSection: {}
  });

  useEffect(() => {
    fetchWebsiteContent();
  }, []);

  const fetchWebsiteContent = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_URL}/admin/website-content`);
      const data = await res.json();
      setContent(data);
    } catch (error) {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {      
      const adminAuthRaw = localStorage.getItem("admin-auth-storage");
      let tokenValue = "";
      if (adminAuthRaw) {
          try {
              const parsed = JSON.parse(adminAuthRaw);
              if (parsed.state && parsed.state.token) {
                  tokenValue = parsed.state.token;
              }
          } catch(e){}
      }
      if(!tokenValue) tokenValue = localStorage.getItem("token") || localStorage.getItem("sb-blatheil-auth-token") || "";

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_URL}/admin/website-content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenValue}`
        },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success("Website successfully updated and published!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (e: any) => {
    setContent((prev: any) => ({
      ...prev,
      heroSection: { ...prev.heroSection, [e.target.name]: e.target.value }
    }));
  };

  const handleNextDropChange = (e: any) => {
    setContent((prev: any) => ({
      ...prev,
      nextDropSection: { ...prev.nextDropSection, [e.target.name]: e.target.value }
    }));
  };

  // Drag and Drop Collections setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setContent((prev: any) => {
        const oldIndex = prev.collectionsSection.findIndex((item: any) => item.id === active.id);
        const newIndex = prev.collectionsSection.findIndex((item: any) => item.id === over.id);
        const newArray = arrayMove(prev.collectionsSection, oldIndex, newIndex);
        return { 
          ...prev, 
          collectionsSection: newArray.map((item: any, idx: number) => ({ ...item, displayOrder: idx + 1 })) 
        };
      });
    }
  };

  const addCollection = () => {
    setContent((prev: any) => ({
      ...prev,
      collectionsSection: [
        ...prev.collectionsSection, 
        { id: Math.random().toString(), title: "New Item", image: "", redirectLink: "/shop", displayOrder: prev.collectionsSection.length + 1 }
      ]
    }));
  };

  const updateCollectionItem = (id: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      collectionsSection: prev.collectionsSection.map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeCollectionItem = (id: string) => {
    setContent((prev: any) => ({
      ...prev,
      collectionsSection: prev.collectionsSection.filter((item: any) => item.id !== id)
    }));
  };


  if (loading) return (
    <AdminLayout>
      <div className="h-full flex items-center justify-center p-8 bg-background border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="h-full flex flex-col md:flex-row bg-background w-full border border-border rounded-md overflow-hidden">
        {/* LEFT PANE - Editor */}
        <div className="w-full md:w-1/2 lg:w-2/5 border-r border-border h-[calc(100vh-100px)] flex flex-col bg-card relative">
          <div className="p-4 border-b border-border flex justify-between items-center bg-card shrink-0 shadow-sm z-10">
            <div>
              <h1 className="text-xl font-heading font-bold uppercase tracking-wider">Website CMS</h1>
              <p className="text-xs text-muted-foreground mt-1">Real-time design editor</p>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground font-heading uppercase tracking-widest text-xs rounded-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Tabs defaultValue="hero" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="collections">Cards</TabsTrigger>
                <TabsTrigger value="drop">Drop</TabsTrigger>
              </TabsList>

              {/* HERO SECTION */}
              <TabsContent value="hero" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading uppercase text-sm text-primary tracking-widest">Hero Configuration</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground uppercase">{content.heroSection?.isActive ? 'Visible' : 'Hidden'}</span>
                    <Switch 
                      checked={content.heroSection?.isActive} 
                      onCheckedChange={(c) => setContent((prev: any) => ({ ...prev, heroSection: { ...prev.heroSection, isActive: c } }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Heading Title</label>
                    <input 
                      name="title" 
                      value={content.heroSection?.title || ""} 
                      onChange={handleHeroChange} 
                      className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Subtitle</label>
                    <input 
                      name="subtitle" 
                      value={content.heroSection?.subtitle || ""} 
                      onChange={handleHeroChange} 
                      className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Button Text</label>
                      <input 
                        name="buttonText" 
                        value={content.heroSection?.buttonText || ""} 
                        onChange={handleHeroChange} 
                        className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Button Link</label>
                      <input 
                        name="buttonLink" 
                        value={content.heroSection?.buttonLink || ""} 
                        onChange={handleHeroChange} 
                        className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Background Image</label>
                    <div className="bg-background border border-border p-2 rounded-sm border-dashed">
                      <ImageUpload
                        onImagesUploaded={(urls) => setContent((prev: any) => ({...prev, heroSection: {...prev.heroSection, desktopImage: urls[0]}}))}
                        onError={(e) => toast.error(e)}
                        multiple={false}
                        maxImages={1}
                        existingImages={content.heroSection?.desktopImage ? [content.heroSection.desktopImage] : []}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* COLLECTIONS SECTION */}
              <TabsContent value="collections" className="space-y-6">
                 <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading uppercase text-sm text-primary tracking-widest">Lookbook Cards</h3>
                  <button onClick={addCollection} className="text-xs flex items-center gap-1 bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-sm transition-colors text-foreground">
                    <Plus className="w-3 h-3" /> Add Card
                  </button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={(content.collectionsSection || []).map((i:any) => i.id)} strategy={verticalListSortingStrategy}>
                    {(content.collectionsSection || []).map((item: any) => (
                      <SortableCollectionItem 
                        key={item.id} 
                        id={item.id} 
                        item={item} 
                        updateItem={updateCollectionItem} 
                        removeItem={removeCollectionItem} 
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </TabsContent>

              {/* NEXT DROP SECTION */}
              <TabsContent value="drop" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading uppercase text-sm text-primary tracking-widest">Next Drop Incoming</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground uppercase">{content.nextDropSection?.isVisible ? 'Visible' : 'Hidden'}</span>
                    <Switch 
                      checked={content.nextDropSection?.isVisible} 
                      onCheckedChange={(c) => setContent((prev: any) => ({ ...prev, nextDropSection: { ...prev.nextDropSection, isVisible: c } }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Title</label>
                    <input 
                      name="title" 
                      value={content.nextDropSection?.title || ""} 
                      onChange={handleNextDropChange} 
                      className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Description</label>
                    <textarea 
                      name="description" 
                      value={content.nextDropSection?.description || ""} 
                      onChange={handleNextDropChange} 
                      rows={3}
                      className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm resize-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Countdown Target Date</label>
                    <input 
                      type="datetime-local"
                      name="countdownDate" 
                      value={content.nextDropSection?.countdownDate ? new Date(content.nextDropSection.countdownDate).toISOString().slice(0, 16) : ""} 
                      onChange={(e) => setContent((prev: any) => ({ ...prev, nextDropSection: { ...prev.nextDropSection, countdownDate: e.target.value } }))} 
                      className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm dark:[color-scheme:dark]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block tracking-wider">Background Image</label>
                    <div className="bg-background border border-border p-2 rounded-sm border-dashed">
                      <ImageUpload
                        onImagesUploaded={(urls) => setContent((prev: any) => ({...prev, nextDropSection: {...prev.nextDropSection, image: urls[0]}}))}
                        onError={(e) => toast.error(e)}
                        multiple={false}
                        maxImages={1}
                        existingImages={content.nextDropSection?.image ? [content.nextDropSection.image] : []}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT PANE - Live Preview */}
        <div className="hidden md:flex flex-1 bg-[#09090b] h-[calc(100vh-100px)] flex-col">
          <div className="h-14 border-b border-border bg-card flex items-center justify-center gap-2 shrink-0 text-muted-foreground z-10 shadow-sm">
            <LayoutTemplate className="w-4 h-4" />
            <span className="text-xs font-heading tracking-widest uppercase">Live Screen Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto relative w-full pointer-events-auto custom-scrollbar border-l border-border bg-background transform origin-top will-change-transform contain-strict">
            {/* We render the Index component directly, passing the draft CMS content down! */}
            <div className="w-full min-h-max sm:scale-[0.8] md:scale-[0.85] lg:scale-[0.9] xl:scale-100 origin-top bg-background p-1">
               <IndexPreview cmsDraft={content} isPreviewMode={true} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WebsiteEditor;
