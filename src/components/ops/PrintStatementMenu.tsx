import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { printCustomerStatement, SCOPE_LABEL, type StatementScope } from "@/lib/print-statement";

export function PrintStatementMenu({ customerId, size }: { customerId: string; size?: "sm" | "default" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}><Printer className="mr-2 h-4 w-4" /> Print statement</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(Object.keys(SCOPE_LABEL) as StatementScope[]).map((s) => (
          <DropdownMenuItem key={s} onClick={() => printCustomerStatement(customerId, s)}>{SCOPE_LABEL[s]}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
