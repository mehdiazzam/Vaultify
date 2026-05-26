import { Plus } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { useGlobalActions } from "../../hooks/useGlobalActions";

export function NewAccountAction() {
  const { openAction } = useGlobalActions();

  return (
    <GlassCard
      onClick={() => openAction('account')}
      className="cursor-pointer grow-0 shrink-0 basis-[31%]"
    >
      <div className="flex flex-col h-full justify-center items-center gap-3 mb-4">
        <div className="mx-auto w-10 h-10 rounded-2xl flex items-center justify-center text-white">
          <Plus size={32} />
        </div>
      </div>
    </GlassCard>
  );
}

export default NewAccountAction;
