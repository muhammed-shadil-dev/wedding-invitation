import { Invitation } from "@/components/shell/Invitation";
import { InvitationProvider } from "@/components/shell/InvitationProvider";

export default function Page() {
  return (
    <InvitationProvider>
      <Invitation />
    </InvitationProvider>
  );
}
