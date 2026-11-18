"use client";

import * as React from "react";
import { File as FileIcon, FileArchive, FileAudio, FileSpreadsheet, FileText, FileType, Paperclip, Presentation, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import Customer from "@/core/models/domain/Customer";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const VIDEO_EXT = ["mp4", "mov", "avi", "mkv", "webm", "m4v"];

interface CustomerFile {
  id: string;
  url: string;
}

interface Props {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
}

const extOf = (url: string) => (url.split(".").pop() || "").toLowerCase();
const fileHref = (url: string) => `/api/public/files?fileUrl=${encodeURIComponent(url)}`;

function FileTypeIcon({ ext }: { ext: string }) {
  const cls = "w-12 h-12";
  if (ext === "pdf") return <FileText className={`${cls} text-red-600`} />;
  if (["doc", "docx", "rtf"].includes(ext)) return <FileType className={`${cls} text-blue-600`} />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className={`${cls} text-green-600`} />;
  if (["ppt", "pptx"].includes(ext)) return <Presentation className={`${cls} text-orange-600`} />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FileArchive className={`${cls} text-yellow-600`} />;
  if (["txt", "md", "log"].includes(ext)) return <FileText className={`${cls} text-muted-foreground`} />;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return <FileAudio className={`${cls} text-purple-500`} />;
  return <FileIcon className={`${cls} text-muted-foreground`} />;
}

function FileTile({ file, onDelete }: { file: CustomerFile; onDelete: (file: CustomerFile) => void }) {
  const ext = extOf(file.url);
  const href = fileHref(file.url);
  const isImage = IMAGE_EXT.includes(ext);
  const isVideo = VIDEO_EXT.includes(ext);

  const sizeCls = isImage || isVideo ? "w-[300px] h-[200px]" : "w-28 h-28";

  return (
    <div className={`flex flex-col gap-1 ${isImage || isVideo ? "w-[300px]" : "w-28"}`}>
      <a href={href} target="_blank" rel="noopener noreferrer" title={file.url.split("/").pop()}
        className={`flex ${sizeCls} flex-col items-center justify-center overflow-hidden rounded border border-border bg-muted`}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={href} alt="" className="w-full h-full object-cover" />
        ) : isVideo ? (
          <video src={href} preload="metadata" muted className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <>
            <FileTypeIcon ext={ext} />
            <span className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{ext}</span>
          </>
        )}
      </a>
      <ButtonCustom variant="red" size="sm" type="button" className="w-full" onClick={() => onDelete(file)}>
        Delete
      </ButtonCustom>
    </div>
  );
}

export default function CustomerFilesDialog({ customer, open, onOpenChange, location }: Props) {
  const [files, setFiles] = React.useState<CustomerFile[]>([]);
  const [selected, setSelected] = React.useState<File | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<CustomerFile | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const headers = { "X-Resort-Location": location };

  const load = React.useCallback(async () => {
    if (!customer) return;
    setIsBusy(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/files`, { headers: { "X-Resort-Location": location } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setFiles(json.data);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to load files.");
    } finally {
      setIsBusy(false);
    }
  }, [customer, location]);

  React.useEffect(() => {
    if (open) {
      setSelected(null);
      setFiles([]);
      load();
    }
  }, [open, load]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_FILE_SIZE) {
      toast("File size must not exceed 10MB.");
      e.target.value = "";
      setSelected(null);
      return;
    }
    setSelected(f);
  };

  const upload = async () => {
    if (!customer || !selected) return;
    setIsBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", selected);
      const res = await fetch(`/api/customers/${customer.id}/files`, { method: "POST", headers, body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSelected(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed.");
      setIsBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null);
    setIsBusy(true);
    try {
      const res = await fetch(`/api/medias/${target.id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error((await res.json()).message);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed.");
      setIsBusy(false);
    }
  };

  const visuals = files.filter(f => [...IMAGE_EXT, ...VIDEO_EXT].includes(extOf(f.url)));
  const others = files.filter(f => ![...IMAGE_EXT, ...VIDEO_EXT].includes(extOf(f.url)));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", minWidth: "80vw", height: "90vh", maxHeight: "90vh" }}
          className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Files - {customer?.name}</DialogTitle>
            <DialogDescription>Upload files up to 10MB each.</DialogDescription>
          </DialogHeader>
          <div className="flex w-full max-w-xl items-center gap-2 rounded-md border border-dashed border-input bg-muted/40 p-2">
            <input ref={inputRef} type="file" onChange={onSelect} disabled={isBusy} className="hidden" />
            <ButtonCustom variant="black" size="sm" type="button" disabled={isBusy} onClick={() => inputRef.current?.click()}>
              <Paperclip aria-hidden="true" className="mr-1 size-4" />
              Choose file
            </ButtonCustom>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground" title={selected?.name}>
              {selected ? `${selected.name} (${(selected.size / 1024 / 1024).toFixed(2)} MB)` : "No file selected"}
            </span>
            <ButtonCustom variant="black" size="sm" type="button" disabled={!selected || isBusy} onClick={upload}>
              <Upload aria-hidden="true" className="mr-1 size-4" />
              Upload
            </ButtonCustom>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 text-sm font-semibold">Images &amp; Videos</div>
              <div className="flex flex-row flex-wrap gap-4">
                {visuals.map(f => <FileTile key={f.id} file={f} onDelete={setToDelete} />)}
              </div>
              {!visuals.length && !isBusy && <div className="text-sm text-muted-foreground">None</div>}
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Other Files</div>
              <div className="flex flex-row flex-wrap gap-4">
                {others.map(f => <FileTile key={f.id} file={f} onDelete={setToDelete} />)}
              </div>
              {!others.length && !isBusy && <div className="text-sm text-muted-foreground">None</div>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={toDelete !== null} onOpenChange={(o) => { if (!o) setToDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm!</DialogTitle>
            <DialogDescription>Are you sure you want to delete this file?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ButtonCustom variant="red" type="button" onClick={confirmDelete}>Yes</ButtonCustom>
            <ButtonCustom variant="black" type="button" onClick={() => setToDelete(null)}>No</ButtonCustom>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
