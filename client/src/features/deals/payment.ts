export const buildTonTransferLink = (params: {
  address: string;
  amountTon: number;
  memo?: string;
}) => {
  const { address, amountTon, memo } = params;
  const amountNano = Math.round(amountTon * 1e9);
  const search = new URLSearchParams();
  if (Number.isFinite(amountNano) && amountNano > 0) {
    search.set("amount", amountNano.toString());
  }
  if (memo) {
    search.set("text", memo);
  }
  const query = search.toString();
  return `ton://transfer/${address}${query ? `?${query}` : ""}`;
};

export const buildTelegramWalletTransferLink = (params: {
  address: string;
  amountTon: number;
  memo?: string;
}) => {
  const tonLink = buildTonTransferLink(params);
  return `https://t.me/wallet?start=${encodeURIComponent(tonLink)}`;
};

export function buildTonTransferLinkFromNano(params: {
  address: string;
  amountNano: string | bigint;
  memo?: string;
}) {
  const amount = typeof params.amountNano === "bigint"
    ? params.amountNano.toString()
    : params.amountNano;

  const text = params.memo ? `&text=${encodeURIComponent(params.memo)}` : "";


  return `ton://transfer/${params.address}?amount=${amount}${text}`;
}


export const buildTelegramWalletTransferLinkFromNano = (params: {
  address: string;
  amountNano: string | bigint;
  memo?: string;
}) => {
  const tonLink = buildTonTransferLinkFromNano(params);
  return `https://t.me/wallet?start=${encodeURIComponent(tonLink)}`;
};

export const buildTonConnectTransaction = (params: {
  address: string;
  amountTon: number;
}) => {
  const { address, amountTon } = params;
  const amountNano = Math.round(amountTon * 1e9);

  return {
    validUntil: Math.floor(Date.now() / 1000) + 60,
    messages: [
      {
        address,
        amount: amountNano.toString(),
      },
    ],
  };
};
