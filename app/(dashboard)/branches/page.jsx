import { BranchesTable } from "@/components/BranchesTable";

export default function BranchesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Branches</h1>
      <BranchesTable />
    </div>
  );
}
