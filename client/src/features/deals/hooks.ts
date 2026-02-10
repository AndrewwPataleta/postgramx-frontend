import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateDealPayload } from "./types";
import {
  approveCreative,
  createDeal,
  getDeal,
  getDeals,
  requestEdits,
  simulatePayment,
  simulatePost,
  simulateVerifyFail,
  simulateVerifyPass,
} from "./api";
import { getDealCategory } from "./status";
import { getErrorMessage } from "@/lib/api/errors";
import { useLanguage } from "@/i18n/LanguageProvider";

type DealTab = "active" | "pending" | "completed";

const dealsKeys = {
  all: ["deals"] as const,
  list: (tab?: DealTab) => ["deals", "list", tab] as const,
  detail: (id: string) => ["deals", "detail", id] as const,
};

export const useDeals = (tab: DealTab) =>
  useQuery({
    queryKey: dealsKeys.list(tab),
    queryFn: getDeals,
    select: (data) => data.filter((deal) => getDealCategory(deal) === tab),
  });

export const useDeal = (id?: string) =>
  useQuery({
    queryKey: id ? dealsKeys.detail(id) : dealsKeys.detail("unknown"),
    queryFn: () => {
      if (!id) {
        throw new Error("Missing deal ID");
      }
      return getDeal(id);
    },
    enabled: Boolean(id),
  });

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(payload),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Request sent");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create deal", t));
    },
  });
};

export const useApproveCreative = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => approveCreative(id),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Creative approved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to approve creative", t));
    },
  });
};

export const useRequestEdits = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => requestEdits(id, note),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Edits requested");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to request edits", t));
    },
  });
};

export const useSimulatePayment = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => simulatePayment(id),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Payment confirmed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to process payment", t));
    },
  });
};

export const useSimulatePost = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => simulatePost(id),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Post published");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to simulate post", t));
    },
  });
};

export const useSimulateVerifyPass = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => simulateVerifyPass(id),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Escrow released");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to simulate release", t));
    },
  });
};

export const useSimulateVerifyFail = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (id: string) => simulateVerifyFail(id),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.setQueryData(dealsKeys.detail(deal.id), deal);
      toast.success("Deal refunded");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to simulate refund", t));
    },
  });
};
