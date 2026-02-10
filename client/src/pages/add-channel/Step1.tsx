import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { previewChannel } from "@/api/features/channelsApi";
import { getChannelErrorMessage } from "@/pages/add-channel/errorMapping";
import { useAddChannelFlow } from "@/pages/add-channel/useAddChannelFlow";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const AddChannelStep1 = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { state, setUsernameOrLink, setPreview, setLinkedChannelId, setVerifyStatus, setLastError } =
    useAddChannelFlow();
  const [usernameInput, setUsernameInput] = useState(state.usernameOrLink);
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    setUsernameInput(state.usernameOrLink);
  }, [state.usernameOrLink]);

  const previewMutation = useMutation({
    mutationFn: (usernameOrLink: string) => previewChannel({ usernameOrLink }),
    onSuccess: (response, variables) => {
      setPreview(response);
      setUsernameOrLink(variables);
      setLinkedChannelId(null);
      setVerifyStatus("idle");
      setLastError(null);
      setInlineError(null);
      navigate(ROUTES.ADD_CHANNEL_STEP("step-2"));
    },
    onError: (error) => {
      const message = getChannelErrorMessage(error, t("errors.genericTitle"), t);
      setInlineError(message);
      setLastError(message);
      toast.error(message);
    },
  });

  const handleContinue = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      const message = t("errors.validation.channelUsernameRequired");
      setInlineError(message);
      return;
    }
    previewMutation.mutate(trimmed);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          {t("channels.add.step1.title")}
        </h2>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("channels.add.step1.label")}
          </label>
          <Input
            placeholder={t("channels.add.step1.placeholder")}
            value={usernameInput}
            onChange={(event) => {
              const value = event.target.value;
              setUsernameInput(value);
              setUsernameOrLink(value);
              if (inlineError) {
                setInlineError(null);
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t("channels.add.step1.hint")}
          </p>
          {inlineError ? (
            <p className="text-xs font-medium text-destructive">{inlineError}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-auto flex flex-col gap-3">
        <Button
          onClick={handleContinue}
          disabled={previewMutation.isPending || !usernameInput.trim()}
          className="w-full text-sm font-semibold"
        >
          {previewMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("channels.add.step1.checking")}
            </>
          ) : (
            t("common.continue")
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddChannelStep1;
