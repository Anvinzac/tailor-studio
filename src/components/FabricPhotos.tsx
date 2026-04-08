import React, { useRef } from 'react';
import { FabricSample } from '@/types/customer';
import { Camera, X, Plus } from 'lucide-react';

interface FabricPhotosProps {
  samples: FabricSample[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onImageUpload: (id: string, file: File) => void;
}

const FabricPhotos: React.FC<FabricPhotosProps> = ({
  samples,
  onAdd,
  onRemove,
  onNoteChange,
  onImageUpload,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading text-foreground">Mẫu vải</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium gradient-warm text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm mẫu
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {samples.map((sample) => (
          <div key={sample.id} className="relative rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => onRemove(sample.id)}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-foreground/70 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-background" />
            </button>
            <FabricImageSlot
              imageUrl={sample.imageUrl}
              onUpload={(file) => onImageUpload(sample.id, file)}
            />
            <div className="p-2">
              <input
                type="text"
                value={sample.note}
                onChange={(e) => onNoteChange(sample.id, e.target.value)}
                placeholder="Ghi chú mẫu vải..."
                className="w-full text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-body"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FabricImageSlot: React.FC<{
  imageUrl: string | null;
  onUpload: (file: File) => void;
}> = ({ imageUrl, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="aspect-square bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors relative"
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Fabric sample" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Camera className="w-6 h-6" />
          <span className="text-[10px]">Chụp ảnh</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
};

export default FabricPhotos;
