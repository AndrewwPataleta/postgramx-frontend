import { useState } from "react";
import { ArrowRight, Bot, Check, Loader2, ShieldCheck, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FlowLayout from "@/components/add-channel/FlowLayout";
import { ROUTES } from "@/constants/routes";

export default function AddChannel() {
  const steps = [
    "Connect Channel",
    "Confirm Channel",
    "Grant Access",
    "Verification",
    "Connected",
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [channelInput, setChannelInput] = useState("");
  const navigate = useNavigate();

  const goNext = () => {
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goPrev = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  return (
    <FlowLayout
      title={steps[activeStep]}
      footerMode={activeStep === 0 ? "sticky" : "fixed"}
      footerPaddingClassName={
        activeStep === 0
          ? "pb-[calc(24px+var(--tg-content-safe-area-inset-bottom))]"
          : activeStep === 1 || activeStep === 2 || activeStep === 4
            ? "pb-[calc(140px+var(--tg-content-safe-area-inset-bottom))]"
            : "pb-[calc(88px+var(--tg-content-safe-area-inset-bottom))]"
      }
      footer={
        activeStep === 0 ? (
          <button
            onClick={goNext}
            disabled={!channelInput.trim()}
            className="button-primary text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : activeStep === 1 ? (
          <div className="space-y-2">
            <button onClick={goNext} className="button-primary text-base font-semibold">
              Continue
            </button>
            <button
              onClick={() => setActiveStep(0)}
              className="button-secondary text-base font-semibold"
            >
              Change channel
            </button>
          </div>
        ) : activeStep === 2 ? (
          <div className="space-y-2">
            <button onClick={goNext} className="button-primary text-base font-semibold">
              I added the bot
            </button>
            <button className="button-secondary text-base font-semibold">
              Open Telegram Settings
            </button>
          </div>
        ) : activeStep === 3 ? (
          <button onClick={goNext} className="button-primary text-base font-semibold">
            Verify
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => navigate(ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE("1"))}
              className="button-primary text-base font-semibold"
            >
              Create listing
            </button>
            <button
              onClick={() => navigate(ROUTES.CHANNELS)}
              className="button-secondary text-base font-semibold"
            >
              Back to My Channels
            </button>
          </div>
        )
      }
    >
      {activeStep === 0 && (
        <div className="glass p-4 space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Channel username or link
          </label>
          <input
            type="text"
            placeholder="@mychannel or https://t.me/mychannel"
            value={channelInput}
            onChange={(event) => setChannelInput(event.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Public channels only. You must be an admin of the channel.
          </p>
        </div>
      )}

      {activeStep === 1 && (
        <div className="glass p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 text-lg">
              F
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">FlowgramX Updates</p>
              <p className="text-xs text-muted-foreground">@flowgramx_updates</p>
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-secondary/30 px-3 py-1">
              Public Channel
            </span>
            <span className="rounded-full border border-border/60 bg-secondary/30 px-3 py-1">
              84.2K subscribers
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="rounded-lg bg-secondary/30 px-3 py-2">
              <p>Subscribers</p>
              <p className="text-sm font-semibold text-foreground">84,200</p>
            </div>
            <div className="rounded-lg bg-secondary/30 px-3 py-2">
              <p>Visibility</p>
              <p className="text-sm font-semibold text-foreground">Public</p>
            </div>
          </div>
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            You must be an admin to continue.
          </p>
        </div>
      )}

      {activeStep === 2 && (
        <div className="glass p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <UserCog className="h-5 w-5" />
            <ArrowRight className="h-4 w-4" />
            <Bot className="h-5 w-5" />
          </div>
          <div className="space-y-3 text-sm text-foreground">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                1
              </span>
              <p>Open channel settings → Administrators.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                2
              </span>
              <p>Add @FlowgramXBot as admin.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                3
              </span>
              <p>Enable “Post Messages” permission.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            We only post verified ads that you approve. No spam or edits.
          </p>
        </div>
      )}

      {activeStep === 3 && (
        <div className="glass p-4 space-y-2 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">Verifying channel...</p>
          <p className="text-xs text-muted-foreground">
            Checking admin permissions and channel data.
          </p>
        </div>
      )}

      {activeStep === 4 && (
        <div className="glass p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Channel connected</p>
              <p className="text-xs text-muted-foreground">Ready for monetization</p>
            </div>
          </div>
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span>Subscribers</span>
              <span className="text-sm font-semibold text-foreground">84,200</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span>Avg views</span>
              <span className="text-sm font-semibold text-foreground">31,500</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span>Verification</span>
              <span className="flex items-center gap-1 text-success">
                <ShieldCheck className="h-4 w-4" /> Connected via Telegram
              </span>
            </div>
          </div>
        </div>
      )}
    </FlowLayout>
  );
}
